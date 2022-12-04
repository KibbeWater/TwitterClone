'use client';

import { useContext, useEffect, useReducer } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import axios from 'axios';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFeatherPointed, faUser, faHome, faEllipsis, faMoon, faSun, faBell } from '@fortawesome/free-solid-svg-icons';

import { ModalContext } from './Handlers/ModalHandler';
import PostModal from './Modals/PostModal';
import { UserContext } from './Handlers/UserHandler';
import { useTheme } from './Handlers/ThemeHandler';

export default function Navbar() {
	const [activateUserPanel, setActivateUserPanel] = useReducer((state) => !state, false);
	const [revalidate, setRevalidate] = useReducer(() => ({}), {});

	const { theme, setTheme } = useTheme();

	const { setModal } = useContext(ModalContext);
	const { user } = useContext(UserContext);

	useEffect(() => {
		setRevalidate();
	}, [user]);

	return (
		<nav
			className={
				'min-w-[10%] max-w-[25%] ml-3 w-full h-screen flex justify-end bg-white dark:bg-black border-r-[1px] border-gray-700'
			}
		>
			<div className='flex flex-col h-full'>
				<div className={'flex flex-col mr-4 w-16 md:w-60'}>
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
							<FontAwesomeIcon icon={faHome} size={'xl'} className={'text-black dark:text-white'} />
						</div>

						<span className='ml-5 font-bold text-lg hidden md:block text-black dark:text-white'>Home</span>
					</Link>
					<Link href='/notifications' className={'h-12 mb-2 rounded-full bg-transparent hover:bg-gray-600/25 flex items-center'}>
						<div className='w-8 ml-4 flex items-center justify-center'>
							<FontAwesomeIcon icon={faBell} size={'xl'} className={'text-black dark:text-white'} />
						</div>

						<span className='ml-5 font-bold text-lg hidden md:block text-black dark:text-white'>Notifications</span>
					</Link>
					<Link
						href={user ? `@${user.tag}` : '/login'}
						className={'h-12 mb-2 rounded-full bg-transparent hover:bg-gray-600/25 flex items-center'}
					>
						<div className='w-8 ml-4 flex items-center justify-center'>
							<FontAwesomeIcon icon={faUser} size={'xl'} className={'text-black dark:text-white'} />
						</div>
						<span className='ml-5 font-bold text-lg hidden md:block text-black dark:text-white'>Profile</span>
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
						<span className='hidden transition-all md:block text-lg font-bold opacity-0 md:opacity-100 text-white'>Twaat</span>
					</button>
				</div>
				<div className='flex items-end mb-2 mr-4 h-full'>
					{user ? (
						<div className={'w-16 h-16 md:h-14 text-white md:w-full relative'}>
							<button
								className={
									'h-full w-full rounded-full transition-all hover:bg-gray-500/10' +
									' cursor-pointer flex justify-between items-center mb-1 px-2'
								}
								onClick={() => setActivateUserPanel()}
							>
								<div className='flex items-center justify-center'>
									<div className='w-11 h-11 relative'>
										<div className='w-11 h-11 absolute'>
											<Image
												src={user?.avatar || '/default_avatar.png'}
												alt={'Your Avatar'}
												sizes={'100vw'}
												fill
												className={'rounded-full h-'}
											/>
										</div>
									</div>

									<div className='ml-2 flex flex-col items-start'>
										<p className='hidden transition-all md:block font-bold opacity-0 md:opacity-100 text-black dark:text-white leading-[1.1]'>
											{user?.username}
										</p>
										<p className='hidden transition-all md:block opacity-0 md:opacity-100 w-min text-gray-600 leading-[1.1]'>{`@${user?.tag}`}</p>
									</div>
								</div>
								<div className='mr-2'>
									<FontAwesomeIcon icon={faEllipsis} className={'text-black dark:text-white'} />
								</div>
							</button>
							<div
								className={`absolute m-2 py-4 bottom-16 left-0 right-0 bg-gray-100 dark:bg-neutral-900 shadow-lg rounded-2xl cursor-default overflow-hidden ${
									activateUserPanel ? 'opacity-100' : 'opacity-0'
								}`}
							>
								<div className='w-full'>
									<div
										className='w-full pl-4 pr-2 h-8 hover:bg-gray-500/20 transition-all cursor-pointer flex items-center'
										onClick={() => {
											axios
												.get('/api/user/logout')
												.then(() => {
													window.location.reload();
												})
												.catch((err) => {
													alert(err);
													console.log(err);
												});
										}}
									>
										<p className='text-left font-semibold text-black dark:text-white leading-none'>
											Log out @{user?.tag}
										</p>
									</div>
									<div
										className='w-full pl-4 pr-2 h-8 hover:bg-gray-500/20 transition-all cursor-pointer flex items-center'
										onClick={() => {
											setTheme(theme === 'light' ? 'dark' : 'light');
										}}
									>
										{theme === 'dark' ? (
											<p className='text-left font-semibold text-black dark:text-white leading-none'>
												<span>
													<FontAwesomeIcon icon={faSun} className={'text-black dark:text-white mr-1'} />
												</span>{' '}
												Light Mode
											</p>
										) : (
											<p className='text-left font-semibold text-black dark:text-white leading-none'>
												<span>
													<FontAwesomeIcon icon={faMoon} className={'text-black dark:text-white mr-1'} />
												</span>{' '}
												Dark Mode (BETA)
											</p>
										)}
									</div>
								</div>
							</div>
						</div>
					) : null}
				</div>
			</div>
		</nav>
	);
}
