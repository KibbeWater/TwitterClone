'use client';

import { faRepeat } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useContext, useState } from 'react';
import { ILike } from '../schemas/ILike';
import { IPost } from '../schemas/IPost';
import { ModalContext } from './ModalHandler';
import PostModal from './Modals/PostModal';
import { UserContext } from './UserHandler';

export default function PostFooter({ post }: { post: IPost }) {
	const { setModal } = useContext(ModalContext);
	const { user } = useContext(UserContext);

	const [loadingLikes, setLoadingLikes] = useState(false);
	const [hasLiked, setHasLiked] = useState((post.likes as unknown as ILike[]).findIndex((like) => like.user === me?._id) !== -1);

	return (
		<>
			<div className='flex items-center mr-2'>
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
				<p className='text-black'>
					<span className='font-bold'>{post.retwaats.length}</span> Retwaats
				</p>
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
		</>
	);
}
