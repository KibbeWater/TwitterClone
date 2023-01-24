import { IUser } from './IUser';

export type IRelationship = {
	_id: string;
	author?: IUser;
	target?: IUser;
	type: 'follow' | 'block' | 'mute';
};
