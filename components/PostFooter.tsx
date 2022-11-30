'use client';

import { useContext, useState } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment, faHeart as farHeart } from '@fortawesome/free-regular-svg-icons';
import { faArrowUpFromBracket, faHeart as fasHeart, faRepeat } from '@fortawesome/free-solid-svg-icons';

import { ILike } from '../schemas/ILike';
import { IPost } from '../schemas/IPost';
import { ModalContext } from './ModalHandler';
import PostModal from './Modals/PostModal';
import { UserContext } from './UserHandler';
import { LikePost } from '../libs/post';

export default function PostFooter({ post }: { post: IPost }) {
	const { setModal } = useContext(ModalContext);
	const { user: me } = useContext(UserContext);

	const [loadingLikes, setLoadingLikes] = useState(false);
	const [hasLiked, setHasLiked] = useState((post.likes as unknown as ILike[]).findIndex((like) => like.user === me?._id) !== -1);

	return (
		<>
			<div className='flex items-center mr-2'>
				<button
					className={
						'border-0 p-0 h-8 w-8 mr-1 rounded-full flex items-center justify-center transition-colors bg-black/0 cursor-pointer hover:bg-red-500/40 group/btnComment'
					}
				>
					<FontAwesomeIcon icon={faComment} size={'lg'} className={'text-black group-hover/btnComment:text-accent-primary-500'} />
				</button>
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
					<FontAwesomeIcon icon={faRepeat} size={'lg'} className={'text-black group-hover/btnRetweet:text-green-500'} />
				</button>
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
						setHasLiked((prev) => !prev);
						LikePost(post._id as unknown as string, !hasLiked)
							.then(() => setLoadingLikes(false))
							.catch(() => setHasLiked((prev) => !prev));
					}}
				>
					<FontAwesomeIcon
						icon={hasLiked ? fasHeart : farHeart}
						size={'lg'}
						className={hasLiked ? 'text-red-500 transition-all' : 'text-black group-hover/btnLike:text-red-500 transition-all'}
					/>
				</button>
			</div>
			<div className='flex items-center mr-2'>
				<button
					className={
						'border-0 p-0 h-8 w-8 mr-1 rounded-full flex items-center justify-center transition-colors bg-black/0 cursor-pointer hover:bg-red-500/40 group/btnShare disabled:cursor-default'
					}
				>
					<FontAwesomeIcon icon={faArrowUpFromBracket} size={'lg'} className={'text-black group-hover/btnShare:text-red-500'} />
				</button>
			</div>
		</>
	);
}
