'use client';

import Image from 'next/image';
import { useContext, useState } from 'react';

import { faClose } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import TextareaAutosize from '../TextAutosize';
import { UserContext } from '../UserHandler';
import { IPost } from '../../schemas/IPost';
import Post from '../Post';
import { SendPost } from '../../libs/post';
import { ModalContext } from '../ModalHandler';

export default function PostModal({ quote }: { quote?: IPost }) {
	const [content, setContent] = useState('');

	const { setModal } = useContext(ModalContext);
	const user = useContext(UserContext);

	const btnPostClick = async () => {
		SendPost(content, quote?._id as unknown as string).then(() => {
			if (setModal) setModal(null);
		});
	};

	return (
		<div className={'bg-white w-[45%] rounded-xl flex flex-col'}>
			<div className={'h-10 p-1 flex justify-end'}>
				<div
					className={'w-8 h-8 rounded-full flex items-center justify-center bg-black/0 hover:bg-black/10'}
					onClick={() => {
						if (setModal) setModal(null);
					}}
				>
					<FontAwesomeIcon className={'text-black'} icon={faClose} size={'xl'} />
				</div>
			</div>
			<div className={'grow flex break-words px-4 pb-[10px]'}>
				<div>
					<Image
						src={user?.avatar || '/default_avatar.png'}
						alt={'Your avatar'}
						width={50}
						height={50}
						className={'rounded-full'}
					/>
				</div>
				<div className={'grow pl-3'}>
					<TextareaAutosize
						className={'w-full text-xl border-0 text-black bg-transparent resize-none outline-none'}
						minRows={1}
						placeholder={"What's happening?"}
						value={content}
						onChange={(e) => setContent(e.target.value)}
					/>
					{quote ? (
						<div
							className={
								'group/quote mt-1 pl-1 rounded-md border-[1px] border-gray-700 transition-colors bg-black/0 hover:bg-black/10'
							}
						>
							<Post post={quote} isRef={true} />
						</div>
					) : (
						<></>
					)}
					<div className={'h-px w-full my-3 opacity-50 bg-gray-500'} />
					<div className={'h-10 flex justify-between items-center'}>
						<p className={'text-black'}>There might be buttons here</p>
						<div>
							<button
								className={'py-[6px] px-4 rounded-full border-0 bg-[#f01d1d] text-white cursor-pointer text-md font-bold'}
								onClick={btnPostClick}
							>
								Post
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
