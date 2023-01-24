import { CompleteMultipartUploadCommand } from '@aws-sdk/client-s3';
import { NextApiRequest, NextApiResponse } from 'next';

import { s3Client, S3_BUCKET } from '../../../../libs/storage';

function completeUpload(req: NextApiRequest, res: NextApiResponse) {
	return new Promise((resolve) => {
		const { videoId, uploadId, tags }: { videoId: string; uploadId: string; tags: { part: number; etag: string }[] } = req.body;

		if (!videoId || !uploadId || !tags) return resolve(res.status(400).json({ success: false, error: 'Bad request' }));

		s3Client
			.send(
				new CompleteMultipartUploadCommand({
					Bucket: S3_BUCKET,
					Key: `video_raw/${videoId}.mp4`,
					UploadId: uploadId,
					MultipartUpload: {
						Parts: tags
							.map((tag) => ({
								PartNumber: tag.part,
								ETag: tag.etag,
							}))
							.sort((a, b) => a.PartNumber - b.PartNumber),
					},
				})
			)
			.then(() => resolve(res.status(200).json({ success: true })))
			.catch((err) => resolve(res.status(500).json({ success: false, error: 'Internal server error' })));
	});
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
	return new Promise((resolve) => {
		switch (req.method) {
			case 'POST':
				completeUpload(req, res).then(resolve);
				break;

			default:
				resolve(res.status(405).json({ success: false, error: 'Method not allowed' }));
				break;
		}
	});
}
