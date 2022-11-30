'use client';

import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRouter } from 'next/navigation';

export default function PageTemplate({ children, name }: { children?: React.ReactNode; name: string }) {
	const router = useRouter();

	return (
		<>
			<header className={'w-full h-12 px-3 sticky backdrop-blur-sm flex items-center bg-white/20'}>
				<div
					className='w-8 h-8 flex items-center justify-center bg-gray-700/0 mr-5 rounded-full hover:bg-gray-700/20 cursor-pointer transition-colors'
					onClick={() => router.back()}
				>
					<FontAwesomeIcon icon={faArrowLeft} className={'text-black'} />
				</div>

				<h1 className={'font-bold m-0 text-black text-xl'}>{name}</h1>
			</header>
			{children}
		</>
	);
}
