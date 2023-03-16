import { useEffect, useRef } from 'react';

export default function ProgressBar({ progress, className }: { progress: number; className?: string }) {
	const barRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!barRef.current) return;

		const bar = barRef.current;
		const barWidth = bar.clientWidth;
		const progressWidth = (barWidth * progress) / 100;

		bar.style.setProperty('--progress-width', `${progressWidth}px`);
	}, [progress]);

	return (
		<div ref={barRef} className={className}>
			<div className={'absolute top-0 left-0 h-full bg-blue-500'} style={{ width: 'var(--progress-width)' }}></div>
		</div>
	);
}
