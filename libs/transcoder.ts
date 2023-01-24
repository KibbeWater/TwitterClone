import axios from 'axios';

export function TranscodeVideo(videoId: string): Promise<string | null> {
	return new Promise((resolve) => {
		axios
			.post<{ success: boolean; trackId: string }>('/api/video/transcode', { videoId })
			.then((res) => {
				if (!res.data.success) return resolve(res.data.trackId);
				resolve(res.data.trackId);
			})
			.catch(() => resolve(null));
	});
}
