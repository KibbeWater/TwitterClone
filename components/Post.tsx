'use client';

import Image from 'next/image';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRepeat } from '@fortawesome/free-solid-svg-icons';
import { faHeart as fasHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as farHeart } from '@fortawesome/free-regular-svg-icons';

import { IPost } from '../schemas/IPost';
import { IUser } from '../schemas/IUser';
import { useContext, useEffect, useReducer, useRef, useState } from 'react';
import { UserContext } from './UserHandler';
import { LikePost } from '../libs/post';
import { ILike } from '../schemas/ILike';
import { ModalContext } from './ModalHandler';
import PostModal from './Modals/PostModal';

function FormatDate(date: Date) {
	const now = new Date();
	const diff = now.getTime() - date.getTime();

	if (diff < 60000) return Math.floor(diff / 1000) + 's';
	else if (diff < 3600000) return Math.floor(diff / 60000) + 'm';
	else if (diff < 86400000) return Math.floor(diff / 3600000) + 'h';
	else if (diff < 31536000000) return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
	else return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

type Props = {
	post: IPost;
	isRef?: boolean;
};

export default function Post({ post, isRef }: Props) {
	const { setModal } = useContext(ModalContext);
	const { user: me } = useContext(UserContext);
	const [hasLiked, setHasLiked] = useState((post.likes as unknown as ILike[]).findIndex((like) => like.user === me?._id) !== -1);

	const [count, addCount] = useReducer((count: number) => count + 1, 0);

	const imageDisplay = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const interval = setInterval(() => {
			addCount();
		}, 1000);

		return () => clearInterval(interval);
	});

	if (!post) return null;

	const user = post.user as unknown as IUser | null;
	const quote = post.quote as unknown as IPost | null;

	const images = post.images || [];

	if (!user) return null;

	return (
		<div
			className={`p-3 mb-px w-full bg-transparent transition-all cursor-pointer border-b-[1px] border-gray-700 flex hover:bg-black/5 ${
				isRef ? '!border-0 !bg-transparent hover:!bg-transparent' : ''
			}`}
		>
			<div className='w-12 h-12 relative'>
				<div className='w-12 h-12 absolute'>
					<Image
						className={'w-full h-full rounded-full object-cover cursor-pointer transition-opacity hover:opacity-80'}
						src={user.avatar || '/default_avatar.png'}
						alt={`${user.tag}'s avatar`}
						width={48}
						height={48}
					/>
				</div>
			</div>

			<div className={'pl-3 w-full flex flex-col'}>
				<div>
					<a className={'text-black mr-[5px] cursor-pointer no-underline font-semibold hover:underline'} href={`/@${user.tag}`}>
						{user.username}
					</a>
					<a className={'ml-1 text-gray-700 no-underline'} href={`/@${user.tag}`}>
						{`@${user.tag}`}
						<span className='mx-[6px]'>·</span>
					</a>
					<span className={'text-gray-700 hover:underline'}>{FormatDate(new Date(post.date))}</span>
				</div>
				<p className={'text-black'}>{post.content}</p>
				<div
					ref={imageDisplay}
					className='w-9/12 grid grid-cols-2 rounded-xl overflow-hidden gap-[2px] justify-self-center border-[1px] border-gray-700'
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
							<Image src={img} className={'object-cover w-full h-full'} alt={`Album image ${i}`} sizes={'100vw'} fill />
						</div>
					))}
				</div>
				{!quote || isRef ? (
					<></>
				) : (
					<div
						className={
							'group/quote mt-1 pl-1 rounded-md border-[1px] border-gray-700 transition-colors bg-black/0 hover:bg-black/10'
						}
					>
						<Post post={quote} isRef={true} />
					</div>
				)}
				{!isRef ? (
					<div className={'mt-3 h-8 flex'}>
						<div className='flex items-center mr-2'>
							<button
								className={
									'border-0 p-0 h-8 w-8 mr-1 rounded-full flex items-center justify-center transition-colors bg-black/0 cursor-pointer hover:bg-[#3cff3c]/40 group/btnRetweet'
								}
								onClick={() => {
									if (setModal) setModal(<PostModal quote={post} />);
								}}
							>
								<FontAwesomeIcon
									icon={faRepeat}
									size={'xl'}
									className={'text-black group-hover/btnRetweet:text-green-500'}
								/>
							</button>
							<p className='text-black'>
								<span className='font-bold'>{post.retwaats.length}</span> Retwaats
							</p>
						</div>
						<div className='flex items-center mr-2'>
							<button
								className={
									'border-0 p-0 h-8 w-8 mr-1 rounded-full flex items-center justify-center transition-colors bg-black/0 cursor-pointer hover:bg-red-500/40 group/btnLike'
								}
								onClick={() => {
									LikePost(post._id as unknown as string, !hasLiked).then(() => {
										setHasLiked((prev) => !prev);
									});
								}}
							>
								<FontAwesomeIcon
									icon={hasLiked ? fasHeart : farHeart}
									size={'xl'}
									className={
										hasLiked
											? 'text-red-500 group-hover/btnLike:text-black transition-colors'
											: 'text-black group-hover/btnLike:text-red-500 transition-colors'
									}
								/>
							</button>
							<p className='text-black'>
								<span className='font-bold'>{post.likes.length}</span> Likes
							</p>
						</div>
					</div>
				) : null}
			</div>
		</div>
	);
}
