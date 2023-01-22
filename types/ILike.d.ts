import { IPost } from './IPost';
import { IUser } from './IUser';

export type ILike = {
	_id: string;
	user?: IUser;
	post?: IPost;
};
