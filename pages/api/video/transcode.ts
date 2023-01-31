import { getCookie } from 'cookies-next';
import { NextApiRequest, NextApiResponse } from 'next';
import { Connect } from '../../../libs/database';

import { TranscodeVideo as transcodeJob } from '../../../libs/server/transcoder/transcoder';
import { Group } from '../../../libs/utils';
import User from '../../../schemas/IUser';

function transcodeVideo(req: NextApiRequest, res: NextApiResponse) {
	return new Promise(async (resolve) => {
		const { videoId }: { videoId: string } = req.body;

		await Connect();

		const token = getCookie('token', { req, res }) as string;
		if (!token) return resolve(res.status(401).json({ success: false, error: 'Unauthorized' }));

		// Await user authentication.
		try {
			const user = await User.authenticate(token);
			if (!user) return resolve(res.status(401).json({ success: false, error: 'Unauthorized' }));
			if (user.group !== Group.Admin) return resolve(res.status(401).json({ success: false, error: 'Unauthorized' }));
		} catch (error) {
			return resolve(res.status(401).json({ success: false, error: 'Unauthorized' }));
		}

		if (!videoId) return resolve(res.status(400).json({ success: false, error: 'Bad request' }));

		transcodeJob(videoId, 'mp4')
			.then((result) => {
				resolve(
					res.status(200).json({
						success: true,
						trackId: result.trackId,
						url: `https://${process.env.CLOUDFRONT_DOMAIN as string}/${result.output}`,
					})
				);
			})
			.catch((error) => {
				console.error(error);
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
