import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from 'next/image';
import Link from 'next/link';

import { faFeatherPointed, faUser, faHome } from '@fortawesome/free-solid-svg-icons';

export default function Navbar() {
	return (
		<nav className={'min-w-[10%] max-w-[30%] w-full h-screen flex justify-end bg-white border-r-[1px] border-gray-700'}>
			<div className={'flex flex-col items-center mr-4 h-full'}>
				<div
					className={
						'w-16 h-16 mb-1 rounded-full transition-all flex justify-center items-center text-white opacity-0 hover:opacity-25'
					}
				>
					<Link href='/'>
						<Image src='/assets/favicons/android-chrome-512x512.png' alt='Home' width={45} height={45} />
					</Link>
				</div>
				<div className={'w-12 h-12 mb-1 rounded-full bg-black opacity-0 hover:bg-gray-600 hover:opacity-50'}>
					<Link href='/home' className={'w-full h-full flex justify-center items-center'}>
						<FontAwesomeIcon icon={faHome} size={'lg'} color={'black'} />
					</Link>
				</div>
				<div className={'w-12 h-12 mb-1 rounded-full bg-black opacity-0 hover:bg-gray-600 hover:opacity-50'}>
					<a href=''>
						{/* href="/$(username)" */}
						<FontAwesomeIcon icon={faUser} size={'lg'} color={'black'} />
					</a>
				</div>
				<div
					className={
						'w-16 h-16 mb-1 rounded-full transition-all flex justify-center items-center text-white cursor-pointer bg-accent-primary-500 hover:bg-accent-primary-400'
					}
					id='btnPost'
				>
					<FontAwesomeIcon icon={faFeatherPointed} size={'2xl'} color={'white'} />
				</div>
			</div>
		</nav>
	);
}
