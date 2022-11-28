'use client';

import { useContext } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFeatherPointed, faUser, faHome } from '@fortawesome/free-solid-svg-icons';

import { ModalContext } from './ModalHandler';
import PostModal from './Modals/PostModal';
import { UserContext } from './UserHandler';

export default function Navbar() {
	const { setModal } = useContext(ModalContext);
	const user = useContext(UserContext);

	return (
		<nav className={'min-w-[10%] max-w-[25%] ml-3 w-full h-screen flex justify-end bg-white border-r-[1px] border-gray-700'}>
			<div className={'flex flex-col mr-4 h-full w-16 md:w-60'}>
				<Link
					href='/home'
					className={
						'h-16 w-16 mb-1 rounded-full transition-all flex items-center justify-center bg-transparent hover:bg-accent-primary-500/25'
					}
				>
					<Image src='/assets/favicons/android-chrome-512x512.png' alt='Home' width={45} height={45} />
				</Link>
				<Link href='/home' className={'h-12 mb-2 rounded-full bg-transparent hover:bg-gray-600/25 flex items-center'}>
					<div className='w-8 ml-4 flex items-center justify-center'>
						<FontAwesomeIcon icon={faHome} size={'xl'} color={'black'} />
					</div>

					<span className='ml-5 text-black font-bold text-lg hidden md:block'>Home</span>
				</Link>
				<Link
					href={user ? `@${user.tag}` : '/login'}
					className={'h-12 mb-2 rounded-full bg-transparent hover:bg-gray-600/25 flex items-center'}
				>
					<div className='w-8 ml-4 flex items-center justify-center'>
						<FontAwesomeIcon icon={faUser} size={'xl'} color={'black'} />
					</div>
					<span className='ml-5 text-black font-bold text-lg hidden md:block'>Profile</span>
				</Link>
				<button
					className={
						'w-16 h-16 md:h-14 mb-1 rounded-full transition-all flex justify-center items-center text-white cursor-pointer bg-accent-primary-500 hover:bg-accent-primary-400 md:w-full'
					}
					id='btnPost'
					onClick={() => {
						if (setModal) setModal(<PostModal />);
					}}
				>
					<FontAwesomeIcon
						icon={faFeatherPointed}
						size={'2xl'}
						color={'white'}
						className={'transition-all opacity-100 md:opacity-0 block md:!hidden'}
					/>
					<span className='hidden transition-all md:block text-lg font-bold opacity-0 md:opacity-100'>Twaat</span>
				</button>
			</div>
		</nav>
	);
}
