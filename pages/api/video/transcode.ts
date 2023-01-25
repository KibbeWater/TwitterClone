import { NextApiRequest, NextApiResponse } from 'next';

import { TranscodeVideo as transcodeJob } from '../../../libs/server/transcoder/transcoder';

function transcodeVideo(req: NextApiRequest, res: NextApiResponse) {
	return new Promise((resolve) => {
		const { videoId }: { videoId: string } = req.body;

		if (!videoId) return resolve(res.status(400).json({ success: false, error: 'Bad request' }));

		transcodeJob(videoId, 'mp4')
			.then((result) => {
				resolve(
					res
						.status(200)
						.json({
							success: true,
							trackId: result.trackId,
							url: `https://${process.env.CLOUDFRONT_DOMAIN as string}/${result.output}`,
						})
				);
			})
			.catch((error) => {
				resolve(res.status(500).json({ success: false, error: 'Internal server error occured' }));
			});
	});
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
	return new Promise((resolve) => {
		switch (req.method) {
			case 'POST':
				transcodeVideo(req, res).then(resolve);
				break;

			default:
				resolve(res.status(405).json({ success: false, error: 'Method not allowed' }));
				break;
		}
	});
}
