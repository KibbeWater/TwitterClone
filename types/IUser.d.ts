import { ILike } from './ILike';
import { INotification } from './INotification';
import { IPost } from './IPost';
import { IRelationship } from './IRelationship';
import { ISession } from './ISession';

export type IUser = {
	_id: Types.ObjectId;
	tag: string;
	username: string;
	password: string;
	verified: boolean;

	avatar?: string;
	banner?: string;
	bio: string;

	relationships: [IRelationship];
	sessions: [ISession];
	posts: [IPost];
	likes: [ILike];
	notifications: [INotification];

	group: number;
};
