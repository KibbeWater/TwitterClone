import mongoose, { Model, Schema, Types } from 'mongoose';

export interface ILike {
	_id: Types.ObjectId;
	user?: Types.ObjectId;
	post?: Types.ObjectId;
}

interface LikeModel extends Model<ILike> {
	likePost: (user: Types.ObjectId, post: Types.ObjectId) => Promise<ILike | null>;
}

export const likeSchema = new Schema<ILike, LikeModel>(
	{
		user: { type: Types.ObjectId, ref: 'User' },
		post: { type: Types.ObjectId, ref: 'Post' },
	},
	{
		statics: {
			likePost: function (user: Types.ObjectId, post: Types.ObjectId) {
				return this.create({
					user,
					post,
				});
			},
		},
	}
);

// Fix recompilation error
const Like = (mongoose.models.Like as LikeModel) || mongoose.model<ILike, LikeModel>('Like', likeSchema);

export default Like;
