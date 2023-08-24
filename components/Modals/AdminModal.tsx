import axios from 'redaxios';

import { faClose } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeSvgIcon } from 'react-fontawesome-svg-icon';
import { useContext, useState } from 'react';
import { SafeUser } from '../../libs/user';
import { ModalContext } from '../Handlers/ModalHandler';

export default function AdminModal({ user }: { user: SafeUser }) {
	const { setModal } = useContext(ModalContext);
	const [activeTab, setActiveTab] = useState(0);
	const [verifyBtnDisabled, setVerifyDisabled] = useState(false);

	const closeModal = () => {
		if (setModal) setModal(null);
	};

	const menuOptions: { name: string; element: (user: SafeUser) => JSX.Element }[] = [
		{
			name: 'Overview',
			element: (user: SafeUser) => (
				<div className='w-full h-full flex flex-col p-4'>
					<p className='text-black'>
						Verified:{' '}
						<span className={`${user.verified ? 'text-green-500' : 'text-red-500'}`}>{user.verified ? 'Yes' : 'No'}</span>
					</p>
					<button
						className='py-1 px-2 bg-black rounded-lg w-min whitespace-nowrap disabled:bg-black/20'
						onClick={() => {
							setVerifyDisabled(true);
							axios.post('/api/user/verify', { id: user._id, isVerified: !user.verified }).then((res) => {
								if (res.data.success) setVerifyDisabled(false);
							});
						}}
						disabled={verifyBtnDisabled}
					>
						{user.verified ? 'Unverify User' : 'Verify User'}
					</button>
				</div>
			),
		},
		{
			name: 'Info',
			element: () => <></>,
		},
	];

	return (
		<div className='w-6/12 md:w-9/12 h-4/6 bg-white rounded-lg flex relative overflow-hidden'>
			<div
				className={'w-8 h-8 rounded-full flex items-center justify-center bg-black/0 hover:bg-black/10 absolute top-0 right-0'}
				onClick={closeModal}
			>
				<FontAwesomeSvgIcon className={'text-black'} icon={faClose} size={'xl'} />
			</div>
			<div className='flex grow-0 w-min h-full p-4 border-gray-700 border-r-[1px] overflow-x-hidden overflow-y-scroll'>
				<div className='h-full w-full flex flex-col bg-white whitespace-nowrap'>
					{menuOptions.map((option, idx) => (
						<a
							onClick={() => setActiveTab(idx)}
							key={`admMenu-nav-${option.name}`}
							className='text-xl text-black cursor-pointer grow-0'
						>
							{option.name}
						</a>
					))}
				</div>
			</div>
			<div className='grow'>{menuOptions[activeTab].element(user)}</div>
		</div>
	);
}
