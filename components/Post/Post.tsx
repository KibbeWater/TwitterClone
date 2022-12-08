'use client';

import Image from 'next/image';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUpFromBracket, faEllipsis, faRepeat, faTrash, faUser } from '@fortawesome/free-solid-svg-icons';
import { faHeart as fasHeart } from '@fortawesome/free-solid-svg-icons';
import { faComment, faHeart as farHeart } from '@fortawesome/free-regular-svg-icons';

import { IPost } from '../../schemas/IPost';
import { IUser } from '../../schemas/IUser';
import { RefObject, useContext, useEffect, useReducer, useRef, useState } from 'react';
import { UserContext } from '../Handlers/UserHandler';
import { DeletePost, LikePost } from '../../libs/post';
import { ILike } from '../../schemas/ILike';
import { ModalContext } from '../Handlers/ModalHandler';
import PostModal from '../Modals/PostModal';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ImageModal from '../Modals/ImageModal';
import Verified from '../Verified';
import { AnimatePresence, motion } from 'framer-motion';
import { Group } from '../../libs/utils';
import { IRelationship } from '../../schemas/IRelationship';
import { CreateRelationship } from '../../libs/user';

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
	onMutate?: (post: IPost) => void;
};

export default function Post({ post, isRef, onMutate }: Props) {
	const { setModal } = useContext(ModalContext);
	const { user: me, mutate: mutateMe } = useContext(UserContext);

	const [hasLiked, setHasLiked] = useState((post.likes as unknown as ILike[]).filter((like) => like.user?._id == me?._id).length > 0);
	const [count, addCount] = useReducer((count: number) => count + 1, 0);
	const [loadingLikes, setLoadingLikes] = useState(false);
	const [optionsActive, setOptionsActive] = useState(false);
	const [loading, setLoading] = useState(false);
	const [isFollowing, setIsFollowing] = useState(
		!!me?.relationships.find((rel: IRelationship) => rel.target?.toString() == post.user?._id && rel.type == 'follow')
	);

	const imageDisplay = useRef<HTMLDivElement>(null);

	const router = useRouter();

	useEffect(() => {
		const interval = setInterval(() => {
			addCount();
		}, 10000);

		return () => clearInterval(interval);
	});

	useEffect(() => {
		const user = post.user as unknown as IUser | null;
		if (user && user.relationships)
			setIsFollowing(
				!!me?.relationships.find((rel: IRelationship) => rel.target?.toString() == user?._id.toString() && rel.type == 'follow')
			);
	}, [me, post.user]);

	if (!post) return null;

	const user = post.user as unknown as IUser | null;
	const quote = post.quote as unknown as IPost | null;

	const images = post.images || [];

	const isMe = me?._id === user?._id;
	const isAdmin = me?.group == Group.Admin;

	if (!user) return null;

	const routePost = (e: any) => {
		if (e.target !== e.currentTarget) return;
		e.preventDefault();
		router.push(`/post/${post._id}`);
	};

	return (
		<div
			className={`p-3 mb-px w-full relative bg-transparent transition-all cursor-pointer border-b-[1px] border-gray-700 flex hover:bg-gray-500/5  ${
				isRef ? '!border-0 !bg-transparent hover:!bg-transparent' : ''
			}`}
			onClick={routePost}
		>
			{!isRef ? (
				<div className='absolute w-7 h-7 right-2 top-2'>
					<div
						className='w-7 h-7 rounded-full hover:bg-black/20 flex justify-center items-center'
						onClick={() => setOptionsActive((prev) => !prev)}
					>
						<FontAwesomeIcon icon={faEllipsis} className={'text-black dark:text-white'} />
					</div>
					<motion.div
						className={
							'absolute top-7 right-0 w-max py-3 bg-gray-100 dark:bg-neutral-900 shadow-lg rounded-2xl cursor-default overflow-hidden z-20 flex flex-col'
						}
						/* Animate using clip to slowly reveal */
						initial={{ opacity: 0, maxHeight: 0 }}
						variants={{
							enter: { opacity: 1, maxHeight: 120 },
							exit: { opacity: 0, maxHeight: 0 },
						}}
						animate={optionsActive ? 'enter' : 'exit'}
						transition={{ duration: 0.3 }}
					>
						{!isMe ? (
							<button
								disabled={loading}
								className='w-full px-6 py-2 text-center enabled:hover:bg-black/5 enabled:cursor-pointer transition-colors'
								onClick={() => {
									setLoading(true);
									const curFollowing = isFollowing;
									setIsFollowing(!isFollowing);
									CreateRelationship(user._id.toString(), isFollowing ? 'remove' : 'follow')
										.then(() => {
											setLoading(false);
											if (mutateMe) mutateMe();
										})
										.catch(() => {
											setLoading(false);
											setIsFollowing(curFollowing);
										});
								}}
							>
								<p className='text-black dark:text-white font-semibold leading-none'>
									<span className='mr-1'>
										<FontAwesomeIcon icon={faUser} className={'text-black dark:text-white'} />
									</span>{' '}
									{!isFollowing ? `Follow @${user.username}` : `Unfollow @${user.username}`}
								</p>
							</button>
						) : null}
						{isMe || isAdmin ? (
							<button
								disabled={loading}
								className='w-full px-6 py-2 text-center enabled:hover:bg-black/5 enabled:cursor-pointer transition-colors'
								onClick={() => {
									setLoading(true);
									DeletePost(post._id.toString())
										.then(() => {
											if (onMutate) onMutate(post);
										})
										.catch((err) => {
											alert(err);
											setLoading(false);
										});
								}}
							>
								<p className='text-red-500 font-semibold leading-none'>
									<span className='mr-1'>
										<FontAwesomeIcon icon={faTrash} color={'red'} />
									</span>{' '}
									Delete Post
								</p>
							</button>
						) : null}
					</motion.div>
				</div>
			) : null}
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
						className={
							'text-black dark:text-white mr-[5px] cursor-pointer no-underline font-semibold hover:underline truncate flex items-center'
						}
						href={`/@${user.tag}`}
					>
						{user.username} {user.verified ? <Verified color='#f01d1d' /> : null}
					</a>
					<a className={'ml-[2px] text-gray-500 no-underline truncate'} href={`/@${user.tag}`}>
						{`@${user.tag}`}
						<span className='mx-[6px]'>·</span>
					</a>
					<span className={'text-gray-500 hover:underline'}>{FormatDate(new Date(post.date))}</span>
				</div>
				<p className={'text-black dark:text-gray-200'} onClick={routePost}>
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
							'group/quote mt-1 pl-1 rounded-md border-[1px] border-gray-700 transition-colors bg-black/0 hover:bg-gray-500/10'
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
									className={'text-black dark:text-white group-hover/btnComment:text-accent-primary-500'}
								/>
							</Link>
							<p className='text-black dark:text-white text-sm'>{post.comments.length}</p>
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
									className={'text-black dark:text-white group-hover/btnRetweet:text-green-500'}
								/>
							</button>
							<p className='text-black dark:text-white text-sm'>{post.retwaats.length}</p>
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
											? 'text-red-500 group-hover/btnLike:text-black dark:group-hover/btnLike:text-white/60 transition-colors'
											: 'text-black dark:text-white group-hover/btnLike:text-red-500 transition-colors'
									}
								/>
							</button>
							<p className='text-black dark:text-white text-sm'>{post.likes.length}</p>
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
									className={'text-black dark:text-white group-hover/btnShare:text-red-500'}
								/>
							</button>
						</div>
					</div>
				) : null}
			</div>
		</div>
	);
}
