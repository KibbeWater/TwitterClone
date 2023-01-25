import axios from 'redaxios';

// 50 MB
const CHUNK_SIZE = 1024 * 1024 * 10;

type UploadURL = { url: string; partId: number; key: string };
type Part = { chunk: ArrayBuffer; pardId: number; url: UploadURL };
type ETagRes = { part: number; etag: string };

export class MultipartUploader {
	private data: ArrayBuffer;
	private chunks: ArrayBuffer[] = [];

	private uploadURLs: UploadURL[] = [];
	private videoId: string = '';
	private uploadId: string = '';

	constructor(file: ArrayBuffer) {
		// Convert the raw buffer into an ArrayBuffer.
		this.data = file;
	}

	public async upload(): Promise<string> {
		return new Promise(async (resolve, reject) => {
			this.chunks = await this.generateChunks(CHUNK_SIZE);

			await this.retreiveUploadInformation();

			const uploadThreads = [...Array(5)].map(() => this.uploadPart(this.dispatchChunk()));

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

		for (let i = 0; i < this.data.byteLength; i += chunkSize) {
			chunks.push(this.data.slice(i, i + chunkSize));
		}

		return chunks;
	}

	private retreiveUploadInformation(): Promise<void> {
		return new Promise((resolve, reject) => {
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
		return new Promise((resolve, reject) => {
			if (retry > 5) return reject();
			if (!part) return resolve(etags);

			axios
				.put(part.url.url, part.chunk)
				.then((res) => {
					let eTag = res.headers.get('etag') as string;
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
