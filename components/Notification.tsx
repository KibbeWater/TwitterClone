import { faHeart, faRepeat, faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { INotification } from '../schemas/INotification';
import { IUser } from '../schemas/IUser';

export default function Notification({ notif }: { notif: INotification }) {
	const type = notif.type;

	let title = <></>;
	let content = <></>;

	const targets = notif.targets as unknown as IUser[];

	switch (type) {
		case 'follow':
			title = (
				<p>
					<span className='font-bold'>{targets[0].username}</span> followed you
				</p>
			);
			break;

		default:
			break;
	}

	return (
		<div className={`w-full h-14 flex px-4`}>
			<div className='h-full justify-end'>
				<FontAwesomeIcon icon={type == 'follow' ? faUser : type == 'like' ? faHeart : faRepeat} />
			</div>
			<div className='flex flex-col justify-center ml-4'>{title}</div>
		</div>
	);
}
