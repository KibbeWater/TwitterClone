import { faEllipsis } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Types } from 'mongoose';
import Image from 'next/image';
import PageTemplate from '../../../components/PageTemplate';
import { Connect } from '../../../libs/database';
import Post from '../../../schemas/IPost';
import { IUser } from '../../../schemas/IUser';

type Props = {
	params: {
		id: string;
	};
};

export default async function Page({ params }: Props) {
	await Connect();

	const id = params.id;
	const post = await Post.getPost(new Types.ObjectId(id));

	if (!post) throw new Error('Post not found');

	const user = post.user as unknown as IUser;

	return (
		<PageTemplate name='Twaat'>
			<div className='flex flex-col'>
				<div className='flex justify-between mx-3'>
					<div className='flex'>
						<div className='relative h-12 w-12'>
							<div className='absolute h-12 w-12'>
								<Image
									src={user.avatar || '/default_avatar.png'}
									alt={"Author's Avatar"}
									width={48}
									height={48}
									className='rounded-full object-cover cursor-pointer transition-opacity hover:opacity-80'
								/>
							</div>
						</div>
						<div>
							<div className='flex flex-col ml-3'>
								<h2 className='text-sm font-semibold m-0'>{user.username}</h2>
								<p className='text-gray-600 text-sm m-0'>@{user.tag}</p>
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
					<p className='text-xl'>{post.content}</p>
				</div>
				<div>
					<div className='flex justify-between mx-3 mt-3'>
						{/* Format date: h:mm (AM/PM) (dot) M D, Y */}
						<p className='text-gray-600 text-sm hover:underline cursor-pointer'>
							{new Date(post.date).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}
							{' · '}
							{new Date(post.date).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
						</p>
					</div>
					<div className='h-px grow mx-3 my-3 bg-gray-600/10' />
					<div className='mx-3 flex items-center'>
						<p className='text-sm ml-1 mr-4 text-gray-700'>
							<span className='font-semibold text-black'>{post.retwaats.length}</span> Retwaats
						</p>
						<p className='text-sm ml-1 mr-4 text-gray-700'>
							<span className='font-semibold text-black'>{post.likes.length}</span> Likes
						</p>
					</div>
					<div className='h-px grow mx-3 my-3 bg-gray-600/10' />
					<div className='flex justify-evenly mx-3 mt-3'></div>
				</div>
			</div>
		</PageTemplate>
	);
}
