'use client';

import Image from 'next/image';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
	return (
		<div className='w-full h-full flex justify-center items-center'>
			<div className='relative'>
				<Image
					src='/assets/favicons/icon-512x512.png'
					alt='Twatter Logo'
					width={512}
					height={512}
					className='w-16 h-16 -top-6 -right-6 absolute opacity-60'
				/>
				<h1 className='text-3xl text-center relative z-10 text-black dark:text-white'>{`Error ${500}`}</h1>
			</div>
		</div>
	);
}
