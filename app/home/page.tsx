'use client';

import axios from 'redaxios';
import { useContext, useEffect, useRef, useState } from 'react';
import useSWRInfinite from 'swr/infinite';

import { FontAwesomeSvgIcon } from 'react-fontawesome-svg-icon';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

import PageTemplate from '../../components/PageTemplate';
import Post from '../../components/Post/Post';

import { ModalContext } from '../../components/Handlers/ModalHandler';
import PostTwaat from '../../components/Post/PostTwaat';
import { IPost } from '../../types/IPost';
import PostSkeleton from '../../components/Post/PostSkeleton';

export default function Page() {
	const [isVisible, setIsVisible] = useState(false);

	const fetcher = (url: string) => axios.get(url).then((res) => res.data);
	const { data, size, setSize, mutate, isValidating } = useSWRInfinite<{ success: boolean; data: IPost[]; pages: number }>(
		(pageIndex: number, previousPageData: { success: boolean; data: IPost[]; pages: number } | null) => {
			if (previousPageData && !previousPageData.data) return null;
			return `/api/post?page=${pageIndex}`;
		},
		fetcher
	);

	const isRefreshing = isValidating && data && data.length === size;
	const totalPages = data ? data[data.length - 1].pages : 0;

	const loadingRef = useRef<HTMLDivElement>(null);
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

	let posts = data ? data.map((page) => page.data).flat() : [];

	return (
		<PageTemplate name='Home'>
			<div className='pb-2 border-b-[1px] border-gray-700'>
				<PostTwaat onPost={mutate} avatarSize={56} padding={20} />
			</div>

			<div className='flex flex-col w-full overflow-hidden items-center pb-14'>
				{posts.length !== 0 ? (
					posts.map((post) => (post ? <Post key={post._id as unknown as string} post={post} onMutate={() => mutate()} /> : null))
				) : (
					<div className='flex flex-col w-full overflow-hidden items-center'>
						{[...Array(10)].map((_, idx) => {
							return <PostSkeleton key={`loading-${idx}`} />;
						})}
					</div>
				)}
				<div
					className={'w-full mt-4 flex justify-center items-center' + (!isValidating ? ' invisible' : ' visible')}
					ref={loadingRef}
				>
					<FontAwesomeSvgIcon icon={faSpinner} size={'2x'} className={'animate-spin text-black dark:text-white'} />
				</div>
			</div>
		</PageTemplate>
	);
}
