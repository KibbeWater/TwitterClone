import mongoose, { Model, model, Query, Schema, Types } from 'mongoose';
import { SafeUser, TransformSafe } from '../libs/user';
import Like, { ILike } from './ILike';
import Notification, { INotification } from './INotification';
import User, { IUser } from './IUser';

export interface IPost {
	_id: Types.ObjectId;
	user?: Types.ObjectId;

	content: string;
	quote?: Types.ObjectId;
	images?: string[];
	videos?: string[];
	parent?: Types.ObjectId;

	comments: [Types.ObjectId];
	likes: [Types.ObjectId];
	retwaats: [Types.ObjectId];
	mentions: [Types.ObjectId];

	date: number;
}

interface PostModel extends Model<IPost> {
	post: (
		user: Types.ObjectId,
		content: string,
		quote?: Types.ObjectId,
		images?: string[],
		videos?: string[],
		parent?: string,
		mentions?: IUser[]
	) => Promise<IPost | null>;
	getPost: (id: string) => Promise<IPost | null>;
	deletePost: (id: Types.ObjectId) => Promise<void>;
}

const postSchema = new Schema<IPost, PostModel>(
	{
		user: { type: Types.ObjectId, ref: 'User' },

		content: { type: String, required: true },
		quote: { type: Types.ObjectId, ref: 'Post' },
		images: [{ type: String }],
		videos: [{ type: String }],
		parent: { type: Types.ObjectId, ref: 'Post' },

		comments: [{ type: Types.ObjectId, ref: 'Post' }],
		likes: [{ type: Types.ObjectId, ref: 'Like' }],
		retwaats: [{ type: Types.ObjectId, ref: 'Post' }],
		mentions: [{ type: Types.ObjectId, ref: 'User', default: [] }],

		date: { type: Number, required: true },
	},
	{
		query: {},
		statics: {
			post: function (
				user: Types.ObjectId,
				content: string,
				quote?: Types.ObjectId,
				images?: string[],
				videos?: string[],
				parent?: string,
				mentions?: IUser[]
			) {
				return new Promise<IPost | null>(async (resolve, reject) => {
					const post = await this.create({
						user,
						content,
						images: [...(images ? images : [])],
						videos: [...(videos ? videos : [])],
						quote,
						comments: [],
						parent,
						date: Date.now(),
						mentions: (mentions || []).map((mention) => mention._id),
					});

					if (post && post.quote) {
						const quotePost = await this.findById(post.quote);
						if (quotePost) {
							quotePost.retwaats.push(post._id);
							if (quotePost.user?._id.toString() !== user.toString())
								await Notification.createPostNotification(quotePost.user as unknown as IUser, 'retwaat', post, [
									(await User.findById(user)) as IUser,
								]);
							await quotePost.save();
						}
					}

					if (post && post.parent) {
						const parentPost = await this.findById(post.parent);
						if (parentPost) {
							parentPost.comments.push(post._id);
							if (parentPost.user?._id.toString() !== user.toString())
								await Notification.createPostNotification(parentPost.user as unknown as IUser, 'reply', post, [
									(await User.findById(user)) as IUser,
								]);
							await parentPost.save();
						}
					}

					// Add post to user.posts
					const userDoc = await User.findById(user);
					if (userDoc) {
						userDoc.posts.push(post._id);
						await userDoc.save();
					}

					resolve(post);
				});
			},
			getPost: function (id: string) {
				return this.findById(id)
					.populate<{ quote: IPost; parent: IPost; user: IUser; comments: IPost[]; likes: ILike[] }>([
						'quote',
						'parent',
						'user',
						'comments',
						'likes',
					])
					.populate<{ quote: IUser & { user: IUser } }>({ path: 'quote', populate: { path: 'user' } })
					.populate<{ parent: IUser & { user: IUser } }>({ path: 'parent', populate: { path: 'user' } })
					.populate<{ comments: IUser & { user: IUser } }>({ path: 'comments', populate: { path: 'user' } })
					.lean();
			},
			deletePost: function (id: Types.ObjectId) {
				return new Promise<void>(async (resolve, reject) => {
					// Remove the post ref from the author and if it has a parent, remove it from the parent retwaats
					// Create aggregation pipeline to delete the post and remove it from the author and parent
					const post = await this.findById(id);
					if (!post) return reject('Post not found');

					const user = await User.findById(post.user);
					if (user) {
						user.posts = user.posts.filter((post) => post.toString() !== id.toString()) as [Types.ObjectId];
						await user.save();
					}

					if (post.parent) {
						const parent = await this.findById(post.parent);
						if (parent) {
							parent.comments = parent.comments.filter((comment) => comment.toString() !== id.toString()) as [Types.ObjectId];
							await parent.save();
						}
					}

					if (post.quote) {
						const quote = await this.findById(post.quote);
						if (quote) {
							quote.retwaats = quote.retwaats.filter((retwaat) => retwaat.toString() !== id.toString()) as [Types.ObjectId];
							await quote.save();
						}
					}

					// Find all likes on the post and update the user's likes to remove their like ref
					const likes = await Like.find({
						post: id,
					});

					// Aggregate all the likes and remove the like ref from the user's likes array
					const likesAgg = likes.map((like) => {
						return {
							updateOne: {
								filter: { _id: like.user },
								update: { $pull: { likes: like._id } },
							},
						};
					});

					// Update all the users
					await User.bulkWrite(likesAgg);

					// Delete all the likes
					await Like.deleteMany({ post: id });

					// Delete the post
					await this.findByIdAndDelete(id);

					resolve();
				});
			},
		},
	}
);

// Populate find and findOne methods with the following paths using middleware
/*
	.populate<{ user: IUser; quote: IPost; comments: IPost[]; likes: ILike[]; mentions: IUser[] }>([
						'user',
						'comments',
						'likes',
						'quote',
						'mentions',
					])
	.populate<{ user: IUser & { user: IUser } }>({ path: 'quote', populate: { path: 'user' } })
*/
function populatePost(post: mongoose.Query<any, any, {}, any>) {
	post.populate<{ user: IUser; quote: IPost; parent: IPost; likes: ILike[]; mentions: IUser[] }>([
		'user',
		'parent',
		'likes',
		'quote',
		'mentions',
	]);
}

function safePost(post: IPost): IPost & { user: SafeUser; quote?: IPost & { user: SafeUser }; parent?: IPost & { user: SafeUser } } {
	return {
		...post,
		// @ts-ignore
		user: TransformSafe(post.user),
		// @ts-ignore
		quote: post.quote ? { ...post.quote, user: TransformSafe((post.quote as unknown as IPost).user) } : undefined,
		// @ts-ignore
		parent: post.parent ? { ...post.parent, user: TransformSafe((post.parent as unknown as IPost).user) } : undefined,
	};
}

postSchema.pre('find', function () {
	populatePost(this);
});

postSchema.pre('findOne', function () {
	populatePost(this);
});

/* postSchema.post<Query<[IPost], [IPost]>>('find', async function (doc) {
	console.log(doc.map((post) => safePost(post)));
	doc.forEach((post) => safePost(post));
});

postSchema.post<Query<IPost | null, IPost | null>>('findOne', async function (doc) {
	if (doc) doc = safePost(doc) as unknown as IPost;
}); */

// Fix recompilation error
const Post = (mongoose.models.Post as PostModel) || model<IPost, PostModel>('Post', postSchema);

export default Post;
