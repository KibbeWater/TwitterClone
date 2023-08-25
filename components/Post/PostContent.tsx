import Link from 'next/link';
import { SafeUser } from '../../libs/user';
import { IPost } from '../../types/IPost';

export default function PostContent({ post, onClick }: { post: IPost; onClick?: (e: any) => void }) {
	const mentions = (post.mentions as unknown as SafeUser[] | null) || [];
	const linkRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;

	return (
		<p
			className={'text-black w-full max-w-full dark:text-gray-200 whitespace-normal'}
			style={{ wordBreak: 'break-word' }}
			onClick={onClick}
			key={`${post._id}-content`}
		>
			{post.content.split('\n').map((line, i, arr) => {
				return (
					<>
						<span key={i} className='block'>
							{line.split(' ').map((word, idx, arr) => {
								const tag = word.substring(1).toLowerCase();
								const mentionTag = mentions.find((mention) => mention.tag.toLowerCase() === tag);
								const link = word.match(linkRegex);
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

								if (link)
									return (
										<>
											<Link
												className={'text-blue-500 hover:underline font-semibold'}
												href={link[0]}
												key={`${word}-${idx}}`}
											>
												{word}
											</Link>
											{idx !== arr.length - 1 ? ' ' : ''}
										</>
									);

								return word + (idx !== arr.length - 1 ? ' ' : '');
							})}
						</span>
						{line === '' ? <br /> : null}
					</>
				);
			})}
		</p>
	);
}
