import { GetObjectCommand, PutObjectCommand, S3Client, UploadPartCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import axios from 'axios';
import { GenerateStorageKey } from './utils';

export const S3_REGION = process.env.S3_REGION || 'us-east-1';

export const s3Client = new S3Client({
	region: S3_REGION,
	credentials: {
		accessKeyId: process.env.S3_ACCESS_KEY_ID as string,
		secretAccessKey: process.env.S3_SECRET_ACCESS_KEY as string,
	},
});

export const S3_BUCKET = process.env.S3_BUCKET as string;

// 50 MB
const CHUNK_SIZE = 1024 * 1024 * 50;

type UploadURL = { url: string; partId: number; key: string; uploadId: string };
type Part = { chunk: ArrayBuffer; pardId: number; url: UploadURL };

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
			// Generate chunks of the file.
			this.chunks = await this.generateChunks(CHUNK_SIZE);

			await this.retreiveUploadInformation();

			console.log(this.uploadURLs);

			const uploadThreads = [...Array(1)].map(() => this.uploadPart(this.dispatchChunk()));

			console.log(uploadThreads);

			Promise.all(uploadThreads)
				.then(() => {
					resolve(this.videoId);
					console.log(uploadThreads);
				})
				.catch((err) => {
					console.error(err);
					/* axios
						.post('/api/video/upload/cancel', {
							videoId: this.videoId,
							uploadId: this.uploadId,
						})
						.then(() => {
							reject('Upload failed, aborted.');
						})
						.catch(() => {
							reject('Upload failed, failed abortion.');
						}); */
				});
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

		console.log('New chunk requested...');

		if (!chunk) return null;

		console.log('Chunk found...');

		const url = this.uploadURLs.find((u) => u.partId === partId);
		if (!url) return null;

		console.log('Matching URL found, dispatching...');

		return { chunk, pardId: partId, url };
	}

	private uploadPart(part: Part | null, retry: number = 0): Promise<void> {
		return new Promise((resolve, reject) => {
			console.log('Uploading part...');

			if (retry > 5) return reject();
			if (!part) return resolve();

			console.log(`Part exists, we're on attempt ${retry}...`);

			axios
				.put(part.url.url, part.chunk)
				.then(() => {
					console.log('Upload successful, dispatching new chunk...');
					const newPart = this.dispatchChunk();
					if (!newPart) {
						console.log('No new chunk found, upload complete.');
						return resolve();
					}

					console.log('New chunk found, uploading...');
					this.uploadPart(newPart)
						.then(() => resolve())
						.catch(() => reject());
				})
				.catch(() => {
					console.log('Upload failed, retrying...');
					this.uploadPart(part, retry + 1)
						.then(() => resolve())
						.catch(() => reject());
				});
		});
	}
}
