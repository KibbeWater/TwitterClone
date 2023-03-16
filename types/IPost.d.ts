import { ILike } from './ILike';
import { IUser } from './IUser';

export type IPost = {
	_id: string;
	user?: IUser;

	content: string;
	quote?: IPost;
	images?: string[];
	videos?: string[];
	parent?: IPost;

	comments: IPost[];
	likes: ILike[];
	retwaats: IPost[];
	mentions: IUser[];

	date: number;
};
