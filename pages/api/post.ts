import { NextApiRequest, NextApiResponse } from 'next';
import { getCookie } from 'cookies-next';
import User, { IUser } from '../../schemas/IUser';
import Post, { IPost } from '../../schemas/IPost';
import DB, { Connect } from '../../libs/database';
import { Group, NormalizeObject } from '../../libs/utils';
import { ILike } from '../../schemas/ILike';
import { MakeSafeUser, SafeUser } from '../../libs/user';
import Notification from '../../schemas/INotification';
import { IRelationship } from '../../schemas/IRelationship';

function PostReq(req: NextApiRequest, res: NextApiResponse) {
	return new Promise(async (resolve) => {
		if (req.method !== 'POST') return resolve(res.status(405).json({ success: false, error: 'Method not allowed' }));

		const token = getCookie('token', { req, res }) as string;
		if (!token) return resolve(res.status(401).json({ success: false, error: 'Unauthorized' }));

		const { content, quote, images, parent } = req.body;

		if (!content) return resolve(res.status(400).json({ success: false, error: 'Bad request' }));
		if (content === '') return resolve(res.status(400).json({ success: false, error: 'Bad request' }));
		if (images && !Array.isArray(images)) return resolve(res.status(400).json({ success: false, error: 'Bad request' }));

		let newContent = content;
		if (newContent.length > 2000) newContent = newContent.slice(0, 2000);

		DB(async () => {
			User.authenticate(token)
				.then((user) => {
					if (!user) return resolve(res.status(401).json({ success: false, error: 'Unauthorized' }));

					new User(user)
						.post(content, quote, images, parent)
						.then((post) => {
							if (parent && post)
								Post.findById(parent)
									.populate<{ user: IUser }>('user')
									.exec()
									.then((parentPost) => {
										if (!parentPost) return;
										Notification.createPostNotification(parentPost?.user, 'reply', post, [user]).then(() => {
											if (!post)
												return resolve(res.status(500).json({ success: false, error: 'Internal server error' }));
											else return resolve(res.status(200).json({ success: true, post }));
										});
									});
							else {
								if (!post) return resolve(res.status(500).json({ success: false, error: 'Internal server error' }));
								else return resolve(res.status(200).json({ success: true, post }));
							}
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

function DeleteReq(req: NextApiRequest, res: NextApiResponse) {
	return new Promise(async (resolve) => {
		if (req.method !== 'DELETE') return resolve(res.status(405).json({ success: false, error: 'Method not allowed' }));

		const token = getCookie('token', { req, res }) as string;
		if (!token) return resolve(res.status(401).json({ success: false, error: 'Unauthorized' }));

		const { id } = req.query;

		if (!id) return resolve(res.status(400).json({ success: false, error: 'Bad request' }));

		DB(async () => {
			User.authenticate(token)
				.then((user) => {
					if (!user) return resolve(res.status(401).json({ success: false, error: 'Unauthorized' }));

					Post.findById(id)
						.populate<{ user: IUser }>('user')
						.exec()
						.then((post) => {
							if (!post) return resolve(res.status(404).json({ success: false, error: 'Not found' }));

							if (post.user._id.toString() !== user._id.toString() && user.group != Group.Admin)
								return resolve(res.status(403).json({ success: false, error: 'Forbidden' }));

							Post.deletePost(post._id).then(() => {
								return resolve(res.status(200).json({ success: true }));
							});
						})
						.catch((err) => {
							console.error(err);
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

		let { id, page, limit, parent } = req.query;

		const parsedLimit = parseInt(limit as string);
		const parsedPage = parseInt(page as string);

		const pageLimit = isNaN(parsedLimit) ? 10 : parsedLimit;
		const pageNumber = isNaN(parsedPage) ? 0 : parsedPage;

		if (id)
			return (
				Post.findOne({ _id: id })
					.sort({ date: -1 })
					.skip(pageNumber * pageLimit)
					.limit(pageLimit)
					/* This is so unoptimal I wanna cry but fuck it, we're populating likes too */
					.populate<{ user: IUser; quote: IPost; comments: IPost[]; likes: ILike[]; relationships: IRelationship[] }>([
						'user',
						'comments',
						'likes',
						'relationships',
					])
					/* Populate quote user */
					.populate<{ user: IUser & { user: IUser } }>({ path: 'quote', populate: { path: 'user' } })
					.lean()
					.exec()
					.then((post) =>
						post
							? resolve(
									res.status(200).json({
										success: true,
										post: NormalizeObject<
											IPost & {
												user: SafeUser;
												quote: IPost & { user: SafeUser };
												comments: IPost[];
												likes: ILike[];
												relationships: IRelationship[];
											}
										>({
											...post,
											// @ts-ignore
											user: MakeSafeUser(post.user),
											// @ts-ignore
											quote: post.quote
												? {
														...post.quote,
														user: post.quote.user
															? MakeSafeUser(post.quote.user as unknown as IUser)
															: undefined,
												  }
												: undefined,
										}),
									})
							  )
							: resolve(res.status(404).json({ success: false, error: 'Not found' }))
					)
			);

		DB(async () => {
			const count = await Post.countDocuments();
			const pages = Math.ceil(count / pageLimit);

			// Use pagination to get posts
			Post.find({ parent: parent ? parent : null })
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
	else if (req.method === 'DELETE') return DeleteReq(req, res);
	else return res.status(405).json({ success: false, error: 'Method not allowed' });
}
