import axios from 'redaxios';

import { IPost } from '../types/IPost';

let lastPost = '';

let lastPostDate: number | null = null;
let postDates: number[] = [];

export function SendPost(content: string, quoteId?: string, images?: string[], parent?: string): Promise<IPost> {
	return new Promise((resolve, reject) => {
		if (lastPostDate) postDates.push(new Date().getTime() - lastPostDate);

		if (postDates.length > 3) {
			// Get average, min, max and standard deviation
			const average = postDates.reduce((a, b) => a + b) / postDates.length;
			const min = Math.min(...postDates);
			const max = Math.max(...postDates);
			const stdDev = Math.sqrt(postDates.map((x) => Math.pow(x - average, 2)).reduce((a, b) => a + b) / postDates.length);

			if (stdDev < 1000) window.location.href = 'https://www.nimh.nih.gov/health/publications/my-mental-health-do-i-need-help';
		}

		lastPostDate = new Date().getTime();

		if (lastPost === content)
			return resolve({
				content,
				_id: '',
				comments: [],
				likes: [],
				retwaats: [],
				mentions: [],
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

export function DeletePost(id: string): Promise<void> {
	return new Promise((resolve, reject) => {
		axios.delete<{ success: boolean; error: string }>(`/api/post?id=${id}`).then((res) => {
			const data = res.data;

			if (!data.success) return reject(data.error);
			else resolve();
		});
	});
}
