'use client';

import axios from 'axios';
import Image from 'next/image';
import { useRef, useState } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImage, faXmark } from '@fortawesome/free-solid-svg-icons';

import { SendPost } from '../../libs/post';
import { IUser } from '../../schemas/IUser';
import TextareaAutosize from '../TextAutosize';

export default function PostReply({ user, post, onPost }: { user: IUser; post: string; onPost?: () => void }) {
	const [text, setText] = useState('');
	const [images, setImages] = useState([] as string[]);

	const [loading, setLoading] = useState(false);

	const postAlbumRef = useRef<HTMLDivElement>(null);

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

	const sendPost = () => {
		setLoading(true);
		syncImages()
			.then((urls) => {
				SendPost(text, undefined, urls, post)
					.then(() => {
						setText('');
						setImages([]);
						setLoading(false);
					})
					.catch(() => setLoading(false));
			})
			.catch(() => setLoading(false));
	};

	return (
		<>
			<div className='relative h-12 w-12 mr-4'>
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
			<div className='mt-3 grow flex flex-col'>
				<TextareaAutosize
					className={
						'text-black dark:text-white bg-black/0 border-0 text-lg leading-6 columns-4 resize-none w-full p-0 m-0 outline-none'
					}
					placeholder={'Twaat your reply'}
					value={text}
					maxLength={2000}
					onChange={(e) => setText(e.target.value)}
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
								(images.length > 0 ? ' mt-3' : '') +
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
				<div className='flex w-full mt-4'>
					<div
						className='flex items-center justify-center w-8 h-8 rounded-full transition-colors text-red-500 bg-accent-primary-500/0 hover:bg-accent-primary-500/20 hover:cursor-pointer'
						onClick={() => uploadImages()}
					>
						<FontAwesomeIcon icon={faImage} />
					</div>
				</div>
			</div>
			<div className='grid place-items-end'>
				<button
					className='px-4 py-2 bg-accent-primary-500 rounded-full font-semibold disabled:bg-red-700 disabled:text-gray-200 disabled:cursor-default'
					disabled={loading || text.length === 0}
					onClick={() => sendPost()}
				>
					Reply
				</button>
			</div>
		</>
	);
}
