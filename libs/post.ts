import axios from 'axios';

import { IPost } from '../schemas/IPost';

export function SendPost(content: string, quoteId?: string, images?: string[]): Promise<IPost> {
	return new Promise((resolve, reject) => {
		axios
			.post<{ success: boolean; post: IPost; error: string }>('/api/post', {
				content,
				quote: quoteId,
				images,
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
