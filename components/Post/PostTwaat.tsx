import axios from 'redaxios';
import Image from 'next/image';
import { useContext, useRef, useState } from 'react';

import { faXmark, faImage } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { SendPost } from '../../libs/post';
import { UserContext } from '../Handlers/UserHandler';
import TextareaAutosize from '../TextAutosize';

type Props = {
	placeholder?: string;
	btnText?: string;
	onPost?: () => void;
	children?: React.ReactNode;
	inline?: boolean;
	avatarSize?: number;
	padding?: number;
	parent?: string;
};

export default function PostTwaat({ onPost, placeholder, btnText, children, inline, avatarSize = 48, padding, parent }: Props) {
	const [text, setText] = useState('');
	const [images, setImages] = useState([] as string[]);
	const [loadingPost, setLoadingPost] = useState(false);

	const postAlbumRef = useRef<HTMLDivElement>(null);

	const { user } = useContext(UserContext);

	if (!user) return null;

	const btnPostClick = async () => {
		if (loadingPost) return;
		setLoadingPost(true);
		SendPost(text, undefined, await syncImages(), parent).then((res) => {
			setText('');
			setImages([]);
			if (onPost) onPost();
			setLoadingPost(false);
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
		<div className='flex flex-col w-full'>
			<div className='flex w-full bg-white dark:bg-black relative z-10' style={{ paddingInline: padding }}>
				<div className='relative' style={{ width: avatarSize, height: avatarSize }}>
					<div className='absolute' style={{ width: avatarSize, height: avatarSize }}>
						<Image
							className='object-cover rounded-full w-full h-full'
							src={user.avatar || '/default_avatar.png'}
							alt={`${user.username}'s Avatar`}
							sizes='100vw'
							fill
							priority
						/>
					</div>
				</div>

				<div className='flex flex-col pl-5 pr-1 w-full' style={{ marginTop: inline ? 12 : 0 }}>
					<TextareaAutosize
						minRows={1}
						placeholder={placeholder || "What's happening?"}
						className={
							!inline
								? 'w-full outline-none border-0 resize-none text-xl bg-transparent text-black dark:text-white'
								: 'text-black dark:text-white bg-transparent border-0 text-lg leading-6 columns-4 resize-none w-full p-0 m-0 outline-none'
						}
						value={text}
						maxLength={2000}
						onChange={(e) => setText(e.target.value)}
					/>
					<div
						className={'grid grid-cols-2 gap-1 mt-3 b-1'}
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
					{!inline ? <div className='h-px w-full opacity-50 bg-gray-500' /> : null}
					<div className='flex justify-between items-center mt-2 h-min'>
						<div
							className='flex items-center justify-center w-10 h-10 rounded-full transition-colors text-red-500 bg-accent-primary-500/0 hover:bg-accent-primary-500/20 hover:cursor-pointer'
							onClick={() => uploadImages()}
						>
							<FontAwesomeIcon icon={faImage} size={'lg'} />
						</div>
						<div>
							<button
								className={
									'py-[6px] px-4 rounded-full border-0 bg-accent-primary-500 text-white cursor-pointer text-md font-bold transition-colors ' +
									'disabled:bg-red-700 disabled:text-gray-200 disabled:cursor-default transition-all'
								}
								onClick={btnPostClick}
								disabled={(!text && images.length === 0) || loadingPost}
							>
								{btnText || 'Twaat'}
							</button>
						</div>
					</div>
				</div>
			</div>
			{children}
		</div>
	);
}
