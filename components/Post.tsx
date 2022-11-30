'use client';

import Image from 'next/image';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUpFromBracket, faRepeat } from '@fortawesome/free-solid-svg-icons';
import { faHeart as fasHeart } from '@fortawesome/free-solid-svg-icons';
import { faComment, faHeart as farHeart } from '@fortawesome/free-regular-svg-icons';

import { IPost } from '../schemas/IPost';
import { IUser } from '../schemas/IUser';
import { useContext, useEffect, useReducer, useRef, useState } from 'react';
import { UserContext } from './UserHandler';
import { LikePost } from '../libs/post';
import { ILike } from '../schemas/ILike';
import { ModalContext } from './ModalHandler';
import PostModal from './Modals/PostModal';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ImageModal from './Modals/ImageModal';
import Verified from './Verified';

function FormatDate(date: Date) {
	const now = new Date();
	const diff = now.getTime() - date.getTime();

	if (diff < 10) return 'Now';
	else if (diff < 60000) return Math.floor(diff / 1000) + 's';
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
	const [loadingLikes, setLoadingLikes] = useState(false);

	const imageDisplay = useRef<HTMLDivElement>(null);

	const router = useRouter();

	useEffect(() => {
		const interval = setInterval(() => {
			addCount();
		}, 10000);

		return () => clearInterval(interval);
	});

	if (!post) return null;

	const user = post.user as unknown as IUser | null;
	const quote = post.quote as unknown as IPost | null;

	const images = post.images || [];

	if (!user) return null;

	const routePost = (e: any) => {
		if (e.target !== e.currentTarget) return;
		e.preventDefault();
		router.push(`/post/${post._id}`);
	};

	return (
		<div
			className={`p-3 mb-px w-full bg-transparent transition-all cursor-pointer border-b-[1px] border-gray-700 flex hover:bg-black/5 ${
				isRef ? '!border-0 !bg-transparent hover:!bg-transparent' : ''
			}`}
			onClick={routePost}
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

			<div className={'pl-3 w-full flex flex-col'} onClick={routePost}>
				<div onClick={routePost} className={'flex'}>
					<a
						className={'text-black mr-[5px] cursor-pointer no-underline font-semibold hover:underline flex items-center'}
						href={`/@${user.tag}`}
					>
						{user.username} {user.verified ? <Verified color='#1d9bf0' /> : null}
					</a>
					<a className={'ml-[2px] text-gray-700 no-underline'} href={`/@${user.tag}`}>
						{`@${user.tag}`}
						<span className='mx-[6px]'>·</span>
					</a>
					<span className={'text-gray-700 hover:underline'}>{FormatDate(new Date(post.date))}</span>
				</div>
				<p className={'text-black'} onClick={routePost}>
					{post.content}
				</p>
				<div
					ref={imageDisplay}
					className='w-9/12 grid grid-cols-2 rounded-xl overflow-hidden gap-[2px] justify-self-center border-[1px] border-gray-700'
					style={{
						height: images.length !== 0 ? `${(imageDisplay.current || { clientWidth: 1 }).clientWidth * 0.6}px` : '1px',
						opacity: images.length !== 0 ? 1 : 0,
					}}
					onClick={routePost}
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
					<div className={'mt-3 h-8 flex justify-evenly'}>
						<div className='flex items-center mr-2'>
							<Link
								href={`/post/${post._id}`}
								className={
									'border-0 p-0 h-8 w-8 mr-1 rounded-full flex items-center justify-center transition-colors bg-black/0 cursor-pointer hover:bg-red-500/40 group/btnComment'
								}
							>
								<FontAwesomeIcon
									icon={faComment}
									size={'lg'}
									className={'text-black group-hover/btnComment:text-accent-primary-500'}
								/>
							</Link>
							<p className='text-black text-sm'>{post.comments.length}</p>
						</div>
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
									size={'lg'}
									className={'text-black group-hover/btnRetweet:text-green-500'}
								/>
							</button>
							<p className='text-black text-sm'>{post.retwaats.length}</p>
						</div>
						<div className='flex items-center mr-2'>
							<button
								className={
									'border-0 p-0 h-8 w-8 mr-1 rounded-full flex items-center justify-center transition-colors bg-black/0 cursor-pointer hover:bg-red-500/40 group/btnLike disabled:cursor-default'
								}
								disabled={loadingLikes}
								onClick={() => {
									if (loadingLikes) return;
									setLoadingLikes(true);
									LikePost(post._id as unknown as string, !hasLiked).then(() => {
										setHasLiked((prev) => !prev);
										setLoadingLikes(false);
									});
								}}
							>
								<FontAwesomeIcon
									icon={hasLiked ? fasHeart : farHeart}
									size={'lg'}
									className={
										hasLiked
											? 'text-red-500 group-hover/btnLike:text-black transition-colors'
											: 'text-black group-hover/btnLike:text-red-500 transition-colors'
									}
								/>
							</button>
							<p className='text-black text-sm'>{post.likes.length}</p>
						</div>
						<div className='flex items-center mr-2'>
							<button
								className={
									'border-0 p-0 h-8 w-8 mr-1 rounded-full flex items-center justify-center transition-colors bg-black/0 cursor-pointer hover:bg-red-500/40 group/btnShare disabled:cursor-default'
								}
							>
								<FontAwesomeIcon
									icon={faArrowUpFromBracket}
									size={'lg'}
									className={'text-black group-hover/btnShare:text-red-500'}
								/>
							</button>
						</div>
					</div>
				) : null}
			</div>
		</div>
	);
}
