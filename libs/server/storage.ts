import { GetObjectCommand, PutObjectCommand, UploadPartCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client, S3_BUCKET, S3_REGION } from '../storage';
import { GenerateStorageKey } from '../utils';

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
		const key = `video_raw/${fileName}`;

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
