'use client';

import Image from 'next/image';
import { useState } from 'react';
import useSWRInfinite from 'swr/infinite';

import PageTemplate from '../../components/PageTemplate';
import Post from '../../components/Post';
import TextAutosize from '../../components/TextAutosize';
import { SendPost } from '../../libs/post';
import { IPost } from '../../schemas/IPost';

export default function Page() {
	const [text, setText] = useState('');

	const { data, size, setSize } = useSWRInfinite<{ success: boolean; posts: IPost[]; pages: number }>(
		(index, previousPageData) => {
			if (previousPageData && previousPageData.pages < index) return null;
			return `/api/post?page=${index}`;
		},
		(url) => fetch(url).then((res) => res.json())
	);

	const posts = data ? data.map((page) => page.posts).flat() : [];

	const btnPostClick = () => {
		SendPost(text).then((res) => {
			setText('');
		});
	};

	console.log(posts);

	return (
		<PageTemplate name='Home'>
			<div className='flex w-full px-5 pb-4 bg-white relative z-10 border-b-[1px] border-gray-700'>
				<div>
					<Image src={'/default_avatar.png'} alt={'Your profile picture'} width={55} height={55} className={'rounded-full'} />
				</div>
				<div className='flex flex-col px-5 w-full'>
					<TextAutosize
						minRows={1}
						placeholder={"What's happening?"}
						className={'w-full outline-none border-0 mb-4 resize-none text-xl bg-transparent text-black'}
						value={text}
						onChange={(e) => setText(e.target.value)}
					/>
					<div className='h-px w-full opacity-50 bg-gray-900' />
					<div className='flex justify-between items-center mt-5 h-min'>
						<div>
							<p className='m-0 text-black'>* Upload Button *</p>
						</div>
						<div>
							<button
								className='py-2 px-5 rounded-full border-0 bg-accent-primary-500 text-white cursor-pointer text-md font-bold'
								onClick={btnPostClick}
							>
								Post
							</button>
						</div>
					</div>
				</div>
			</div>
			<div className='flex flex-col items-center pb-14'>
				{posts.map((post) => (post ? <Post key={post._id as unknown as string} post={post} /> : <></>))}
			</div>
		</PageTemplate>
	);
}
