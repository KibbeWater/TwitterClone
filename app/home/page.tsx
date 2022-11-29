'use client';

import Image from 'next/image';
import { useContext, useEffect, useRef, useState } from 'react';
import useSWRInfinite from 'swr/infinite';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faXmark } from '@fortawesome/free-solid-svg-icons';
import { faImage } from '@fortawesome/free-regular-svg-icons';

import PageTemplate from '../../components/PageTemplate';
import Post from '../../components/Post';
import TextAutosize from '../../components/TextAutosize';
import { SendPost } from '../../libs/post';
import { IPost } from '../../schemas/IPost';
import { UserContext } from '../../components/UserHandler';
import axios from 'axios';

export default function Page() {
	const [text, setText] = useState('');
	const [images, setImages] = useState([] as string[]);

	const { data, size, setSize, mutate } = useSWRInfinite<{ success: boolean; posts: IPost[]; pages: number }>(
		(index, previousPageData) => {
			if (previousPageData && previousPageData.pages < index) return null;
			return `/api/post?page=${index}`;
		},
		(url) => fetch(url).then((res) => res.json())
	);

	const loadingRef = useRef<HTMLDivElement>(null);
	const postAlbumRef = useRef<HTMLDivElement>(null);
	const { user } = useContext(UserContext);

	useEffect(() => {
		if (loadingRef.current) {
			const observer = new IntersectionObserver(
				(entries) => {
					if (entries[0].isIntersecting) {
						setSize(size + 1);
					}
				},
				{ threshold: 1 }
			);

			observer.observe(loadingRef.current);

			return () => observer.disconnect();
		}
	}, [loadingRef]);

	let posts = data ? data.map((page) => page.posts).flat() : [];

	const btnPostClick = async () => {
		SendPost(text, undefined, await syncImages()).then((res) => {
			setText('');
			setImages([]);
			mutate();
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
		<PageTemplate name='Home'>
			{user ? (
				<div className='flex w-full px-5 pb-2 bg-white relative z-10 border-b-[1px] border-gray-700'>
					<div>
						<Image
							src={user.avatar || '/default_avatar.png'}
							alt={'Your profile picture'}
							width={55}
							height={55}
							className={'rounded-full'}
						/>
					</div>

					<div className='flex flex-col px-5 w-full'>
						<TextAutosize
							minRows={1}
							placeholder={"What's happening?"}
							className={'w-full outline-none border-0 mb-4 resize-none text-xl bg-transparent text-black'}
							value={text}
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
						<div className='h-px w-full opacity-50 bg-gray-900' />
						<div className='flex justify-between items-center mt-2 h-min'>
							<div
								className='flex items-center justify-center w-8 h-8 rounded-full transition-colors bg-accent-primary-500/0 hover:bg-accent-primary-500/20 hover:cursor-pointer'
								onClick={() => uploadImages()}
							>
								<FontAwesomeIcon icon={faImage} color={'red'} />
							</div>
							<div>
								<button
									className='py-2 px-5 rounded-full border-0 bg-accent-primary-500 text-white cursor-pointer text-md font-bold'
									onClick={btnPostClick}
								>
									Twaat
								</button>
							</div>
						</div>
					</div>
				</div>
			) : null}
			<div className='flex flex-col items-center pb-14'>
				{posts.map((post) => (post ? <Post key={post._id as unknown as string} post={post} /> : <></>))}
				<div className='w-full mt-4 flex justify-center items-center' ref={loadingRef}>
					<FontAwesomeIcon icon={faSpinner} size={'2x'} color={'black'} className={'animate-spin'} />
				</div>
			</div>
		</PageTemplate>
	);
}
