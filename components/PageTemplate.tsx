'use client';

import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRouter } from 'next/navigation';

export default function PageTemplate({ children, name }: { children?: React.ReactNode; name: string }) {
	const router = useRouter();

	return (
		<>
			<header
				className={
					'w-full h-12 px-3 sticky top-0 right-0 left-0 backdrop-blur-lg flex items-center bg-white/20 dark:bg-black/20 z-20 self-start'
				}
			>
				<div
					className='w-8 h-8 flex items-center justify-center bg-gray-700/0 mr-5 rounded-full hover:bg-gray-700/20 cursor-pointer transition-colors'
					onClick={() => router.back()}
				>
					<FontAwesomeIcon icon={faArrowLeft} className={'text-black dark:text-white'} />
				</div>

				<h1 className={'font-bold m-0 text-black dark:text-white text-xl'}>{name}</h1>
			</header>
			{children}
		</>
	);
}
