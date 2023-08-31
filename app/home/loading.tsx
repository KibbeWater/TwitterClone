import PageTemplate from '../../components/PageTemplate';
import PostSkeleton from '../../components/Post/PostSkeleton';
import PostTwaat from '../../components/Post/PostTwaat';

export default function Loading() {
	// You can add any UI inside Loading, including a Skeleton.
	return (
		<PageTemplate name='Home'>
			<div className='pb-2 border-b-[1px] border-gray-700'>
				<PostTwaat avatarSize={56} padding={20} />
			</div>
			<div className='flex flex-col w-full overflow-hidden items-center pb-14'>
				{[...Array(10)].map((i) => {
					return <PostSkeleton key={i} />;
				})}
			</div>
		</PageTemplate>
	);
}
