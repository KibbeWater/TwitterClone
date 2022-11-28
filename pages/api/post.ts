import { NextApiRequest, NextApiResponse } from 'next';
import { getCookie } from 'cookies-next';
import User, { IUser } from '../../schemas/IUser';
import Post, { IPost } from '../../schemas/IPost';
import DB from '../../libs/database';
import { NormalizeObject } from '../../libs/utils';

function PostReq(req: NextApiRequest, res: NextApiResponse) {
	return new Promise(async (resolve) => {
		if (req.method !== 'POST') return resolve(res.status(405).json({ success: false, error: 'Method not allowed' }));

		const token = getCookie('token', { req, res }) as string;
		if (!token) return resolve(res.status(401).json({ success: false, error: 'Unauthorized' }));

		const { content, quote } = req.body;
		if (!content) return resolve(res.status(400).json({ success: false, error: 'Bad request' }));

		DB(async () => {
			User.authenticate(token)
				.then((user) => {
					if (!user) return resolve(res.status(401).json({ success: false, error: 'Unauthorized' }));

					new User(user)
						.post(content, quote)
						.then((post) => {
							if (!post) return resolve(res.status(500).json({ success: false, error: 'Internal server error' }));
							else return resolve(res.status(200).json({ success: true, post }));
						})
						.catch((error) => {
							return resolve(res.status(500).json({ success: false, error: 'Internal server error' }));
						});
				})
				.catch((err) => {
					console.error(err);
					return resolve(res.status(500).json({ success: false, error: 'Internal server error' }));
				});
		});
	});
}

function GetReq(req: NextApiRequest, res: NextApiResponse) {
	return new Promise(async (resolve) => {
		if (req.method !== 'GET') return resolve(res.status(405).json({ success: false, error: 'Method not allowed' }));

		let { id, page, limit } = req.query;

		const parsedLimit = parseInt(limit as string);
		const parsedPage = parseInt(page as string);

		const pageLimit = isNaN(parsedLimit) ? 10 : parsedLimit;
		const pageNumber = isNaN(parsedPage) ? 0 : parsedPage;

		if (id) return resolve(res.status(200).json({ success: true, post: (await Post.findById(id)) as IPost }));

		DB(async () => {
			const count = await Post.countDocuments();
			const pages = Math.ceil(count / pageLimit);

			// Use pagination to get posts
			Post.find()
				.sort({ date: -1 })
				.skip(pageNumber * pageLimit)
				.limit(pageLimit)
				.populate<{ user: IUser }>('user')
				.populate<{ quote: IPost }>('quote')
				.populate<{ comments: IPost[] }>('comments')
				.lean()
				.exec()
				.then((posts) => {
					const newPosts = posts.map((post) => NormalizeObject<typeof post>(post));

					return resolve(res.status(200).json({ success: true, posts, newPosts }));
				})
				.catch((err) => {
					return resolve(res.status(500).json({ success: false, error: 'Internal server error' }));
				});
		});
	});
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method === 'POST') return PostReq(req, res);
	else if (req.method === 'GET') return GetReq(req, res);
	else return res.status(405).json({ success: false, error: 'Method not allowed' });
}
