'use client';

import Image from 'next/image';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRepeat } from '@fortawesome/free-solid-svg-icons';
import { faHeart as fasHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as farHeart } from '@fortawesome/free-regular-svg-icons';

import { IPost } from '../schemas/IPost';
import { IUser } from '../schemas/IUser';
import { useContext, useState } from 'react';
import { UserContext } from './UserHandler';
import { LikePost } from '../libs/post';
import { ILike } from '../schemas/ILike';
import { ModalContext } from './ModalHandler';
import PostModal from './Modals/PostModal';

type Props = {
	post: IPost;
	isRef?: boolean;
};

export default function Post({ post, isRef }: Props) {
	const { setModal } = useContext(ModalContext);
	const me = useContext(UserContext);
	const [hasLiked, setHasLiked] = useState((post.likes as unknown as ILike[]).findIndex((like) => like.user === me?._id) !== -1);

	if (!post) return null;

	const user = post.user as unknown as IUser | null;
	const quote = post.quote as unknown as IPost | null;

	if (!user) return null;

	return (
		<div
			className={`p-3 mb-px w-full bg-transparent transition-all cursor-pointer border-b-[1px] border-gray-700 flex hover:bg-black/5 ${
				isRef ? '!border-0 !bg-transparent hover:!bg-transparent' : ''
			}`}
		>
			<Image
				className={'w-10 h-10 object-cover rounded-full cursor-pointer mr-1 transition-opacity hover:opacity-80'}
				src={user.avatar || '/default_avatar.png'}
				alt={`${user.tag}'s avatar`}
				width={40}
				height={40}
			/>
			<div className={'pl-3'}>
				<div>
					<a className={'text-black mr-[5px] cursor-pointer no-underline font-semibold hover:underline'} href={`/@${user.tag}`}>
						{user.username}
					</a>
					<a className={'ml-1 text-gray-700 no-underline'} href={`/@${user.tag}`}>
						{`@${user.tag}`}
						<span className='mx-[6px]'>·</span>
					</a>
					<span className={'text-gray-700 hover:underline'}>{new Date(post.date).toDateString()}</span>
				</div>
				<p className={'text-black'}>{post.content}</p>
				{!quote || isRef ? (
					<></>
				) : (
					<div
						className={
							'group/quote mt-1 pl-1 rounded-md border-[1px] border-gray-700 transition-colors bg-black/0 hover:bg-black/10'
						}
					>
						<Post post={quote} />
					</div>
				)}
				{!isRef ? (
					<div className={'mt-3 h-8 flex'}>
						<button
							className={
								'border-0 p-0 h-8 w-8 mr-1 rounded-full flex items-center justify-center transition-colors bg-black/0 cursor-pointer hover:bg-[#3cff3c]/40 group/btnRetweet'
							}
							onClick={() => {
								if (setModal) setModal(<PostModal quote={post} />);
							}}
						>
							<FontAwesomeIcon icon={faRepeat} size={'xl'} className={'text-black group-hover/btnRetweet:text-green-500'} />
						</button>
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
					</div>
				) : null}
			</div>
		</div>
	);
}
