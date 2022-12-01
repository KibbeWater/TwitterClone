import axios from 'axios';
import { Types } from 'mongoose';

import { IPost } from '../schemas/IPost';

let lastPost = '';

export function SendPost(content: string, quoteId?: string, images?: string[], parent?: string): Promise<IPost> {
	return new Promise((resolve, reject) => {
		if (lastPost === content)
			return resolve({
				content,
				_id: new Types.ObjectId('0'),
				comments: [new Types.ObjectId('0')],
				likes: [new Types.ObjectId('0')],
				retwaats: [new Types.ObjectId('0')],
				date: new Date().getTime(),
			});
		lastPost = content;

		if (!content) return reject(new Error('Missing content'));
		axios
			.post<{ success: boolean; post: IPost; error: string }>('/api/post', {
				content,
				quote: quoteId,
				images,
				parent,
			})
			.then((res) => {
				if (res.data.success) resolve(res.data.post);
				else reject(res.data.error);
			})
			.catch((err) => {
				reject(err);
			});
	});
}

export function LikePost(id: string, shouldLike: boolean): Promise<IPost> {
	return new Promise((resolve, reject) => {
		axios
			.post<{ success: boolean; post: IPost; error: string }>('/api/post/like', {
				id,
				like: shouldLike,
			})
			.then((res) => {
				if (res.data.success) resolve(res.data.post);
				else reject(res.data.error);
			})
			.catch((err) => {
				reject(err);
			});
	});
}
