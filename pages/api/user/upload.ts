import { getCookie } from 'cookies-next';
import { NextApiRequest, NextApiResponse } from 'next';
import DB, { Connect } from '../../../libs/database';
import User from '../../../schemas/IUser';

export const config = {
	api: {
		bodyParser: {
			sizeLimit: '4mb',
		},
	},
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });

	const { avatar, banner } = req.body;

	// target is the user to follow, block, or mute
	if (!avatar && !banner) return res.status(400).json({ success: false, error: 'Bad request' });

	DB(async () => {
		const token = getCookie('token', { req, res }) as string;
		if (!token) return res.status(401).json({ success: false, error: 'Unauthorized' });

		const user = await User.authenticate(token);
		if (!user) return res.status(401).json({ success: false, error: 'Unauthorized' });

		let result: { avatar?: string; banner?: string } = {};

		if (avatar) {
			const avatarURL = await User.uploadAvatar(user._id, avatar);
			if (!avatarURL) return res.status(500).json({ success: false, error: 'Internal server error' });
			result.avatar = avatarURL;
		}

		if (banner) {
			const bannerURL = await User.uploadBanner(user._id, banner);
			if (!bannerURL) return res.status(500).json({ success: false, error: 'Internal server error' });
			result.banner = bannerURL;
		}

		return res.status(200).json({ success: true, ...result });
	});
}
