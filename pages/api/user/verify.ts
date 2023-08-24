import { getCookie } from 'cookies-next';
import { NextApiRequest, NextApiResponse } from 'next';
import { Connect } from '../../../libs/database';
import { Group } from '../../../libs/utils';
import User from '../../../schemas/IUser';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });

	const { id, isVerified } = req.body;

	await Connect();

	const token = getCookie('token', { req, res }) as string;
	if (!token) return res.status(401).json({ success: false, error: 'Unauthorized' });

	const user = await User.authenticate(token);
	if (!user) return res.status(401).json({ success: false, error: 'Unauthorized' });

	if (user.group != Group.Admin) return res.status(401).json({ success: false, error: 'Unauthorized' });

	const dbUser = await User.findOne({ _id: id }).exec();
	if (!dbUser) return res.status(500).json({ success: false, error: 'UserID does not exist' });

	dbUser.verified = isVerified;

	return res.status(200).json({ success: true, data: await dbUser.save() });
}
