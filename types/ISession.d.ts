import { IUser } from './IUser';

export type ISession = {
	_id: Types.ObjectId;
	owner?: IUser;
	token: string;
	date: number;
	ip?: string;
};
