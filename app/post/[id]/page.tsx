'use client';

import axios from 'redaxios';
import Image from 'next/image';
import Link from 'next/link';
import { useContext, useEffect, useRef } from 'react';
import useSWR from 'swr';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsis, faSpinner } from '@fortawesome/free-solid-svg-icons';

import { UserContext } from '../../../components/Handlers/UserHandler';
import PageTemplate from '../../../components/PageTemplate';
import PostComments from '../../../components/Post/PostComments';
import PostFooter from '../../../components/Post/PostFooter';
import Verified from '../../../components/Verified';
import { IPost } from '../../../types/IPost';
import { IUser } from '../../../types/IUser';
import Post from '../../../components/Post/Post';
import { ModalContext } from '../../../components/Handlers/ModalHandler';
import ImageModal from '../../../components/Modals/ImageModal';
import PostContent from '../../../components/Post/PostContent';

type Props = {
	params: {
		id: string;
	};
};
export default function Page({ params }: Props) {
	const { data, mutate } = useSWR<{ success: boolean; post: IPost & { comments: IPost[] } }>(`/api/post?id=${params.id}`, (url: string) =>
		axios.get(url).then((res) => res.data)
	);

	const post = data?.post;
	const user = post?.user as unknown as IUser;
	const quote = post?.quote as unknown as IPost;
	const images = post?.images || [];

	const { user: me } = useContext(UserContext);
	const { modal, setModal } = useContext(ModalContext);

	const imageDisplay = useRef<HTMLDivElement>(null);

	useEffect(() => {
		mutate();
	}, [modal]);

	if (!post)
		return (
			<PageTemplate name='Loading...'>
				<div className='flex justify-center items-center my-5'>
					<p className='text-black dark:text-white'>Loading...</p>{' '}
					<FontAwesomeIcon icon={faSpinner} size={'lg'} className={'animate-spin ml-3 text-black dark:text-white'} />
				</div>
			</PageTemplate>
		);

	return (
		<PageTemplate name='Twaat'>
			<div className='flex flex-col'>
				<div className='flex justify-between mx-3'>
					<div className='flex'>
						<div className='relative h-12 w-12'>
							<Link href={'/@' + user.tag} className='absolute h-12 w-12'>
								<Image
									src={user.avatar || '/default_avatar.png'}
									alt={"Author's Avatar"}
									fill
									priority
									sizes={'100vw'}
									className='rounded-full object-cover cursor-pointer transition-opacity hover:opacity-80'
								/>
							</Link>
						</div>
						<div className='flex items-center'>
							<div className='flex flex-col ml-3 '>
								<Link
									href={`/@${user.tag}`}
									className='text-base truncate mb-1 leading-none font-semibold m-0 text-black dark:text-white flex'
								>
									{user.username}
									{user.verified ? <Verified color='#f01d1d' /> : null}
								</Link>
								<Link href={`/@${user.tag}`} className='text-gray-500 truncate mb-1 leading-none text-base m-0'>
									@{user.tag}
								</Link>
							</div>
						</div>
					</div>
					<div>
						<div className='group/postMenu bg-red-500/0 hover:bg-red-500/30 hover:cursor-pointer w-8 h-8 rounded-full flex justify-center items-center'>
							<FontAwesomeIcon icon={faEllipsis} className={'group-hover/postMenu:text-accent-primary-500 text-black'} />
						</div>
					</div>
				</div>
				<div className='mx-3 mt-2'>
					<PostContent post={post} />
					<div
						ref={imageDisplay}
						className='w-full grid grid-cols-2 rounded-xl overflow-hidden gap-[2px] justify-self-center border-[1px] border-gray-700'
						style={{
							height: images.length !== 0 ? `${(imageDisplay.current || { clientWidth: 1 }).clientWidth * 0.6}px` : '1px',
							opacity: images.length !== 0 ? 1 : 0,
						}}
					>
						{images.map((img, i) => (
							<div
								key={`post-${post._id}-image-${i}`}
								className={
									'w-full h-full relative' +
									(images.length == 1 || (images.length == 3 && i == 0) ? ' row-span-2' : '') +
									(images.length == 1 ? ' col-span-2' : '')
								}
							>
								<Image
									src={img}
									className={'object-cover w-full h-full'}
									alt={`Album image ${i}`}
									sizes={'100vw'}
									fill
									onClick={() => {
										if (setModal) setModal(<ImageModal src={img} post={post} />);
									}}
								/>
							</div>
						))}
					</div>
					{quote ? (
						<div
							className={
								'group/quote mt-1 pl-1 rounded-md border-[1px] border-gray-700 transition-colors bg-black/0 hover:bg-gray-500/10'
							}
						>
							<Post post={quote} isRef={true} onMutate={() => mutate()} />
						</div>
					) : null}
				</div>
				<div>
					<div className='flex justify-between mx-3 mt-3'>
						{/* Format date: h:mm (AM/PM) (dot) M D, Y */}
						<p className='text-gray-500 text-sm hover:underline cursor-pointer'>
							{new Date(post.date).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}
							{' · '}
							{new Date(post.date).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
						</p>
					</div>
					<div className='h-px grow mx-3 my-3 bg-gray-500/30' />
					<div className='mx-3 flex items-center'>
						<p className='text-sm ml-1 mr-4 text-gray-500 '>
							<span className='font-semibold text-black dark:text-white'>{post.retwaats.length}</span> Retwaats
						</p>
						<p className='text-sm ml-1 mr-4 text-gray-500'>
							<span className='font-semibold text-black dark:text-white'>{post.likes.length}</span> Likes
						</p>
					</div>
					<div className='h-px grow mx-3 my-3 bg-gray-500/30' />
					<div className='flex justify-evenly mx-3 mt-3'>
						<PostFooter post={post} />
					</div>
					<div className='h-px grow mx-3 my-3 bg-gray-500/30' />
				</div>
				{/* @ts-ignore */}
				<PostComments post={post} placeholder={post.comments} />
			</div>
		</PageTemplate>
	);
}
