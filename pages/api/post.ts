import { NextApiRequest, NextApiResponse } from 'next';
import { getCookie } from 'cookies-next';
import User, { IUser } from '../../schemas/IUser';
import Post from '../../schemas/IPost';
import DB, { Connect } from '../../libs/database';
import { Group } from '../../libs/utils';
import Notification from '../../schemas/INotification';

function PostReq(req: NextApiRequest, res: NextApiResponse) {
	return new Promise(async (resolve) => {
		if (req.method !== 'POST') return resolve(res.status(405).json({ success: false, error: 'Method not allowed' }));

		const token = getCookie('token', { req, res }) as string;
		if (!token) return resolve(res.status(401).json({ success: false, error: 'Unauthorized' }));

		const { content, quote, images, parent } = req.body;

		if (!content && !images) return resolve(res.status(400).json({ success: false, error: 'Bad request' }));
		if (content === '') return resolve(res.status(400).json({ success: false, error: 'Bad request' }));
		if (images && !Array.isArray(images)) return resolve(res.status(400).json({ success: false, error: 'Bad request' }));

		let newContent = content;
		if (newContent.length > 2000) newContent = newContent.slice(0, 2000);

		const mentions: string[] = newContent.match(/@([a-zA-Z0-9_]+)/g);
		let validMentions: IUser[] = [];
		if (mentions) {
			const mentionUsers = await User.find({ tag: { $in: mentions.map((m) => m.slice(1).toLowerCase()) } });
			validMentions = mentionUsers;
		}

		validMentions = validMentions.reduce((newArr, user) => {
			if (!newArr.find((u) => u._id.toString() === user._id.toString())) newArr.push(user);
			return newArr;
		}, [] as IUser[]);

		DB(async () => {
			User.authenticate(token)
				.then((user) => {
					if (!user) return resolve(res.status(401).json({ success: false, error: 'Unauthorized' }));

					new User(user)
						.post(content, quote, images, parent, validMentions)
						.then(async (post) => {
							if (!post) return resolve(res.status(500).json({ success: false, error: 'Internal server error' }));

							validMentions.forEach(async (mention) => Notification.createPostNotification(mention, 'mention', post, [user]));

							resolve(res.status(200).json({ success: true, post }));
						})
						.catch(() => resolve(res.status(500).json({ success: false, error: 'Internal server error' })));
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
			return Post.findOne({ _id: id })
				.sort({ date: -1 })
				.skip(pageNumber * pageLimit)
				.limit(pageLimit)
				.lean()
				.exec()
				.then((post) =>
					post
						? resolve(
								res.status(200).json({
									success: true,
									post: post,
								})
						  )
						: resolve(res.status(404).json({ success: false, error: 'Not found' }))
				);

		DB(async () => {
			const count = await Post.countDocuments();
			const pages = Math.ceil(count / pageLimit);

			// Use pagination to get posts
			Post.find({ parent: parent ? parent : null })
				.sort({ date: -1 })
				.skip(pageNumber * pageLimit)
				.limit(pageLimit)
				.lean()
				.exec()
				.then((posts) => {
					return resolve(res.status(200).json({ success: true, posts: posts, pages }));
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
