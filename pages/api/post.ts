import { NextApiRequest, NextApiResponse } from 'next';
import { getCookie } from 'cookies-next';
import User, { IUser } from '../../schemas/IUser';
import Post, { IPost } from '../../schemas/IPost';
import DB, { Connect } from '../../libs/database';
import { NormalizeObject } from '../../libs/utils';
import { ILike } from '../../schemas/ILike';
import { MakeSafeUser } from '../../libs/user';

function PostReq(req: NextApiRequest, res: NextApiResponse) {
	return new Promise(async (resolve) => {
		if (req.method !== 'POST') return resolve(res.status(405).json({ success: false, error: 'Method not allowed' }));

		const token = getCookie('token', { req, res }) as string;
		if (!token) return resolve(res.status(401).json({ success: false, error: 'Unauthorized' }));

		const { content, quote, images } = req.body;

		if (!content) return resolve(res.status(400).json({ success: false, error: 'Bad request' }));
		if (content === '') return resolve(res.status(400).json({ success: false, error: 'Bad request' }));
		if (images && !Array.isArray(images)) return resolve(res.status(400).json({ success: false, error: 'Bad request' }));

		DB(async () => {
			User.authenticate(token)
				.then((user) => {
					if (!user) return resolve(res.status(401).json({ success: false, error: 'Unauthorized' }));

					new User(user)
						.post(content, quote, images)
						.then((post) => {
							if (!post) return resolve(res.status(500).json({ success: false, error: 'Internal server error' }));
							else return resolve(res.status(200).json({ success: true, post }));
						})
						.catch(() => {
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
				/* This is so unoptimal I wanna cry but fuck it, we're populating likes too */
				.populate<{ user: IUser; quote: IPost; comments: IPost[]; likes: ILike[] }>(['user', 'comments', 'likes'])
				/* Populate quote user */
				.populate<{ user: IUser & { user: IUser } }>({ path: 'quote', populate: { path: 'user' } })
				.lean()
				.exec()
				.then((posts) => {
					const newPosts = posts.map((post) =>
						NormalizeObject<typeof post>({
							...post,
							// @ts-ignore
							user: MakeSafeUser(post.user),
							// @ts-ignore
							quote: post.quote
								? {
										...post.quote,
										user: post.quote.user ? MakeSafeUser(post.quote.user as unknown as IUser) : undefined,
								  }
								: undefined,
						})
					);

					return resolve(res.status(200).json({ success: true, posts: newPosts, pages }));
				})
				.catch(() => {
					return resolve(res.status(500).json({ success: false, error: 'Internal server error' }));
				});
		});
	});
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	await Connect();

	if (req.method === 'POST') return PostReq(req, res);
	else if (req.method === 'GET') return GetReq(req, res);
	else return res.status(405).json({ success: false, error: 'Method not allowed' });
}
