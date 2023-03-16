import { IPost } from './IPost';
import { IUser } from './IUser';

export type INotification = {
	_id: string;
	user?: IUser;
	type: NotificationType;
	content?: string;
	post?: IPost;
	targets?: IUser[];
	read: boolean;
	date: number;
};
