'use client';

import Image from 'next/image';
import { useContext, useRef, useState } from 'react';

import { faClose, faImage, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import TextareaAutosize from '../TextAutosize';
import { UserContext } from '../UserHandler';
import { IPost } from '../../schemas/IPost';
import Post from '../Post';
import { SendPost } from '../../libs/post';
import { ModalContext } from '../ModalHandler';
import axios from 'axios';

export default function PostModal({ quote }: { quote?: IPost }) {
	const [content, setContent] = useState('');
	const [images, setImages] = useState([] as string[]);
	const [loading, setLoading] = useState(false);

	const { setModal } = useContext(ModalContext);
	const { user } = useContext(UserContext);

	const postAlbumRef = useRef<HTMLDivElement>(null);

	const btnPostClick = async () => {
		if (loading) return;
		setLoading(true);
		SendPost(content, quote?._id as unknown as string, await syncImages()).then(() => {
			if (setModal) setModal(null);
			setLoading(false);
		});
	};

	const uploadImages = () => {
		// We wanna get a max of 4 images which can only be 2MB each
		const input = document.createElement('input');
		input.type = 'file';
		input.multiple = true;
		input.accept = 'image/*';
		input.onchange = () => {
			const files = input.files;
			if (files)
				for (let i = 0; i < files.length; i++) {
					const file = files[i];
					const reader = new FileReader();
					reader.onload = (e) => {
						const data = e.target?.result;
						if (!data || typeof data !== 'string') return console.error('Invalid data');
						if (data.length > 2 * 1024 * 1024) return alert('Image is too big, max size is 2MB');

						setImages((prev) => (prev.length < 4 ? [...prev, data] : prev));
					};
					reader.readAsDataURL(file);
				}
		};
		input.click();
	};

	const syncImages = () => {
		return new Promise<string[]>((resolve, reject) => {
			if (images.length === 0) return resolve([]);
			Promise.all(images.map((image) => axios.post<{ success: boolean; url: string }>('/api/post/upload', { image })))
				.then((res) => {
					resolve(res.map((r) => r.data.url));
				})
				.catch((err) => {
					console.error(err);
					reject(err);
				});
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
				<div className='w-12 mr-2 h-12 relative shrink-0'>
					<div className='w-12 h-12 absolute'>
						<Image
							src={user?.avatar || '/default_avatar.png'}
							alt={'Your avatar'}
							width={50}
							height={50}
							className={'rounded-full w-full h-full object-cover'}
						/>
					</div>
				</div>
				<div className='relative'>
					<div className={'grow pl-3'}>
						<TextareaAutosize
							className={'w-full text-xl border-0 text-black bg-transparent resize-none outline-none'}
							minRows={1}
							placeholder={"What's happening?"}
							maxLength={2000}
							value={content}
							onChange={(e) => setContent(e.target.value)}
						/>
						<div
							className={'grid grid-cols-2 gap-1 mb-1'}
							ref={postAlbumRef}
							style={{
								height: images.length !== 0 ? `${(postAlbumRef.current || { clientWidth: 1 }).clientWidth * 0.6}px` : '1px',
								opacity: images.length !== 0 ? 1 : 0,
							}}
						>
							{images.map((img, i) => (
								<div
									key={`post-image-${i}`}
									className={
										'w-full h-full relative' +
										(images.length == 1 || (images.length == 3 && i == 0) ? ' row-span-2' : '') +
										(images.length == 1 ? ' col-span-2' : '')
									}
								>
									<Image
										src={img}
										className={'object-cover w-full h-full rounded-xl'}
										alt={`Album image ${i}`}
										sizes={'100vw'}
										fill
									/>
									<div
										className={
											'absolute top-2 left-2 z-10 w-7 h-7 flex justify-center items-center rounded-full' +
											' backdrop-blur-md bg-black/60 hover:bg-black/40 cursor-pointer'
										}
										onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
									>
										<FontAwesomeIcon icon={faXmark} />
									</div>
								</div>
							))}
						</div>
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
					</div>
					<div className={'h-px w-full my-2 opacity-50 bg-gray-500'} />
					<div className={'h-10 flex justify-between items-center'}>
						<div>
							<div
								className='flex items-center justify-center w-10 h-10 rounded-full transition-colors text-red-500 bg-accent-primary-500/0 hover:bg-accent-primary-500/20 hover:cursor-pointer'
								onClick={() => uploadImages()}
							>
								<FontAwesomeIcon icon={faImage} size={'lg'} />
							</div>
						</div>
						<div>
							<button
								className={
									'py-[6px] px-4 rounded-full border-0 bg-[#f01d1d] text-white cursor-pointer text-md font-bold transition-colors disabled:bg-red-700 disabled:cursor-default'
								}
								onClick={btnPostClick}
								disabled={!content || loading}
							>
								Twaat
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
