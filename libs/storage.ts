import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
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
				resolve(`https://${process.env.CLOUDFRONT_DOMAIN || ''}/${key}`);
			})
			.catch((err) => {
				reject(err);
			});
	});
}
