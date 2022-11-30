import mongoose, { Model, model, Schema, Types } from 'mongoose';
import User, { IUser } from './IUser';

export interface IPost {
	_id: Types.ObjectId;
	user?: Types.ObjectId;

	content: string;
	quote?: Types.ObjectId;
	images?: string[];

	comments: [Types.ObjectId];
	likes: [Types.ObjectId];
	retwaats: [Types.ObjectId];

	date: number;
}

interface PostModel extends Model<IPost> {
	post: (user: Types.ObjectId, content: string, quote?: Types.ObjectId, images?: string[]) => Promise<IPost | null>;
	getPost: (id: Types.ObjectId) => Promise<IPost | null>;
}

const postSchema = new Schema<IPost, PostModel>(
	{
		user: { type: Types.ObjectId, ref: 'User' },

		content: { type: String, required: true },
		quote: { type: Types.ObjectId, ref: 'Post' },
		images: [{ type: String }],

		comments: [{ type: Types.ObjectId, ref: 'Post' }],
		likes: [{ type: Types.ObjectId, ref: 'Like' }],
		retwaats: [{ type: Types.ObjectId, ref: 'Retwaat' }],

		date: { type: Number, required: true },
	},
	{
		statics: {
			post: function (user: Types.ObjectId, content: string, quote?: Types.ObjectId, images?: string[]) {
				return new Promise<IPost | null>(async (resolve, reject) => {
					const post = await this.create({
						user,
						content,
						images: [...(images ? images : [])],
						quote,
						comments: [],
						date: Date.now(),
					});

					if (post && post.quote) {
						const quotePost = await this.findById(post.quote);
						if (quotePost) {
							quotePost.retwaats.push(post._id);
							await quotePost.save();
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
				return this.findById(id).populate<{ quote: IPost; user: IUser; comments: IPost[] }>(['quote', 'user', 'comments']).exec();
			},
		},
	}
);

// Fix recompilation error
const Post = (mongoose.models.Post as PostModel) || model<IPost, PostModel>('Post', postSchema);

export default Post;
