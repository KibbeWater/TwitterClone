// 50 MB
const CHUNK_SIZE = 1024 * 1024 * 10;
const CHUNK_MIN_SIZE = 5242880;
const CHUNK_MAX_SIZE = 1024 * 1024 * 30;

type UploadURL = { url: string; partId: number; key: string };
type Part = { chunk: ArrayBuffer; pardId: number; url: UploadURL };
type ETagRes = { part: number; etag: string };

export class MultipartUploader {
	private data: ArrayBuffer;
	private chunks: ArrayBuffer[] = [];

	private uploadURLs: UploadURL[] = [];
	private videoId: string = '';
	private uploadId: string = '';

	constructor(file: string) {
		// Parse file as a data URI, retreive the base64 encoded data and decode it into a raw buffer. Retreive also the content type, length and extension.
		const buffer = Buffer.from(file.split(',')[1], 'base64');
		const contentType = file.split(';')[0].split(':')[1];
		const contentLength = buffer.length;
		const ext = file.split(';')[0].split('/')[1];

		// Convert the raw buffer into an ArrayBuffer.
		this.data = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
	}

	public async upload(): Promise<string> {
		return new Promise(async (resolve, reject) => {
			this.chunks = await this.generateChunks(CHUNK_SIZE);

			await this.retreiveUploadInformation();

			const uploadThreads = [...Array(5)].map(() => this.uploadPart(this.dispatchChunk()));

			const axios = (await import('axios')).default;

			Promise.all(uploadThreads)
				.then((tags) => {
					axios
						.post('/api/video/upload/complete', {
							videoId: this.videoId,
							uploadId: this.uploadId,
							tags: tags.reduce((acc, curr) => [...acc, ...curr], []),
						})
						.then(() => resolve(this.videoId))
						.catch((err) => reject(err));
				})
				.catch((err) =>
					axios
						.post('/api/video/upload/cancel', {
							videoId: this.videoId,
							uploadId: this.uploadId,
						})
						.then(() => reject('Upload failed, aborted.'))
						.catch(() => reject('Upload failed, failed abortion.'))
				);
		});
	}

	private async generateChunks(chunkSize: number) {
		const chunks: ArrayBuffer[] = [];

		let newChunkSize = chunkSize;

		if (this.data.byteLength % chunkSize < CHUNK_MIN_SIZE) {
			while (this.data.byteLength % newChunkSize < CHUNK_MIN_SIZE && newChunkSize <= CHUNK_MAX_SIZE) {
				newChunkSize += 1024 * 1024 * 0.5;
			}

			if (this.data.byteLength % newChunkSize > CHUNK_MAX_SIZE) {
				while (this.data.byteLength % newChunkSize < CHUNK_MIN_SIZE) {
					newChunkSize += 1024 * 1024 * 0.5;
				}
			}
		}

		console.log('We are generating chunks with a size of ' + newChunkSize + ' bytes');

		for (let i = 0; i < this.data.byteLength; i += newChunkSize) {
			chunks.push(this.data.slice(i, i + newChunkSize));
		}

		console.log(
			'We have generated ' + chunks.length + ' chunks',
			chunks.map((c) => c.byteLength)
		);

		return chunks;
	}

	private retreiveUploadInformation(): Promise<void> {
		return new Promise(async (resolve, reject) => {
			const axios = (await import('axios')).default;

			axios
				.post<{ success: boolean; videoId: string; uploadId: string; urls: UploadURL[] }>('/api/video/upload', {
					chunks: this.chunks.length,
				})
				.then((res) => {
					this.uploadURLs = res.data.urls;
					this.videoId = res.data.videoId;
					this.uploadId = res.data.uploadId;
					resolve();
				});
		});
	}

	private currentPart = 1;
	private dispatchChunk(): Part | null {
		const chunk = this.chunks.shift();
		const partId = this.currentPart++;

		if (!chunk) return null;

		const url = this.uploadURLs.find((u) => u.partId === partId);
		if (!url) return null;

		return { chunk, pardId: partId, url };
	}

	private uploadPart(part: Part | null, etags: ETagRes[] = [], retry: number = 0): Promise<ETagRes[]> {
		return new Promise(async (resolve, reject) => {
			if (retry > 5) return reject();
			if (!part) return resolve(etags);

			const axios = (await import('axios')).default;

			axios
				.put(part.url.url, part.chunk, {})
				.then((res) => {
					let eTag = res.headers.etag as string;
					eTag = eTag.replaceAll('"', '');

					const newPart = this.dispatchChunk();
					if (!newPart) return resolve([...etags, { part: part.pardId, etag: eTag }]);

					this.uploadPart(newPart, etags)
						.then((tags) => resolve([...tags, { part: part.pardId, etag: eTag }]))
						.catch(() => reject());
				})
				.catch((err) =>
					this.uploadPart(part, etags, retry + 1)
						.then((tags) => resolve(tags))
						.catch(() => reject())
				);
		});
	}
}
