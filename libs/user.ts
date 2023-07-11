import axios from 'redaxios';
import { IPost } from '../types/IPost';
import { IRelationship } from '../types/IRelationship';

export function CreateRelationship(userId: string, type: 'follow' | 'block' | 'mute' | 'remove'): Promise<IRelationship> {
	return new Promise((resolve, reject) => {
		axios
			.post('/api/user/follow', {
				target: userId,
				type,
			})
			.then((res) => {
				if (res.data.success) resolve(res.data.data.relationship);
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
	verified: boolean;
	posts: IPost[];
	avatar?: string;
	banner?: string;
	bio: string;
};

export function TransformSafe(user: any): SafeUser | undefined {
	if (!user) return undefined;
	return {
		_id: user._id.toString(),

		username: user.username,
		tag: user.tag,
		verified: !!user.verified,

		posts: user.posts,

		avatar: user.avatar?.toString(),
		banner: user.banner?.toString(),
		bio: user.bio,
	};
}
