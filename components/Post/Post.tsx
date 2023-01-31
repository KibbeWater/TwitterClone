'use client';

import Image from 'next/image';

import { faComment, faHeart as farHeart } from '@fortawesome/free-regular-svg-icons';
import {
	faArrowUpFromBracket,
	faEllipsis,
	faHeart as fasHeart,
	faPlay,
	faRepeat,
	faTrash,
	faUser,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useContext, useEffect, useReducer, useRef, useState } from 'react';

import { useMemo } from 'react';
import { DeletePost, LikePost } from '../../libs/post';
import { CreateRelationship } from '../../libs/user';
import { fullCDNImageLoader, Group } from '../../libs/utils';
import { ILike } from '../../types/ILike';
import { IPost } from '../../types/IPost';
import { IRelationship } from '../../types/IRelationship';
import { IUser } from '../../types/IUser';
import { ModalContext } from '../Handlers/ModalHandler';
import { UserContext } from '../Handlers/UserHandler';
import ImageModal from '../Modals/ImageModal';
import PostModal from '../Modals/PostModal';
import Verified from '../Verified';
import PostContent from './PostContent';

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

function VideoPlayer({ video, videoCount, videoIndex, key }: { video: string; videoCount: number; videoIndex: number; key: string }) {
	const playBtn = useRef<HTMLDivElement>(null);
	const videoRef = useRef<HTMLVideoElement>(null);

	useEffect(() => {
		import('hls.js').then((hlsModules) => {
			const HLS = hlsModules.default;

			if (!videoRef.current) return;

			if (videoRef.current && HLS.isSupported()) {
				const hls = new HLS();
				hls.attachMedia(videoRef.current);

				videoRef.current.addEventListener('play', () => {
					if ((videoRef.current as HTMLVideoElement).readyState >= 2) return;

					hls.loadSource(video);
					hls.on(HLS.Events.MANIFEST_PARSED, () => {
						(videoRef.current as HTMLVideoElement).play();
					});
				});
			}
		});
	}, [videoRef.current]);

	// Get the thumbnail, ${videoId}_thumb.xxxxxxx.jpg. Video looks like this: https://${url}.cloudfront.net/video_streaming/${videoId}_${resolution}p.m3u8
	const thumbCont = '0';
	const thumbUrl = video.replace('.m3u8', `_thumb.000000${thumbCont}.jpg`);

	const playVideo = () => {
		// playBtn has to be shown if this should run
		if (!playBtn.current) return;
		if (playBtn.current.classList.contains('hidden')) return;

		if (videoRef.current) {
			videoRef.current.play();
			videoRef.current.controls = true;
			playBtn.current?.classList.add('hidden');
		}
	};

	return (
		<div
			key={key}
			onClick={playVideo}
			className={
				'absolute aspect-video h-full w-full' +
				(videoCount == 1 || (videoCount == 3 && videoIndex == 0) ? ' row-span-2' : '') +
				(videoCount == 1 ? ' col-span-2' : '')
			}
		>
			<div ref={playBtn}>
				<div className={'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'}>
					<FontAwesomeIcon icon={faPlay} className={'text-4xl text-white'} />
				</div>
			</div>
			<video ref={videoRef} poster={thumbUrl} className={'w-full h-full object-contain'} />
		</div>
	);
}

type Props = {
	post: IPost;
	isRef?: boolean;
	onMutate?: (post: IPost) => void;
};

