import axios from 'axios';
import { Types } from 'mongoose';

import { IPost } from '../schemas/IPost';

let lastPost = '';

let lastPostDate: number | null = null;
let postDates: number[] = [];

export function SendPost(content: string, quoteId?: string, images?: string[], parent?: string): Promise<IPost> {
	return new Promise((resolve, reject) => {
		if (lastPostDate) postDates.push(new Date().getTime() - lastPostDate);

		console.log(postDates);

		if (postDates.length > 3) {
			// Get average, min, max and standard deviation
			const average = postDates.reduce((a, b) => a + b) / postDates.length;
			const min = Math.min(...postDates);
			const max = Math.max(...postDates);
			const stdDev = Math.sqrt(postDates.map((x) => Math.pow(x - average, 2)).reduce((a, b) => a + b) / postDates.length);

			console.log({ average, min, max, stdDev });

			if (stdDev < 1000) {
				window.location.href = 'https://www.nimh.nih.gov/health/publications/my-mental-health-do-i-need-help';
			}
		}

		lastPostDate = new Date().getTime();

		if (lastPost === content)
			return resolve({
				content,
				_id: new Types.ObjectId(),
				comments: [new Types.ObjectId()],
				likes: [new Types.ObjectId()],
				retwaats: [new Types.ObjectId()],
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
