import { faClose } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeSvgIcon } from 'react-fontawesome-svg-icon';
import { useContext } from 'react';
import { SafeUser } from '../../libs/user';
import { ModalContext } from '../Handlers/ModalHandler';

const menuOptions = [];

export default function AdminModal({ user }: { user: SafeUser }) {
	const { setModal } = useContext(ModalContext);

	const closeModal = () => {
		if (setModal) setModal(null);
	};

	return (
		<div className='w-6/12 h-4/6 bg-white rounded-lg flex flex-col'>
			<div className={'h-10 w-full p-1 flex justify-end'}>
				<div className={'w-8 h-8 rounded-full flex items-center justify-center bg-black/0 hover:bg-black/10'} onClick={closeModal}>
					<FontAwesomeSvgIcon className={'text-black'} icon={faClose} size={'xl'} />
				</div>
			</div>
			<div className='grow flex'>
				<div className='h-full w-2/12 flex justify-end bg-white border-gray-700 border-r-[1px]'>
					<p className='text-xl text-black'>User Actions</p>
				</div>
			</div>
		</div>
	);
}
