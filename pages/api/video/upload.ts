import { CreateMultipartUploadCommand } from '@aws-sdk/client-s3';
import { NextApiRequest, NextApiResponse } from 'next';
import { videoChunkUpload } from '../../../libs/server/storage';
import { s3Client } from '../../../libs/storage';

function initializeUpload(req: NextApiRequest, res: NextApiResponse) {
	return new Promise((resolve) => {
		const { chunks }: { chunks: number } = req.body;

		// Generate random 16 char id for the video.
		const id = [...Array(16)]
			.map(() => (~~(Math.random() * 36)).toString(36))
			.join('')
			.toLowerCase();

		s3Client
			.send(
				new CreateMultipartUploadCommand({
					Bucket: process.env.S3_BUCKET as string,
					Key: `video_raw/${id}.mp4`,
					ContentType: 'video/mp4',
					Metadata: {
						chunks: chunks.toString(),
					},
				})
			)
			.then((data) => {
				const urlPromises = [...Array(chunks)].map((_, i) => {
					return new Promise<{ url: string; partId: number; key: string; uploadId: string }>((resolve) => {
						videoChunkUpload(`${id}.mp4`, i + 1, data.UploadId as string).then((url) =>
							resolve({
								url: url as string,
								partId: i + 1,
								key: `video_raw/${id}.mp4`,
								uploadId: data.UploadId as string,
							})
						);
					});
				});

				Promise.all(urlPromises).then((urls) => {
					resolve(
						res.status(200).json({
							success: true,
							videoId: id,
							uploadId: data.UploadId as string,
							urls: urls,
						})
					);
				});
			})
			.catch(() => {
				resolve(res.status(500).json({ success: false, error: 'Internal server error' }));
			});
	});
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
	return new Promise((resolve) => {
		switch (req.method) {
			case 'POST':
				initializeUpload(req, res).then(resolve);
				break;
			default:
				resolve(res.status(405).json({ message: 'Method not allowed' }));
				break;
		}
	});
}
