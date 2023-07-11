import mongoose, { Model, Schema, Types } from 'mongoose';
import { IPost } from './IPost';
import User, { IUser } from './IUser';

export type NotificationType = 'like' | 'retwaat' | 'mention' | 'reply' | 'follow';

export interface INotification {
	_id: Types.ObjectId;
	user?: Types.ObjectId;
	type: NotificationType;
	content?: string;
	post?: Types.ObjectId;
	targets?: Types.ObjectId[];
	read: boolean;
	date: number;
}

interface NotificationModel extends Model<INotification> {
	createPostNotification: (
		user: IUser,
		type: 'like' | 'retwaat' | 'reply' | 'mention',
		post: IPost,
		targets?: IUser[]
	) => Promise<INotification | null>;
	createFollowNotification: (user: IUser, target: IUser) => Promise<INotification | null>;
}

export const notificationSchema = new Schema<INotification, NotificationModel>(
	{
		user: { type: Types.ObjectId, ref: 'User' },
		type: { type: String, required: true },
		content: { type: String },
		post: { type: Types.ObjectId, ref: 'Post' },
		targets: [{ type: Types.ObjectId, ref: 'User' }],
		read: { type: Boolean, default: false },
		date: { type: Number, required: true },
	},
	{
		statics: {
			createPostNotification: function (
				user: IUser,
				type: 'like' | 'retwaat' | 'reply' | 'mention',
				post: IPost,
				targets?: IUser[]
			): Promise<INotification | null> {
				return new Promise((resolve, reject) => {
					User.findById(user._id)
						.populate<{ notifications: INotification[] }>('notifications')
						.lean()
						.then(async (user) => {
							if (!user) reject("Error: User doesn't exist");
							else {
								switch (type) {
									case 'like':
										if (targets != undefined && targets.length > 0)
											await new User(user).sendLikeNotification(targets[0], post);
										break;
									case 'retwaat':
										if (targets != undefined && targets.length > 0)
											await new User(user).sendRetwaatNotification(targets[0], post);
										break;
									case 'reply':
										if (targets != undefined && targets.length > 0)
											await new User(user).sendReplyNotification(targets[0], post);
										break;
									case 'mention':
										if (targets != undefined && targets.length > 0)
											await new User(user).sendMentionNotification(targets[0], post);
										break;

									default:
										break;
								}
								const latestNotification = user?.notifications[user?.notifications.length - 1];
								if (latestNotification?.type === type && type !== 'mention' && type !== 'reply')
									resolve(
										Notification.findByIdAndUpdate(
											latestNotification._id,
											{ $push: { targets: targets } },
											{ new: true }
										)
									);
								else
									this.create({
										user,
										type,
										post: post._id,
										targets,
										date: Date.now(),
									}).then((notification) => {
										User.findByIdAndUpdate(user._id, { $push: { notifications: notification } }, { new: true }).then(
											() => resolve(notification)
										);
									});
							}
						});
				});
			},
			createFollowNotification: function (user: IUser, target: IUser): Promise<INotification | null> {
				return new Promise((resolve, reject) => {
					User.findById(user._id)
						.populate<{ notifications: INotification[] }>('notifications')
						.lean()
						.then(async (user) => {
							if (!user) reject("Error: User doesn't exist");
							else {
								await new User(target).sendFollowNotification(user as unknown as IUser);
								const latestNotification = user?.notifications[user?.notifications.length - 1];
								if (latestNotification?.type === 'follow') {
									const notif = Notification.findByIdAndUpdate(
										latestNotification._id,
										{ $push: { targets: [target] } },
										{ new: true }
									);
									resolve(notif);
								} else {
									this.create({
										user,
										type: 'follow',
										targets: [target],
										date: Date.now(),
									}).then((notification) =>
										User.findByIdAndUpdate(user._id, { $push: { notifications: notification } }, { new: true }).then(
											() => resolve(notification)
										)
									);
								}
							}
						});
				});
			},
		},
	}
);

// Fix recompilation error
const Notification =
	(mongoose.models.Notification as NotificationModel) ||
	mongoose.model<INotification, NotificationModel>('Notification', notificationSchema);

export default Notification;
