'use client';

import { faArrowLeft, faArrowRight, faEllipsis, faSpinner, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeSvgIcon } from 'react-fontawesome-svg-icon';
import Image from 'next/image';
import Link from 'next/link';
import { useContext, useEffect, useRef, useState } from 'react';
import useSWRInfinite from 'swr/infinite';

import { IPost } from '../../types/IPost';
import { IUser } from '../../types/IUser';
import PostFooter from '../Post/PostFooter';
import { UserContext } from '../Handlers/UserHandler';
import PostModal from '../Post/Post';
import { ModalContext } from '../Handlers/ModalHandler';
import axios from 'redaxios';
import PostTwaat from '../Post/PostTwaat';
import { fullCDNImageLoader } from '../../libs/utils';

type Props = {
	src: string;
	post: IPost;
};

export default function ImageModal({ src, post }: Props) {
	const [commentsOpen, setCommentsOpen] = useState(true);
	const [isVisible, setIsVisible] = useState(false);

	const { user: me } = useContext(UserContext);
	const { setModal } = useContext(ModalContext);

	const fetcher = (url: string) => axios.get(url).then((res) => res.data);
	const { data, size, setSize, mutate, isValidating } = useSWRInfinite<{ success: boolean; data: IPost[]; pages: number }>(
		(pageIndex: number, previousPageData: { success: boolean; data: IPost[]; pages: number } | null) => {
			if (previousPageData && !previousPageData.data) return null;
			return `/api/post?page=${pageIndex}&parent=${post._id}`;
		},
		fetcher
	);

	const isRefreshing = isValidating && data && data.length === size;
	const totalPages = data ? data[data.length - 1].pages : 0;

	let posts = data ? data.map((page) => page.data).flat() : [];
	const pages = (data ? data.map((page) => page.pages).flat() : [])[0];

	const loadingRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (isVisible && !isRefreshing && size < totalPages) setSize(size + 1);
	}, [isVisible, isRefreshing, totalPages]);

	useEffect(() => {
		if (!loadingRef.current) return;

		const observer = new IntersectionObserver(([entry]) => {
			setIsVisible(entry.isIntersecting);
		});

		observer.observe(loadingRef.current);

		return () => observer.disconnect();
	}, [loadingRef]);

	if (!post) throw new Error('Post not found');

	const user = post.user as unknown as IUser;

	const closeOnBg = (e: any) => {
		if (e.target !== e.currentTarget) return;
		e.preventDefault();
		if (setModal) setModal(null);
	};

	return (
		<div className='flex w-full h-full justify-end'>
			<div className='grow relative flex flex-col justify-end items-center' onClick={closeOnBg}>
				<div
					className={
						'absolute w-8 h-8 rounded-full bg-gray-700/20 backdrop-blur-sm' +
						' top-2 right-2 flex items-center justify-center cursor-pointer z-10'
					}
					onClick={() => setCommentsOpen((prev) => !prev)}
				>
					<FontAwesomeSvgIcon icon={commentsOpen ? faArrowRight : faArrowLeft} />
				</div>
				<div
					className={
						'absolute w-8 h-8 rounded-full bg-gray-700/20 backdrop-blur-sm' +
						' top-2 left-2 flex items-center justify-center cursor-pointer z-10'
					}
					onClick={() => {
						if (setModal) setModal(null);
					}}
				>
					<FontAwesomeSvgIcon icon={faXmark} />
				</div>
				<div className='grow h-full w-full relative'>
					<div className='absolute left-0 right-0 top-0 bottom-0 m-auto flex' onClick={closeOnBg}>
						<Image
							className='w-auto h-full object-contain'
							quality={100}
							src={src}
							sizes={'100vw'}
							fill
							alt={'Post Image'}
							loader={fullCDNImageLoader}
						/>
					</div>
				</div>
				<div className='py-1 flex items-center justify-evenly w-2/6' onClick={closeOnBg}>
					<PostFooter post={post} color={'white'} />
				</div>
			</div>
			<div
				className='h-full pt-3 min-w-max w-2/12 bg-white dark:bg-black dark:border-l-[1px] dark:border-gray-500/20'
				style={{ display: commentsOpen ? 'block' : 'none' }}
			>
				<div className='flex justify-between mx-3'>
					<div className='flex'>
						<div className='relative h-12 w-12'>
							<Link href={'/@' + user.tag} className='absolute h-12 w-12'>
								<Image
									src={user.avatar || '/default_avatar.png'}
									alt={"Author's Avatar"}
									sizes={'100vw'}
									fill
									className='rounded-full object-cover cursor-pointer transition-opacity hover:opacity-80'
								/>
							</Link>
						</div>
						<div>
							<div className='flex flex-col ml-3'>
								<Link href={`/@${user.tag}`} className='text-sm font-semibold m-0 text-black dark:text-white'>
									{user.username}
								</Link>
								<Link href={`/@${user.tag}`} className='text-gray-500 text-sm m-0'>
									@{user.tag}
								</Link>
							</div>
						</div>
					</div>
					<div>
						<div className='group/postMenu bg-red-500/0 hover:bg-red-500/30 hover:cursor-pointer w-8 h-8 rounded-full flex justify-center items-center'>
							<FontAwesomeSvgIcon icon={faEllipsis} className={'group-hover/postMenu:text-accent-primary-500 text-black'} />
						</div>
					</div>
				</div>
				<div className='mx-3 mt-2'>
					<p className='text-xl text-black dark:text-white'>{post.content}</p>
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
					<div className='h-px grow mx-3 my-3 bg-gray-500/20' />
					<div className='mx-3 flex items-center'>
						<p className='text-sm ml-1 mr-4 text-gray-500'>
							<span className='font-semibold text-black dark:text-white'>{post.retwaats.length}</span> Retwaats
						</p>
						<p className='text-sm ml-1 mr-4 text-gray-500'>
							<span className='font-semibold text-black dark:text-white'>{post.likes.length}</span> Likes
						</p>
					</div>
					<div className='h-px grow mx-3 my-3 bg-gray-500/20' />
					<div className='flex justify-evenly mx-3 mt-3'>
						<PostFooter post={post} />
					</div>
					<div className='h-px grow mx-3 my-3 bg-gray-500/20' />
				</div>
				<div className='mt-2 flex'>
					<PostTwaat parent={post._id.toString()} inline={true} padding={12} placeholder={'Twaat your reply'} btnText={'Reply'}>
						<div className='h-px grow mt-3 bg-gray-700' />
					</PostTwaat>
				</div>
				{(!posts ? (post.comments as unknown as [IPost]) : posts).map((reply: IPost) => (
					<PostModal key={reply._id.toString()} post={reply as unknown as IPost} />
				))}
				<div
					className={'w-full mt-4 flex justify-center items-center' + (!isValidating ? ' invisible' : ' visible')}
					ref={loadingRef}
				>
					<FontAwesomeSvgIcon icon={faSpinner} size={'2x'} color={'black'} className={'animate-spin'} />
				</div>
			</div>
		</div>
	);
}
