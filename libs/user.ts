import axios from 'axios';
import { IRelationship } from '../schemas/IRelationship';
import { IUser } from '../schemas/IUser';

export function CreateRelationship(userId: string, type: 'follow' | 'block' | 'mute' | 'remove'): Promise<IRelationship> {
	return new Promise((resolve, reject) => {
		axios
			.post('/api/user/follow', {
				target: userId,
				type,
			})
			.then((res) => {
				if (res.data.success) resolve(res.data.relationship);
				else reject(res.data.error);
			})
			.catch((err) => {
				reject(err);
			});
	});
}

export type SafeUser = {
	_id: string;
	username: string;
	tag: string;
	avatar?: string;
	banner?: string;
	bio: string;
};

export function MakeSafeUser(user: IUser): SafeUser {
	return {
		_id: user._id.toString(),

		username: user.username,
		tag: user.tag,

		avatar: user.avatar?.toString(),
		banner: user.banner?.toString(),
		bio: user.bio,
	};
}
