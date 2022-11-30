'use client';

import { faArrowLeft, faArrowRight, faEllipsis, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from 'next/image';
import Link from 'next/link';
import { useContext, useState } from 'react';

import { IPost } from '../../schemas/IPost';
import { IUser } from '../../schemas/IUser';
import PostFooter from '../PostFooter';
import PostReply from '../PostReply';
import { UserContext } from '../UserHandler';
import PostModal from '../Post';
import { ModalContext } from '../ModalHandler';

type Props = {
	src: string;
	post: IPost;
};

export default function ImageModal({ src, post }: Props) {
	const [commentsOpen, setCommentsOpen] = useState(true);

	const { user: me } = useContext(UserContext);
	const { setModal } = useContext(ModalContext);

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
						' top-2 right-2 flex items-center justify-center cursor-pointer'
					}
					onClick={() => setCommentsOpen((prev) => !prev)}
				>
					<FontAwesomeIcon icon={commentsOpen ? faArrowRight : faArrowLeft} />
				</div>
				<div
					className={
						'absolute w-8 h-8 rounded-full bg-gray-700/20 backdrop-blur-sm' +
						' top-2 left-2 flex items-center justify-center cursor-pointer'
					}
					onClick={() => {
						if (setModal) setModal(null);
					}}
				>
					<FontAwesomeIcon icon={faXmark} />
				</div>
				<div className='grow h-full w-full relative'>
					<div className='absolute left-0 right-0 top-0 bottom-0 m-auto' onClick={closeOnBg}>
						<Image
							className={'object-contain !w-auto left-0 right-0 m-auto'}
							src={src}
							alt={'Post Image'}
							sizes={'100%'}
							fill
						/>
					</div>
				</div>
				<div className='py-1 flex items-center justify-evenly w-2/6' onClick={closeOnBg}>
					<PostFooter post={post} color={'white'} />
				</div>
			</div>
			<div className='h-full pt-3 w-2/12 bg-white' style={{ display: commentsOpen ? 'block' : 'none' }}>
				<div className='flex justify-between mx-3'>
					<div className='flex'>
						<div className='relative h-12 w-12'>
							<Link href={'/@' + user.tag} className='absolute h-12 w-12'>
								<Image
									src={user.avatar || '/default_avatar.png'}
									alt={"Author's Avatar"}
									width={48}
									height={48}
									className='rounded-full object-cover cursor-pointer transition-opacity hover:opacity-80'
								/>
							</Link>
						</div>
						<div>
							<div className='flex flex-col ml-3'>
								<Link href={`/@${user.tag}`} className='text-sm font-semibold m-0 text-black'>
									{user.username}
								</Link>
								<Link href={`/@${user.tag}`} className='text-gray-600 text-sm m-0'>
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
					<p className='text-xl text-black'>{post.content}</p>
				</div>
				<div>
					<div className='flex justify-between mx-3 mt-3'>
						{/* Format date: h:mm (AM/PM) (dot) M D, Y */}
						<p className='text-gray-600 text-sm hover:underline cursor-pointer'>
							{new Date(post.date).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}
							{' · '}
							{new Date(post.date).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
						</p>
					</div>
					<div className='h-px grow mx-3 my-3 bg-gray-600/10' />
					<div className='mx-3 flex items-center'>
						<p className='text-sm ml-1 mr-4 text-gray-700'>
							<span className='font-semibold text-black'>{post.retwaats.length}</span> Retwaats
						</p>
						<p className='text-sm ml-1 mr-4 text-gray-700'>
							<span className='font-semibold text-black'>{post.likes.length}</span> Likes
						</p>
					</div>
					<div className='h-px grow mx-3 my-3 bg-gray-600/10' />
					<div className='flex justify-evenly mx-3 mt-3'>
						<PostFooter post={post} />
					</div>
					<div className='h-px grow mx-3 my-3 bg-gray-600/10' />
				</div>
				{me ? (
					<>
						<div className='mx-3 mt-2 flex'>
							<PostReply user={me} post={post._id.toString()} />
						</div>
						<div className='h-px grow mt-3 bg-gray-700' />
					</>
				) : null}
				{post.comments.map((reply) => (
					<PostModal key={reply._id.toString()} post={reply as unknown as IPost} />
				))}
			</div>
		</div>
	);
}
