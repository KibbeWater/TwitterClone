import axios from 'redaxios';

export function TranscodeVideo(videoId: string): Promise<{ url: string; trackId: string } | null> {
	return new Promise((resolve) => {
		axios
			.post<{ success: boolean; trackId: string; url: string }>('/api/video/transcode', { videoId })
			.then((res) => {
				if (!res.data.success) return resolve(null);
				resolve({ trackId: res.data.trackId, url: res.data.url });
			})
			.catch(() => resolve(null));
	});
}
