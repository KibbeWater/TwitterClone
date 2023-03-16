import Link from 'next/link';
import { SafeUser } from '../../libs/user';
import { IPost } from '../../types/IPost';

export default function PostContent({ post, onClick }: { post: IPost; onClick?: (e: any) => void }) {
	const mentions = (post.mentions as unknown as SafeUser[] | null) || [];

	return (
		<p
			className={'text-black w-full max-w-full dark:text-gray-200 whitespace-normal'}
			style={{ wordBreak: 'break-word' }}
			onClick={onClick}
		>
			{post.content.split(' ').map((word, idx, arr) => {
				const tag = word.substring(1).toLowerCase();
				const mentionTag = mentions.find((mention) => mention.tag.toLowerCase() === tag);
				if (mentionTag)
					return (
						<>
							<Link
								className={'text-blue-500 hover:underline font-semibold'}
								href={`/@${mentionTag.tag}`}
								key={`${word}-${idx}}`}
								onClick={(e) => e.stopPropagation()}
							>
								@{mentionTag.username}
							</Link>
							{idx !== arr.length - 1 ? ' ' : ''}
						</>
					);

				return word + (idx !== arr.length - 1 ? ' ' : '');
			})}
		</p>
	);
}
