import { getCookie } from 'cookies-next';
import { NextApiRequest, NextApiResponse } from 'next';
import DB from '../../libs/database';
import { MakeSafeUser } from '../../libs/user';
import { NormalizeObject } from '../../libs/utils';
import { IPost } from '../../schemas/IPost';
import User, { IUser } from '../../schemas/IUser';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== 'GET') return res.status(405).json({ success: false, error: 'Method not allowed' });

	const token = getCookie('token', { req, res }) as string;
	if (!token) return res.status(401).json({ success: false, error: 'Unauthorized' });

	const { id, tag } = req.query;

	DB(async () => {
		if (id) {
			const user = await User.findById(id)
				.populate<{ posts: IPost[] }>('posts')
				.populate<{ posts: (IPost & { user: IUser; quote: IPost & { user: IUser } })[] }>([
					{ path: 'posts', populate: { path: 'user' } },
					{ path: 'posts', populate: { path: 'quote' } },
					{ path: 'posts', populate: { path: 'quote', populate: { path: 'user' } } },
				])
				.exec();
			if (!user) return res.status(404).json({ success: false, error: 'User not found' });

			return res.status(200).json({ success: true, user: MakeSafeUser(user) });
		}

		if (tag) {
			const user2 = await User.findOne({
				tag: tag.toString(),
			})
				.populate<{ posts: IPost[] }>('posts')
				.populate<{ posts: (IPost & { user: IUser; quote: IPost & { user: IUser } })[] }>([
					{ path: 'posts', populate: { path: 'user' } },
					{ path: 'posts', populate: { path: 'quote' } },
					{ path: 'posts', populate: { path: 'quote', populate: { path: 'user' } } },
				])
				.exec();
			if (!user2) return res.status(404).json({ success: false, error: 'User not found' });

			return res.status(200).json({ success: true, user: MakeSafeUser(user2) });
		}

		const user = await User.authenticate(token);
		if (!user) return res.status(401).json({ success: false, error: 'Unauthorized' });

		res.status(200).json({ success: true, user: NormalizeObject<typeof user>(user) });
	});
}