export default function Post({ post, isRef, onMutate }: Props) {
	const { setModal } = useContext(ModalContext);
	const { user: me, mutate: mutateMe } = useContext(UserContext);

	const [hasLiked, setHasLiked] = useState((post.likes as unknown as ILike[]).filter((like) => like.user == me?._id).length > 0);
	const [count, addCount] = useReducer((count: number) => count + 1, 0);
	const [loadingLikes, setLoadingLikes] = useState(false);
	const [optionsActive, setOptionsActive] = useState(false);
	const [loading, setLoading] = useState(false);
	const [isFollowing, setIsFollowing] = useState(
		!!me?.relationships.find(
			(rel: IRelationship) => rel.target?.toString() == (post.user as IUser | undefined)?._id && rel.type == 'follow'
		)
	);

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

	useEffect(() => {
		if (post.likes) setHasLiked((post.likes as unknown as ILike[]).filter((like) => like.user == me?._id).length > 0);
	}, [me, post.likes]);

	/* useMemo(() => <VideoPlayer video={video} key={`post-${post._id}-video-${i}`} videoCount={videos.length} videoIndex={i} />, [video]) */

	// Use memo to prevent rerendering of videos
	const memodVideos = useMemo(
		() =>
			(post.videos || []).map((video, i) => (
				<VideoPlayer video={video} key={`post-${post._id}-video-${i}`} videoCount={(post.videos || []).length} videoIndex={i} />
			)),
		[post.videos]
	);

	if (!post) return null;

	const user = post.user as unknown as IUser | null;
	const quote = post.quote as unknown as IPost | null;

	const images = post.images || [];
	const videos = post.videos || [];

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
			className={`p-3 mb-px w-full max-w-full relative bg-transparent transition-all cursor-pointer border-b-[1px] border-gray-700 flex hover:bg-gray-500/5 ${
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
								disabled={loading || !optionsActive}
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
								disabled={loading || !optionsActive}
								className='w-full px-6 py-2 text-center enabled:hover:bg-black/5 enabled:cursor-pointer transition-colors grow-0'
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
			<div className='w-12 h-12 relative shrink-0' onClick={() => window.location.assign(`/@${user.tag}`)}>
				<div className='w-12 h-12 absolute'>
					<Image
						className={'w-full h-full rounded-full object-cover cursor-pointer transition-opacity hover:opacity-80'}
						src={user.avatar || '/default_avatar.png'}
						alt={`${user.tag}'s avatar`}
						priority
						width={48}
						height={48}
					/>
				</div>
			</div>

			<div className={'pl-3 w-full flex flex-col overflow-hidden'} onClick={routePost}>
				<div onClick={routePost} className={'max-w-full w-full pr-9 flex-nowrap flex overflow-hidden'}>
					<a
						className={
							'text-black dark:text-white ' +
							(!user.verified ? 'mr-[5px] ' : '') +
							'cursor-pointer no-underline font-semibold hover:underline truncate max-w-full max-h-min items-center'
						}
						href={`/@${user.tag}`}
					>
						{user.username}
					</a>

					<a className={'ml-[2px] text-gray-500 no-underline flex items-center'} href={`/@${user.tag}`}>
						{user.verified ? (
							<p className='mr-[5px]'>
								<Verified color='#f01d1d' />
							</p>
						) : null}
						{`@${user.tag}`}
						<span className='mx-[6px]'>·</span>
					</a>
					<span className={'text-gray-500 hover:underline whitespace-nowrap'}>{FormatDate(new Date(post.date))}</span>
				</div>
				<div className='w-full max-w-full'>
					<PostContent post={post} onClick={routePost} />
				</div>
				<div
					className='w-9/12 aspect-[5/3] mb-2 grid grid-cols-2 rounded-xl overflow-hidden gap-[2px] justify-self-center border-[1px] border-gray-700'
					style={{
						display: images.length !== 0 ? 'grid' : 'none',
					}}
					onClick={routePost}
				>
					{images.map(
						(img, i) =>
							img && (
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
										quality={100}
										loader={fullCDNImageLoader}
										onClick={() => {
											if (setModal) setModal(<ImageModal src={img} post={post} />);
										}}
									/>
								</div>
							)
					)}
				</div>
				<div
					className='w-9/12 aspect-video relative grid grid-cols-2 rounded-xl overflow-hidden gap-[2px] justify-self-center border-[1px] border-gray-700'
					style={{
						display: videos.length !== 0 ? 'block' : 'none',
					}}
				>
					{memodVideos}
				</div>
				{!quote || isRef ? (
					<></>
				) : (
					<div
						className={
							'group/quote mt-1 pl-1 rounded-md border-[1px] border-gray-700 transition-colors bg-black/0 hover:bg-gray-500/10 w-full'
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
									let oldLikedState = hasLiked;
									setHasLiked(!hasLiked);
									LikePost(post._id as unknown as string, !oldLikedState)
										.then(() => {
											if (onMutate) onMutate(post);
											setLoadingLikes(false);
										})
										.catch(() => setHasLiked(oldLikedState));
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
