import { AbortMultipartUploadCommand } from '@aws-sdk/client-s3';
import { NextApiRequest, NextApiResponse } from 'next';
import { s3Client, S3_BUCKET } from '../../../../libs/server/storage';

function cancelUpload(req: NextApiRequest, res: NextApiResponse) {
	return new Promise((resolve) => {
		const { videoId, uploadId } = req.body;

		if (!videoId || !uploadId) return resolve(res.status(400).json({ success: false, error: 'Bad request' }));

		s3Client
			.send(
				new AbortMultipartUploadCommand({
					Bucket: S3_BUCKET,
					Key: `video_raw/${videoId}.mp4`,
					UploadId: uploadId,
				})
			)
			.then(() => {
				resolve(res.status(200).json({ success: true }));
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
				cancelUpload(req, res).then(resolve);
				break;

			default:
				resolve(res.status(405).json({ success: false, error: 'Method not allowed' }));
				break;
		}
	});
}
