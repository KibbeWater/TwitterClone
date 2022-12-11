'use client';

import axios from 'axios';
import Image from 'next/image';
import { useContext, useEffect, useRef, useState } from 'react';
import useSWRInfinite from 'swr/infinite';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faXmark } from '@fortawesome/free-solid-svg-icons';
import { faImage } from '@fortawesome/free-regular-svg-icons';

import PageTemplate from '../../components/PageTemplate';
import Post from '../../components/Post/Post';
import TextAutosize from '../../components/TextAutosize';
import { SendPost } from '../../libs/post';
import { IPost } from '../../schemas/IPost';
import { UserContext } from '../../components/Handlers/UserHandler';
import { ModalContext } from '../../components/Handlers/ModalHandler';

export default function Page() {
	const [text, setText] = useState('');
	const [images, setImages] = useState([] as string[]);
	const [loadingPost, setLoadingPost] = useState(false);
	const [isVisible, setIsVisible] = useState(false);

	const fetcher = (url: string) => axios.get(url).then((res) => res.data);
	const { data, size, setSize, mutate, isValidating } = useSWRInfinite<{ success: boolean; posts: IPost[]; pages: number }>(
		(pageIndex: number, previousPageData: { success: boolean; posts: IPost[]; pages: number } | null) => {
			if (previousPageData && !previousPageData.posts) return null;
			return `/api/post?page=${pageIndex}`;
		},
		fetcher
	);

	const isRefreshing = isValidating && data && data.length === size;
	const totalPages = data ? data[data.length - 1].pages : 0;

	const loadingRef = useRef<HTMLDivElement>(null);
	const postAlbumRef = useRef<HTMLDivElement>(null);
	const { user } = useContext(UserContext);
	const { modal } = useContext(ModalContext);

	useEffect(() => {
		if (!loadingRef.current) return;

		const observer = new IntersectionObserver(([entry]) => {
			setIsVisible(entry.isIntersecting);
		});

		observer.observe(loadingRef.current);

		return () => observer.disconnect();
	}, [loadingRef]);

	useEffect(() => {
		mutate();
	}, [modal]);

	useEffect(() => {
		if (isVisible && !isRefreshing && size < totalPages) setSize(size + 1);
	}, [isVisible, isRefreshing, totalPages]);

	let posts = data ? data.map((page) => page.posts).flat() : [];
	const pages = (data ? data.map((page) => page.pages).flat() : [])[0];

	const btnPostClick = async () => {
		if (loadingPost) return;
		setLoadingPost(true);
		SendPost(text, undefined, await syncImages()).then((res) => {
			setText('');
			setImages([]);
			mutate();
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
		<PageTemplate name='Home'>
			{user ? (
				<div className='flex w-full px-5 pb-2 bg-white dark:bg-black relative z-10 border-b-[1px] border-gray-700'>
					<div className='w-14 h-14 relative'>
						<div className='w-14 h-14 absolute'>
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

					<div className='flex flex-col px-5 w-full'>
						<TextAutosize
							minRows={1}
							placeholder={"What's happening?"}
							className={'w-full outline-none border-0 mb-4 resize-none text-xl bg-transparent text-black dark:text-white'}
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
						<div className='h-px w-full opacity-50 bg-gray-500' />
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
										'py-2 px-5 rounded-full border-0 bg-accent-primary-500 text-white cursor-pointer text-md font-bold transition-colors' +
										'disabled:bg-red-700 disabled:text-gray-200 disabled:cursor-default'
									}
									onClick={btnPostClick}
									disabled={!text || loadingPost}
								>
									Twaat
								</button>
							</div>
						</div>
					</div>
				</div>
			) : null}
			<div className='flex flex-col items-center pb-14'>
				{posts.map((post) => (post ? <Post key={post._id as unknown as string} post={post} onMutate={() => mutate()} /> : null))}
				<div
					className={'w-full mt-4 flex justify-center items-center' + (!isValidating ? ' invisible' : ' visible')}
					ref={loadingRef}
				>
					<FontAwesomeIcon icon={faSpinner} size={'2x'} className={'animate-spin text-black dark:text-white'} />
				</div>
				{/* <button onClick={() => setSize((prev) => prev + 1)}>Load More</button> */}
			</div>
		</PageTemplate>
	);
}
