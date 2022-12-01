import { getCookie } from 'cookies-next';
import { NextApiRequest, NextApiResponse } from 'next';
import { Connect } from '../../../libs/database';
import User from '../../../schemas/IUser';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });

	const { username, bio, avatar, banner } = req.body;

	await Connect();

	const token = getCookie('token', { req, res }) as string;
	if (!token) return res.status(401).json({ success: false, error: 'Unauthorized' });

	const user = await User.authenticate(token);
	if (!user) return res.status(401).json({ success: false, error: 'Unauthorized' });

	const dbUser = await User.findOne({ _id: user._id }).exec();
	if (!dbUser) return res.status(500).json({ success: false, error: 'Internal Server Error' });

	/* 20 character limit, otherwise cut it */
	let newUsername = username;
	if (newUsername.length > 32) newUsername = newUsername.slice(0, 32);

	if (username !== undefined) dbUser.username = username;
	if (bio !== undefined) dbUser.bio = bio;
	if (avatar !== undefined) dbUser.avatar = avatar;
	if (banner !== undefined) dbUser.banner = banner;

	return res.status(200).json({ success: true, user: await dbUser.save() });
}
