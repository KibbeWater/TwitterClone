'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRepeat } from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';
import { IPost } from '../schemas/IPost';
import { IUser } from '../schemas/IUser';

type Props = {
	post: IPost;
};

export default function Post({ post }: Props) {
	if (!post) return null;

	const user = post.user as unknown as IUser | null;
	const quote = post.quote as unknown as IPost | null;

	if (!user) return null;

	return (
		<div
			className={'p-3 mb-px w-full bg-transparent transition-all cursor-pointer border-b-[1px] border-gray-700 flex hover:bg-black/5'}
		>
			<Image
				src={user.avatar || '/default_avatar.png'}
				alt={`${user.tag}'s avatar`}
				width={40}
				height={40}
				className='post__author_avatar'
			/>
			<div className='post__content'>
				<div className='post__header'>
					<a className='post__author_username' href={`/@${user.tag}`}>
						{'post->author->username'}
					</a>
					<a className='post__author_tag' href={`/@${user.tag}`}>
						{`@${user.tag} ·`}
					</a>
					<span className='post__timestamp'>{new Date(post.date).toDateString()}</span>
				</div>
				<p>{post.content}</p>
				{post.quote ? (
					<></>
				) : (
					<div className='post__reference'>
						<Post post={quote} />
					</div>
				)}
				<div className='post__footer'>
					<button id='btnRetwat' className='post__footer_button'>
						<FontAwesomeIcon icon={faRepeat} size={'xl'} />
					</button>
					<button id='btnLike' className='post__footer_button__like'>
						<i className='fa-heart fa-xl\'></i>
					</button>
				</div>
			</div>
		</div>
	);
}
