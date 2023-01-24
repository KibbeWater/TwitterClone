'use client';

import { useContext } from 'react';

import { faClose } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IPost } from '../../types/IPost';
import { ModalContext } from '../Handlers/ModalHandler';
import PostTwaat from '../Post/PostTwaat';

export default function PostModal({ quote }: { quote?: IPost }) {
	const { setModal } = useContext(ModalContext);

	return (
		<div className={'bg-white dark:bg-black w-[45%] rounded-xl flex flex-col'}>
			<div className={'h-10 p-1 flex justify-end'}>
				<div
					className={
						'w-8 h-8 rounded-full flex items-center justify-center bg-black/0 hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer'
					}
					onClick={() => {
						if (setModal) setModal(null);
					}}
				>
					<FontAwesomeIcon className={'text-black dark:text-white'} icon={faClose} size={'xl'} />
				</div>
			</div>
			<div className={'grow flex break-words px-4 pb-[10px]'}>
				<PostTwaat parent={quote?._id.toString()} />
			</div>
		</div>
	);
}
