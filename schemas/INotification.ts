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
						.exec((err, user: any) => {
							if (err) reject(err);
							else {
								const latestNotification = user?.notifications[user?.notifications.length - 1];
								if (latestNotification?.type === type && type !== 'mention' && type !== 'reply') {
									const notif = Notification.findByIdAndUpdate(
										latestNotification._id,
										{ $push: { targets: targets } },
										{ new: true }
									);
									resolve(notif);
								} else {
									this.create({
										user,
										type,
										post: post._id,
										targets,
										date: Date.now(),
									}).then((notification) => {
										User.findByIdAndUpdate(user._id, { $push: { notifications: notification } }, { new: true }).then(
											(user) => {
												resolve(notification);
											}
										);
									});
								}
							}
						});
				});
			},
			createFollowNotification: function (user: IUser, target: IUser): Promise<INotification | null> {
				return new Promise((resolve, reject) => {
					this.create({
						user,
						type: 'follow',
						targets: [target._id],
						date: Date.now(),
					}).then((notification) => {
						User.findByIdAndUpdate(user, { $push: { notifications: notification } }, { new: true }).then((user) => {
							resolve(notification);
						});
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
