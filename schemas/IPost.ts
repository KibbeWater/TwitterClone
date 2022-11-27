import { model, Schema, Types } from 'mongoose';

interface IPost {
	user?: Types.ObjectId;
	content: string;
	quote?: Types.ObjectId;
	comments: [Types.ObjectId];
	date: number;
}

const postSchema = new Schema<IPost>({
	user: { type: Types.ObjectId, ref: 'User' },
	content: { type: String, required: true },
	quote: { type: Types.ObjectId, ref: 'Post' },
	comments: [{ type: Types.ObjectId, ref: 'Post' }],
	date: { type: Number, required: true },
});

const Post = model<IPost>('Post', postSchema);

export default Post;
