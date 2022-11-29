import { getCookie } from 'cookies-next';
import { NextApiRequest, NextApiResponse } from 'next';
import { Connect } from '../../../libs/database';
import User from '../../../schemas/IUser';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });

	const { id, like } = req.body;

	await Connect();

	if (!id || typeof like !== 'boolean') return res.status(400).json({ success: false, error: 'Bad request' });

	const token = getCookie('token', { req, res }) as string;
	if (!token) return res.status(401).json({ success: false, error: 'Unauthorized' });

	const user = await User.authenticate(token);
	if (!user) return res.status(401).json({ success: false, error: 'Unauthorized' });

	const dbUser = new User(user);
	const post = await dbUser.likePost(id, like);

	if (!post) return res.status(500).json({ success: false, error: 'Internal server error' });

	return res.status(200).json({ success: true, post });
}
