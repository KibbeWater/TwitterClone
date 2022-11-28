import { getCookie } from 'cookies-next';
import { NextApiRequest, NextApiResponse } from 'next';
import { Connect } from '../../../libs/database';
import User from '../../../schemas/IUser';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });

	const { target, type } = req.body;

	await Connect();

	// target is the user to follow, block, or mute
	if (!target) return res.status(400).json({ success: false, error: 'Bad request' });
	if (type !== 'follow' && type !== 'block' && type !== 'mute' && type !== 'remove')
		return res.status(400).json({ success: false, error: 'Bad request' });

	const token = getCookie('token', { req, res }) as string;
	if (!token) return res.status(401).json({ success: false, error: 'Unauthorized' });

	const user = await User.authenticate(token);
	if (!user) return res.status(401).json({ success: false, error: 'Unauthorized' });

	const dbUser = new User(user);
	const relationship = type !== 'remove' ? await dbUser.createRelationship(target, type) : await dbUser.removeRelationship(target);

	if (!relationship) return res.status(500).json({ success: false, error: 'Internal server error' });

	return res.status(200).json({ success: true, relationship });
}
