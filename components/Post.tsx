import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRepeat } from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';

type PostObject = {
	id: number;
	userId: number;
	content: string;
	ref: number;
	parent: number;
	date: number;
};

type Props = {
	post: PostObject;
};

export default function Post({ post }: Props) {
	<div className={'p-3 mb-px w-full bg-transparent transition-all cursor-pointer border-b-[1px] border-gray-700 flex hover:bg-black/5'}>
		<Image src='{$post->author->avatar}' alt="{$post->author->username}'s avatar" className='post__author_avatar' />
		<div className='post__content'>
			<div className='post__header'>
				<a className='post__author_username' href='/@{$post->author->tag}'>
					{'post->author->username'}
				</a>
				<a className='post__author_tag' href='/@{$post->author->tag}'>
					{'@post->author->tag ·'}
				</a>
				<span className='post__timestamp'>{new Date(post.date).toDateString()}</span>
			</div>
			<p>{post.content}</p>
			{post.ref !== -1 ? (
				<></>
			) : (
				<div className='post__reference'>
					<Post />
				</div>
			)}
			<div className='post__footer'>
				<button id='btnRetwat' className='post__footer_button'>
					<FontAwesomeIcon icon={faRepeat} size={'xl'} />
				</button>
				<button id='btnLike' className='post__footer_button__like'>
					<i class='fa-heart fa-xl\'></i>
				</button>
			</div>
		</div>
	</div>;
}
