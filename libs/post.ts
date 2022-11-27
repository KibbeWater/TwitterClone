import axios from 'axios';

import { IPost } from '../schemas/IPost';

export function SendPost(content: string, quoteId?: string): Promise<IPost> {
	return new Promise((resolve, reject) => {
		axios
			.post<{ success: boolean; post: IPost; error: string }>('/api/post', {
				content,
				quote: quoteId,
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
