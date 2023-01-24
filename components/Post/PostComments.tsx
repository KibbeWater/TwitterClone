'use client';

import { useEffect, useRef, useState } from 'react';
import axios from 'redaxios';
import useSWRInfinite from 'swr/infinite';

import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IPost } from '../../types/IPost';
import { IUser } from '../../types/IUser';
import PostModal from './Post';
import PostTwaat from './PostTwaat';

export default function PostComments({ post, placeholder }: { post: IPost; placeholder?: IPost[] }) {
	const [isVisible, setIsVisible] = useState(false);

	const loadingRef = useRef<HTMLDivElement>(null);

	const fetcher = (url: string) => axios.get(url).then((res) => res.data);
	const { data, size, setSize, mutate, isValidating } = useSWRInfinite<{ success: boolean; posts: IPost[]; pages: number }>(
		(pageIndex: number, previousPageData: { success: boolean; posts: IPost[]; pages: number } | null) => {
			if (previousPageData && !previousPageData.posts) return null;
			return `/api/post?page=${pageIndex}&parent=${post._id.toString()}`;
		},
		fetcher
	);

	const isRefreshing = isValidating && data && data.length === size;
	const totalPages = data ? data[data.length - 1].pages : 0;

	let posts = data ? data.map((page) => page.posts).flat() : [];
	const pages = (data ? data.map((page) => page.pages).flat() : [])[0];

	useEffect(() => {
		if (!loadingRef.current) return;

		const observer = new IntersectionObserver(([entry]) => {
			setIsVisible(entry.isIntersecting);
		});

		observer.observe(loadingRef.current);

		return () => observer.disconnect();
	}, [loadingRef]);

	useEffect(() => {
		if (isVisible && !isRefreshing && size < totalPages) setSize(size + 1);
	}, [isVisible, isRefreshing, totalPages]);

	return (
		<>
			<div className='mt-2 flex'>
				<PostTwaat
					onPost={mutate}
					inline={true}
					padding={12}
					placeholder={'Twaat your reply'}
					btnText={'Reply'}
					parent={post._id.toString()}
				>
					<div className='h-px grow mt-3 bg-gray-700' />
				</PostTwaat>
			</div>
			{(!posts ? placeholder || [] : posts).map((reply: IPost) => (
				<PostModal key={reply._id.toString()} post={reply as unknown as IPost} />
			))}
			<div className={'w-full mt-4 flex justify-center items-center' + (!isValidating ? ' invisible' : ' visible')} ref={loadingRef}>
				<FontAwesomeIcon icon={faSpinner} size={'2x'} className={'animate-spin text-black dark:text-white'} />
			</div>
		</>
	);
}
