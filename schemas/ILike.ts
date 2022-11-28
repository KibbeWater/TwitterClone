import mongoose, { Model, Schema, Types } from 'mongoose';
import Post from './IPost';
import User from './IUser';

export interface ILike {
	_id: Types.ObjectId;
	user?: Types.ObjectId;
	post?: Types.ObjectId;
}

interface LikeModel extends Model<ILike> {
	likePost: (user: Types.ObjectId, post: Types.ObjectId) => Promise<ILike | null>;
	unlikePost: (like: Types.ObjectId) => Promise<ILike | null>;
}

export const likeSchema = new Schema<ILike, LikeModel>(
	{
		user: { type: Types.ObjectId, ref: 'User' },
		post: { type: Types.ObjectId, ref: 'Post' },
	},
	{
		statics: {
			likePost: function (user: Types.ObjectId, post: Types.ObjectId) {
				return new Promise((resolve, reject) => {
					this.create({
						user,
						post,
					}).then((like) => {
						// We want to add likes to the post.likes array and user.likes array

						User.findById(user).then((user2) => {
							user2?.likes.push(like._id);
							user2?.save();

							Post.findById(post).then((post2) => {
								post2?.likes.push(like._id);
								post2?.save();

								resolve(like);
							});
						});
					});
				});
			},
			unlikePost: function (like: Types.ObjectId) {
				return new Promise((resolve, reject) => {
					this.findByIdAndDelete(like).then((like2) => {
						if (like2)
							User.findById(like2.user).then((user) => {
								if (user) {
									user.likes = user.likes.filter((like3) => like3.toString() !== like2?._id.toString()) as [
										Types.ObjectId
									];
									user.save();
								}

								Post.findById(like2.post).then((post) => {
									if (post) {
										post.likes = post.likes.filter((like3) => like3.toString() !== like2?._id.toString()) as [
											Types.ObjectId
										];
										post.save();
									}

									resolve(like2);
								});
							});
						else resolve(null);
					});
				});
			},
		},
	}
);

// Fix recompilation error
const Like = (mongoose.models.Like as LikeModel) || mongoose.model<ILike, LikeModel>('Like', likeSchema);

export default Like;
