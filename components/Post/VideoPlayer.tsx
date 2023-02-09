import { faPlay } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeSvgIcon } from 'react-fontawesome-svg-icon';
import { useEffect, useMemo, useRef } from 'react';

/* export function useVideoPlayer(video: string, className?: string, key?: string) {
	const memo = useMemo(
		() => <VideoPlayer video={video} className={className} key={key || Buffer.from(video).toString('base64')} />,
		[video, className, key]
	);
	return memo;
} */

export function VideoPlayer({ video, className, key }: { video: string; className?: string; key: string }) {
	const playBtn = useRef<HTMLDivElement>(null);
	const videoRef = useRef<HTMLVideoElement>(null);

	useEffect(() => {
		import('hls.js').then((hlsModules) => {
			const HLS = hlsModules.default;

			if (!videoRef.current) return;

			if (videoRef.current && HLS.isSupported()) {
				const hls = new HLS({ startLevel: -1, debug: true });
				hls.attachMedia(videoRef.current);

				videoRef.current.addEventListener('play', () => {
					if ((videoRef.current as HTMLVideoElement).readyState >= 1) return;

					hls.loadSource(video);
					hls.on(HLS.Events.MANIFEST_PARSED, () => {
						(videoRef.current as HTMLVideoElement).play();
					});
				});
			}
		});
	}, [videoRef.current]);

	// Get the thumbnail, ${videoId}_thumb.xxxxxxx.jpg. Video looks like this: https://${url}.cloudfront.net/video_streaming/${videoId}_${resolution}p.m3u8
	const thumbCont = '0';
	const thumbUrl = video.replace('.m3u8', `_thumb.000000${thumbCont}.jpg`);

	const playVideo = () => {
		// playBtn has to be shown if this should run
		if (!playBtn.current) return;
		if (playBtn.current.classList.contains('hidden')) return;

		if (videoRef.current) {
			videoRef.current.play();
			videoRef.current.controls = true;
			playBtn.current?.classList.add('hidden');
		}
	};

	return (
		<div key={key} onClick={playVideo} className={className}>
			<div ref={playBtn}>
				<div className={'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'}>
					<FontAwesomeSvgIcon icon={faPlay} className={'text-4xl text-white'} />
				</div>
			</div>
			<video ref={videoRef} poster={thumbUrl} className={'w-full h-full object-contain'} />
		</div>
	);
}
