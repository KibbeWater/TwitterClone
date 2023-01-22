'use client';

import axios from 'redaxios';
import { useContext, useEffect, useRef, useState } from 'react';
import useSWRInfinite from 'swr/infinite';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

import PageTemplate from '../../components/PageTemplate';
import Post from '../../components/Post/Post';
import { IPost } from '../../schemas/IPost';
import { ModalContext } from '../../components/Handlers/ModalHandler';
import PostTwaat from '../../components/Post/PostTwaat';

export default function Page() {
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

	return (
		<PageTemplate name='Home'>
			<div className='pb-2 border-b-[1px] border-gray-700'>
				<PostTwaat onPost={mutate} avatarSize={56} padding={20} />
			</div>
			<div className='flex flex-col w-full overflow-hidden items-center pb-14'>
				{posts.map((post) => (post ? <Post key={post._id as unknown as string} post={post} onMutate={() => mutate()} /> : null))}
				<div
					className={'w-full mt-4 flex justify-center items-center' + (!isValidating ? ' invisible' : ' visible')}
					ref={loadingRef}
				>
					<FontAwesomeIcon icon={faSpinner} size={'2x'} className={'animate-spin text-black dark:text-white'} />
				</div>
			</div>
		</PageTemplate>
	);
}
