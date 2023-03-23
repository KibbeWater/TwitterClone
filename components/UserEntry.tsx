import Image from 'next/image';
import { SafeUser } from '../libs/user';
import Verified from './Verified';

export default function UserEntry({ user, onClick }: { user: SafeUser; onClick?: (e: React.MouseEvent<HTMLDivElement>) => void }) {
	return (
		<div className={'w-full h-16 flex gap-3 px-4 py-2 hover:bg-black/20'} onClick={onClick}>
			<div className='aspect-square h-full rounded-full overflow-hidden'>
				<Image
					src={user.avatar || '/default_avatar.png'}
					alt={`${user.username}'s avatar`}
					height={40}
					width={40}
					className={'object-cover h-full w-full'}
				/>
			</div>
			<div className='flex flex-col py-1'>
				<div className='flex items-center'>
					<p className='font-bold text-black dark:text-white leading-none'>{user.username}</p>
					{user.verified ? <Verified color='red' /> : null}
				</div>
				<p className='text-gray-500 leading-none mt-px'>@{user.tag}</p>
			</div>
		</div>
	);
}
