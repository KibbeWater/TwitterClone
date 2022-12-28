'use client';

import React, { useContext, useEffect, useRef } from 'react';
import Image from 'next/image';
import useSWR from 'swr';

import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { ModalContext } from '../../../components/Handlers/ModalHandler';
import EditProfileModal from '../../../components/Modals/EditProfileModal';
import PageTemplate from '../../../components/PageTemplate';
import Post from '../../../components/Post/Post';
import { UserContext } from '../../../components/Handlers/UserHandler';
import { CreateRelationship, SafeUser } from '../../../libs/user';
import { IRelationship } from '../../../schemas/IRelationship';
import Verified from '../../../components/Verified';
import { Group } from '../../../libs/utils';
import AdminModal from '../../../components/Modals/AdminModal';
import axios from 'axios';

type Props = {
	params: {
		tag: string;
	};
};

export default function Page({ params }: Props) {
	params.tag = params.tag.replace('%40', '');

	const { modal, setModal } = useContext(ModalContext);
	const { user } = useContext(UserContext);
	const bannerRef = useRef<HTMLDivElement>(null);

	const { data, mutate } = useSWR<{ success: boolean; user: SafeUser }>(`/api/user?tag=${params.tag}`, (url) =>
		axios.get(url).then((r) => r.data)
	);
	const profile = data?.user;

	const [isFollowing, setIsFollowing] = React.useState(
		!!user?.relationships.find((rel: IRelationship) => rel.target?.toString() == profile?._id.toString() && rel.type == 'follow')
	);
	const [followingText, setFollowingText] = React.useState('Following');

	const relationshipArr = user?.relationships ? (user.relationships as unknown as IRelationship[]) : [];
	const relationships: string[] = relationshipArr.map((obj) => obj.target?.toString() as string) || [];

	const bannerSrc = profile?.banner || null;

	const isMe = user?.tag.toLowerCase() === profile?.tag.toLowerCase();

	useEffect(() => {
		if (user)
			setIsFollowing(
				!!user?.relationships.find(
					(rel: IRelationship) => rel.target?.toString() == profile?._id.toString() && rel.type == 'follow'
				)
			);
	}, [user, profile]);

	useEffect(() => {
		if (bannerRef.current) {
			bannerRef.current.classList.remove('hidden');
		}
	}, [bannerSrc]);

	useEffect(() => {
		mutate();
	}, [modal]);

	if (!profile)
		return (
			<PageTemplate name='Loading...'>
				<div className='flex justify-center items-center my-5'>
					<p className='text-black dark:text-white'>Loading...</p>{' '}
					<FontAwesomeIcon icon={faSpinner} size={'lg'} className={'animate-spin ml-3 text-black dark:text-white'} />
				</div>
			</PageTemplate>
		);

	return (
		<PageTemplate name={params.tag}>
			<div>
				<div className='border-b-[1px] border-gray-500'>
					<div className='w-full pb-[33.3%] bg-neutral-700 relative flex justify-center'>
						<div ref={bannerRef}>
							{bannerSrc ? (
								<Image
									src={bannerSrc}
									className={'absolute h-full w-full p-[auto] top-0 bottom-0 right-0 left-0 object-cover'}
									sizes={'100vw'}
									fill
									priority
									alt={`${profile?.username}'s Banner`}
									onError={(e) => bannerRef.current?.classList.add('hidden')}
								/>
							) : null}
						</div>
					</div>
					<div className='w-full flex justify-between relative'>
						<div className='relative h-16 mb-3'>
							<div className='w-32 h-32 absolute left-5 -top-16'>
								<div>
									<Image
										className='object-cover rounded-full border-[4px] border-white dark:border-black bg-white'
										src={profile?.avatar || '/default_avatar.png'}
										alt={`${profile?.username}'s Avatar`}
										sizes={'100vw'}
										quality={100}
										fill
										priority
									/>
								</div>
							</div>
						</div>
						<div className='flex flex-col justify-center absolute right-0 top-0'>
							<div className='mx-3 my-3'>
								{isMe ? (
									<button
										className='bg-black/0 px-[15px] py-2 font-semibold border-[1px] border-gray-400 text-black dark:text-white min-w-[36px] transition-all cursor-pointer rounded-full hover:bg-gray-700/10'
										onClick={() => {
											if (setModal) setModal(<EditProfileModal mutate={mutate} />);
										}}
									>
										Edit profile
									</button>
								) : isFollowing ? (
									<button
										className={
											'bg-black/0 px-[15px] py-2 font-semibold border-[1px] text-black dark:text-white border-gray-700 min-w-[36px] transition-all rounded-full ' +
											'hover:bg-red-500/10 hover:text-red-600 hover:border-red-300 hover:cursor-pointer'
										}
										onClick={() => {
											CreateRelationship(profile?._id, 'remove').then((res) => {
												setIsFollowing((prev) => !prev);
											});
										}}
										onMouseEnter={() => setFollowingText('Unfollow')}
										onMouseLeave={() => setFollowingText('Following')}
									>
										{followingText}
									</button>
								) : (
									<button
										className={
											'bg-black dark:bg-white text-white dark:text-black px-[15px] py-2 font-bold cursor-pointer rounded-full'
										}
										onClick={() => {
											CreateRelationship(profile?._id, 'follow').then((res) => {
												setIsFollowing((prev) => !prev);
											});
										}}
									>
										Follow
									</button>
								)}
							</div>
							{user?.group == Group.Admin ? (
								<button
									className={
										'bg-black dark:bg-white text-white dark:text-black px-[15px] py-2 font-bold cursor-pointer rounded-full mx-3'
									}
									onClick={() => {
										if (setModal) setModal(<AdminModal user={profile} />);
									}}
								>
									Admin
								</button>
							) : null}
						</div>
					</div>
					<div className='mx-3 pb-3'>
						<h3 className='font-bold leading-none text-lg text-black dark:text-white flex items-center'>
							{profile?.username}
							{profile.verified ? <Verified color='#f01d1d' /> : null}
						</h3>
						<p className='mt-1 text-base leading-none text-gray-500'>{`@${profile?.tag}`}</p>
						<p className='my-1 mt-3 text-black dark:text-white'>{profile?.bio}</p>
						<div className='flex my-2'>
							<p className='m-0 mr-2 text-black dark:text-white'>
								<span className='font-bold'>0</span> Following
							</p>
							<p className='m-0 mr-2 text-black dark:text-white'>
								<span className='font-bold'>0</span> Followers
							</p>
						</div>
					</div>
				</div>
				<div className='flex flex-col items-center'>
					{profile.posts.length !== undefined
						? profile.posts
								.map((post) => {
									return <Post key={post._id.toString()} post={post} onMutate={() => mutate()} />;
								})
								.sort((a, b) => b.props.post.date - a.props.post.date)
						: null}
				</div>
			</div>
		</PageTemplate>
	);
}
