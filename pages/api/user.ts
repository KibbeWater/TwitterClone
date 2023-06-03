import { getCookie } from 'cookies-next';
import { NextApiRequest, NextApiResponse } from 'next';

import DB from '../../libs/database';
import { TransformSafe } from '../../libs/user';
import { NormalizeObject } from '../../libs/utils';
import User, { IUser } from '../../schemas/IUser';
import { IPost } from '../../types/IPost';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== 'GET') return res.status(405).json({ success: false, error: 'Method not allowed' });

	const token = getCookie('token', { req, res }) as string;
	if (!token) return res.status(401).json({ success: false, error: 'Unauthorized' });

	const { id, tag } = req.query;

	DB(async () => {
		if (id) {
			const user = (await User.getUserId(id as string)) as IUser & { posts: IPost[] };
			if (!user) return res.status(404).json({ success: false, error: 'User not found' });

			(user.posts as IPost[]) = user.posts.filter((post: IPost) => !post.parent);

			return res.status(200).json({ success: true, data: TransformSafe(user) });
		}

		if (tag) {
			const user2 = (await User.getUser(tag as string)) as IUser & { posts: IPost[] };
			if (!user2) return res.status(404).json({ success: false, error: 'User not found' });

			(user2.posts as IPost[]) = user2.posts.filter((post: IPost) => !post.parent);

			return res.status(200).json({ success: true, data: TransformSafe(user2) });
		}

		const user = await User.authenticate(token);
		if (!user) return res.status(401).json({ success: false, error: 'Unauthorized' });

		res.status(200).json({ success: true, data: NormalizeObject<typeof user>(user) });
	});
}
