import { Types } from 'mongoose';
import { cookies } from 'next/headers';
import Image from 'next/image';
import Link from 'next/link';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsis } from '@fortawesome/free-solid-svg-icons';

import PageTemplate from '../../../components/PageTemplate';
import PostFooter from '../../../components/Post/PostFooter';
import { Connect } from '../../../libs/database';
import { NormalizeObject } from '../../../libs/utils';
import Post, { IPost } from '../../../schemas/IPost';
import User, { IUser } from '../../../schemas/IUser';
import Verified from '../../../components/Verified';
import PostComments from '../../../components/Post/PostComments';

type Props = {
	params: {
		id: string;
	};
};

export default async function Page({ params }: Props) {
	await Connect();

	const id = params.id;
	const post = NormalizeObject<IPost & { quote: IPost & { user: IUser }; user: IUser; comments: IPost[] }>(
		(await Post.getPost(new Types.ObjectId(id))) as unknown as IPost & {
			quote: IPost & { user: IUser };
			user: IUser;
			comments: (IPost & { user: IUser })[];
		}
	);

	const token = cookies().get('token')?.value as string;
	const me = NormalizeObject<IUser | null>(await User.authenticate(token));

	if (!post) throw new Error('Post not found');

	const user = post.user as unknown as IUser;

	return (
		<PageTemplate name='Twaat'>
			<div className='flex flex-col'>
				<div className='flex justify-between mx-3'>
					<div className='flex'>
						<div className='relative h-12 w-12'>
							<Link href={'/@' + post.user.tag} className='absolute h-12 w-12'>
								<Image
									src={user.avatar || '/default_avatar.png'}
									alt={"Author's Avatar"}
									fill
									sizes={'100vw'}
									className='rounded-full object-cover cursor-pointer transition-opacity hover:opacity-80'
								/>
							</Link>
						</div>
						<div className='flex items-center'>
							<div className='flex flex-col ml-3 '>
								<Link
									href={`/@${user.tag}`}
									className='text-base truncate mb-1 leading-none font-semibold m-0 text-black dark:text-white flex'
								>
									{user.username}
									{user.verified ? <Verified color='#f01d1d' /> : null}
								</Link>
								<Link href={`/@${user.tag}`} className='text-gray-500 truncate mb-1 leading-none text-base m-0'>
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
					<p className='text-xl text-black dark:text-white'>{post.content}</p>
				</div>
				<div>
					<div className='flex justify-between mx-3 mt-3'>
						{/* Format date: h:mm (AM/PM) (dot) M D, Y */}
						<p className='text-gray-500 text-sm hover:underline cursor-pointer'>
							{new Date(post.date).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}
							{' · '}
							{new Date(post.date).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
						</p>
					</div>
					<div className='h-px grow mx-3 my-3 bg-gray-500/30' />
					<div className='mx-3 flex items-center'>
						<p className='text-sm ml-1 mr-4 text-gray-500 '>
							<span className='font-semibold text-black dark:text-white'>{post.retwaats.length}</span> Retwaats
						</p>
						<p className='text-sm ml-1 mr-4 text-gray-500'>
							<span className='font-semibold text-black dark:text-white'>{post.likes.length}</span> Likes
						</p>
					</div>
					<div className='h-px grow mx-3 my-3 bg-gray-500/30' />
					<div className='flex justify-evenly mx-3 mt-3'>
						<PostFooter post={post} />
					</div>
					<div className='h-px grow mx-3 my-3 bg-gray-500/30' />
				</div>
				<PostComments post={post} user={me || undefined} placeholder={post.comments} />
			</div>
		</PageTemplate>
	);
}
