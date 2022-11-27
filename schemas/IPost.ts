import mongoose, { Model, model, Schema, Types } from 'mongoose';

export interface IPost {
	_id: Types.ObjectId;
	user?: Types.ObjectId;
	content: string;
	quote?: Types.ObjectId;
	comments: [Types.ObjectId];
	date: number;
}

interface PostModel extends Model<IPost> {
	post: (user: Types.ObjectId, content: string, quote?: Types.ObjectId) => Promise<IPost | null>;
	getPost: (id: Types.ObjectId) => Promise<IPost | null>;
}

const postSchema = new Schema<IPost, PostModel>(
	{
		user: { type: Types.ObjectId, ref: 'User' },
		content: { type: String, required: true },
		quote: { type: Types.ObjectId, ref: 'Post' },
		comments: [{ type: Types.ObjectId, ref: 'Post' }],
		date: { type: Number, required: true },
	},
	{
		statics: {
			post: function (user: Types.ObjectId, content: string, quote?: Types.ObjectId) {
				return this.create({
					user,
					content,
					quote,
					comments: [],
					date: Date.now(),
				});
			},
			getPost: function (id: Types.ObjectId) {
				return this.findById(id).exec();
			},
		},
	}
);

// Fix recompilation error
const Post = (mongoose.models.Post as PostModel) || model<IPost, PostModel>('Post', postSchema);

export default Post;
