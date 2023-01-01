import { faAt, faHeart, faRepeat, faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from 'next/image';
import Link from 'next/link';
import { INotification } from '../schemas/INotification';
import { IPost } from '../schemas/IPost';
import { IUser } from '../schemas/IUser';
import Post from './Post/Post';

export default function Notification({ notif }: { notif: INotification }) {
	const type = notif.type;

	let title = <></>;
	let content = <></>;

	const targets = notif.targets as unknown as IUser[];

	switch (type) {
		case 'follow':
			title = (
				<p className='text-black dark:text-white'>
					<span className='font-bold'>{targets[0].username}</span>
					{targets.length > 1 ? ` and ${targets.length - 1} other${targets.length - 2 > 0 ? 's' : ''}` : ''} followed you
				</p>
			);
			break;
		case 'like':
			title = (
				<>
					<p className='text-black dark:text-white'>
						<span className='font-bold'>{targets[0].username}</span>
						{targets.length > 1 ? ` and ${targets.length - 1} other${targets.length - 2 > 0 ? 's' : ''}` : ''} liked your{' '}
						<Link href={`/post/${notif.post?._id}`}>post</Link>
					</p>
					<p className='text-gray-500 px-2 mt-2'>{(notif.post as unknown as IPost).content}</p>
				</>
			);
			break;
		default:
			break;
	}

	if (notif.type == 'reply' || notif.type == 'mention') {
		if (!notif.post)
			return (
				//{/* <p className='text-black dark:text-white w-full text-center py-2 border-b-[1px] border-gray-700'>Content not available</p> */}
				null
			);
		return <Post post={notif.post as unknown as IPost} />;
	}

	return (
		<div className={`w-full flex px-4 py-2 border-b-[1px] border-gray-700`}>
			<div className='h-full justify-end mt-1'>
				<FontAwesomeIcon
					icon={type == 'follow' ? faUser : type == 'like' ? faHeart : type == 'mention' ? faAt : faRepeat}
					size={'xl'}
					className={
						type == 'follow'
							? 'text-red-500'
							: type == 'like'
							? 'text-red-500'
							: type == 'mention'
							? 'text-sky-500'
							: 'text-green-500'
					}
				/>
			</div>
			<div className='flex flex-col justify-center ml-4'>
				<div className='relative w-full h-7 mb-1'>
					{targets.map((t, i) => (
						<div
							key={`t-${notif._id}-${i}`}
							className={`absolute border-white dark:border-black border-2 box-content top-0 bottom-0 h-7 w-7 rounded-full overflow-hidden`}
							style={{ zIndex: i + 1, left: i * 16 }}
						>
							<Image src={t.avatar || '/default_avatar.png'} alt='Avatar' fill sizes='100vw' />
						</div>
					))}
				</div>
				{title}
			</div>
		</div>
	);
}
