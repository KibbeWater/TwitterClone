import { NextApiRequest, NextApiResponse } from 'next';
import { getCookie } from 'cookies-next';
import User, { IUser } from '../../schemas/IUser';
import Post, { IPost } from '../../schemas/IPost';
import DB from '../../libs/database';

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

		const pageLimit = parseInt(limit as string) || 10;
		const pageNumber = parseInt(page as string) || 1;

		if (id) return resolve(res.status(200).json({ success: true, post: (await Post.findById(id)) as IPost }));

		DB(async () => {
			const count = await Post.countDocuments();
			const pages = Math.ceil(count / pageLimit);

			// Use pagination to get posts
			Post.find()
				.sort({ date: -1 })
				.skip((pageNumber - 1) * pageLimit)
				.limit(pageLimit)
				.populate<{ user: IUser }>('user')
				.populate<{ quote: IPost }>('quote')
				.populate<{ comments: IPost[] }>('comments')
				.exec()
				.then((posts) => {
					return resolve(res.status(200).json({ success: true, posts, pages }));
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
