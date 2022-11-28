'use client';

import Image from 'next/image';
import React, { useContext, useEffect, useRef } from 'react';

import PageTemplate from '../../../components/PageTemplate';
import { UserContext } from '../../../components/UserHandler';

type Props = {
	params: {
		tag: string;
	};
};

export default function Page({ params }: Props) {
	params.tag = params.tag.replace('%40', '');

	const user = useContext(UserContext);
	const avatarRef = useRef<HTMLDivElement>(null);
	const bannerRef = useRef<HTMLDivElement>(null);

	const bannerSrc = user?.banner || '';

	const isMe = user?.tag.toLowerCase() === params.tag.toLowerCase();

	const isFollowing = true;

	useEffect(() => {
		if (bannerRef.current) {
			bannerRef.current.classList.remove('hidden');
		}
	}, [bannerSrc]);

	return (
		<PageTemplate name={params.tag}>
			<div>
				<div className='border-b-[1px] border-gray-500'>
					<div className='w-full pb-[33.3%] bg-gray-800 relative flex justify-center'>
						<div ref={bannerRef}>
							<Image
								src={bannerSrc}
								className={'absolute h-full w-full p-[auto] top-0 bottom-0 right-0 left-0 object-cover'}
								sizes={'100vw'}
								fill
								alt={`${user?.username}'s Banner`}
								onError={(e) => bannerRef.current?.classList.add('hidden')}
							/>
						</div>
					</div>
					<div className='w-full flex justify-between'>
						<div className='relative h-12'>
							<div className='w-24 h-24 absolute left-5 -top-[50px]'>
								<div ref={avatarRef}>
									<Image
										className='object-cover rounded-full border-[4px] border-white'
										src={user?.avatar || '/default_avatar.png'}
										alt={`${user?.username}'s Avatar`}
										sizes={'100vw'}
										fill
									/>
								</div>
							</div>
						</div>
						<div className='mx-3 my-3'>
							{isMe ? (
								<button className='bg-black/0 px-[15px] py-2 font-semibold border-[1px] border-gray-400 text-black min-w-[36px] transition-all cursor-pointer rounded-full hover:bg-gray-700/10'>
									Edit profile
								</button>
							) : isFollowing ? (
								<button
									className={
										'bg-black/0 px-[15px] py-2 font-semibold border-[1px] text-black border-gray-700 min-w-[36px] transition-all rounded-full ' +
										'hover:bg-red-500/10 hover:text-red-600 hover:border-red-300 hover:cursor-pointer'
									}
								>
									Following
								</button>
							) : (
								<button className={'bg-black text-white px-[15px] py-2 font-bold cursor-pointer rounded-full'}>
									Follow
								</button>
							)}
						</div>
					</div>
					<div className='mx-3 pb-3'>
						<h3 className='mb-[2px] font-bold text-lg text-black'>{user?.username}</h3>
						<h4 className='mt-[2px] text-lg text-gray-500'>{`@${user?.tag}`}</h4>
						<p className='my-1 text-black'>{user?.bio}</p>
						<div className='flex my-2'>
							<p className='m-0 mr-1 text-black'>
								<span className='font-bold'>0</span> Following
							</p>
							<p className='m-0 mr-1 text-black'>
								<span className='font-bold'>0</span> Followers
							</p>
						</div>
					</div>
				</div>
				<div className='flex flex-col items-center'></div>
			</div>
		</PageTemplate>
	);
}
