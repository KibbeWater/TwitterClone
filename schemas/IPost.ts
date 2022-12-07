import mongoose, { Model, model, Schema, Types } from 'mongoose';
import Like, { ILike } from './ILike';
import User, { IUser } from './IUser';

export interface IPost {
	_id: Types.ObjectId;
	user?: Types.ObjectId;

	content: string;
	quote?: Types.ObjectId;
	images?: string[];
	parent?: Types.ObjectId;

	comments: [Types.ObjectId];
	likes: [Types.ObjectId];
	retwaats: [Types.ObjectId];

	date: number;
}

interface PostModel extends Model<IPost> {
	post: (user: Types.ObjectId, content: string, quote?: Types.ObjectId, images?: string[], parent?: string) => Promise<IPost | null>;
	getPost: (id: Types.ObjectId) => Promise<IPost | null>;
	deletePost: (id: Types.ObjectId) => Promise<void>;
}

const postSchema = new Schema<IPost, PostModel>(
	{
		user: { type: Types.ObjectId, ref: 'User' },

		content: { type: String, required: true },
		quote: { type: Types.ObjectId, ref: 'Post' },
		images: [{ type: String }],
		parent: { type: Types.ObjectId, ref: 'Post' },

		comments: [{ type: Types.ObjectId, ref: 'Post' }],
		likes: [{ type: Types.ObjectId, ref: 'Like' }],
		retwaats: [{ type: Types.ObjectId, ref: 'Retwaat' }],

		date: { type: Number, required: true },
	},
	{
		statics: {
			post: function (user: Types.ObjectId, content: string, quote?: Types.ObjectId, images?: string[], parent?: string) {
				return new Promise<IPost | null>(async (resolve, reject) => {
					const post = await this.create({
						user,
						content,
						images: [...(images ? images : [])],
						quote,
						comments: [],
						parent,
						date: Date.now(),
					});

					if (post && post.quote) {
						const quotePost = await this.findById(post.quote);
						if (quotePost) {
							quotePost.retwaats.push(post._id);
							await quotePost.save();
						}
					}

					if (post && post.parent) {
						const parentPost = await this.findById(post.parent);
						if (parentPost) {
							parentPost.comments.push(post._id);
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
			getPost: function (id: Types.ObjectId) {
				return this.findById(id)
					.populate<{ quote: IPost; user: IUser; comments: IPost[]; likes: ILike[] }>(['quote', 'user', 'comments', 'likes'])
					.populate<{ user: IUser & { user: IUser } }>({ path: 'quote', populate: { path: 'user' } })
					.populate<{ user: IUser & { user: IUser } }>({ path: 'comments', populate: { path: 'user' } })
					.exec();
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

// Fix recompilation error
const Post = (mongoose.models.Post as PostModel) || model<IPost, PostModel>('Post', postSchema);

export default Post;
