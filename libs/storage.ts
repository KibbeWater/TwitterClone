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

export function createURL(key: string) {
	return new Promise<string>((resolve, reject) => {
		getSignedUrl(
			s3Client,
			new GetObjectCommand({
				Bucket: S3_BUCKET,
				Key: key,
			})
		)
			.then((url) => {
				resolve(url);
			})
			.catch((err) => {
				reject(err);
			});
	});
}

export function uploadImage(dataUri: string): Promise<string | null> {
	return new Promise<string | null>((resolve, reject) => {
		if (!dataUri.startsWith('data:')) resolve(null);

		const buffer = Buffer.from(dataUri.split(',')[1], 'base64');
		const contentType = dataUri.split(';')[0].split(':')[1];
		const ext = dataUri.split(';')[0].split('/')[1];

		const bucket = S3_BUCKET;
		const key = `images/${GenerateStorageKey()}.${ext}`;

		const command = new PutObjectCommand({
			Bucket: bucket,
			Key: key,
			Body: buffer,
			ContentType: contentType,
		});

		s3Client
			.send(command)
			.then((data) => {
				resolve(`https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${key}`);
			})
			.catch((err) => {
				reject(err);
			});
	});
}

export function videoChunkUpload(fileName: string, partId: number, uploadId: string) {
	return new Promise<string | null>((resolve, reject) => {
		const bucket = S3_BUCKET;
		const key = `video-raw/${fileName}`;

		getSignedUrl(
			s3Client,
			new UploadPartCommand({
				Bucket: bucket,
				Key: key,
				PartNumber: partId,
				UploadId: uploadId,
			})
		).then((url) => {
			resolve(url);
		});
	});
}

// 50 MB
const CHUNK_SIZE = 1024 * 1024 * 50;

type UploadURL = { url: string; partId: number; key: string; uploadId: string };

export class MultipartUploader {
	private data: ArrayBuffer;
	private chunks: ArrayBuffer[] = [];

	private uploadURLs: UploadURL[] = [];
	private videoId: string = '';
	private uploadKey: string = '';

	constructor(file: string) {
		// Parse file as a data URI, retreive the base64 encoded data and decode it into a raw buffer. Retreive also the content type, length and extension.
		const buffer = Buffer.from(file.split(',')[1], 'base64');
		const contentType = file.split(';')[0].split(':')[1];
		const contentLength = buffer.length;
		const ext = file.split(';')[0].split('/')[1];

		// Convert the raw buffer into an ArrayBuffer.
		this.data = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
	}

	public async upload() {
		// Generate chunks of the file.
		this.chunks = await this.generateChunks(CHUNK_SIZE);

		await this.retreiveUploadInformation();
	}

	private async generateChunks(chunkSize: number) {
		const chunks: ArrayBuffer[] = [];

		for (let i = 0; i < this.data.byteLength; i += chunkSize) {
			chunks.push(this.data.slice(i, i + chunkSize));
		}

		return chunks;
	}

	private retreiveUploadInformation() {
		return new Promise((resolve, reject) => {
			axios
				.post<{ success: boolean; videoId: string; urls: UploadURL[] }>('/api/video/upload', {
					chunks: this.chunks.length,
				})
				.then((res) => {
					this.uploadURLs = res.data.urls;
					this.videoId = res.data.videoId;
				});
		});
	}

	private uploadPart(retry: number = 0) {
		return new Promise((resolve, reject) => {});
	}
}
