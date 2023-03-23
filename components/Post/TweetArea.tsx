import { useEffect, useRef, useState } from 'react';
import { SafeUser } from '../../libs/user';

import TextareaAutosize from '../TextAutosize';
import UserEntry from '../UserEntry';
import CustomTextarea from './CustomTextarea';

type TweetAreaProps = {
	placeholder?: string;
	value?: string;
	inline?: boolean;
	onChange?: (text: string) => void;
};

export default function TweetArea({ placeholder, inline, value, onChange }: TweetAreaProps) {
	const [text, setText] = useState(value || '');
	const [tag, setTag] = useState('');
	const [users, setUsers] = useState<SafeUser[]>([]);

	useEffect(() => {
		const controller = new AbortController();
		if (tag.length === 0) return setUsers([]);
		else
			import('axios').then((pkg) => {
				pkg.default
					.get<{ success: boolean; error?: string; users: SafeUser[] }>(`/api/search?q=${tag}`, { signal: controller.signal })
					.then((res) => {
						if (!res.data.success) return console.error(res.data.error);
						setUsers(res.data.users);
						console.log(res.data.users);
					})
					.catch((err) => {});
			});
		return () => controller.abort();
	}, [tag]);

	const parent = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!value) return;
		setText(value);
	}, [value]);

	useEffect(() => {
		if (!onChange) return;
		onChange(text);
	}, [text]);

	const handleInputChange = (content: string) => {
		setText(content);

		const value = content;
		const regex = /@\w+/g; // regex to match @username
		const match = value.match(regex);

		const lastMatch = match && match.length > 0 && match[match.length - 1];
		if (lastMatch && value.endsWith(lastMatch)) return setTag(lastMatch.substring(1)); // remove @ symbol from username

		setTag('');
	};

	return (
		<div style={{ position: 'relative' }} ref={parent}>
			{/* <TextareaAutosize
				placeholder={placeholder || "What's happening?"}
				className={
					!inline
						? 'w-full outline-none border-0 resize-none text-xl bg-transparent text-black dark:text-white'
						: 'text-black dark:text-white bg-transparent border-0 text-lg leading-6 columns-4 resize-none w-full p-0 m-0 outline-none'
				}
				value={text}
				maxLength={2000}
				onChange={handleInputChange}
			/> */}
			<CustomTextarea
				placeholder={placeholder || "What's happening?"}
				className={
					!inline
						? 'w-full outline-none border-0 resize-none text-xl bg-transparent text-black dark:text-white'
						: 'text-black dark:text-white bg-transparent border-0 text-lg leading-6 columns-4 resize-none w-full p-0 m-0 outline-none'
				}
				value={text}
				maxLength={2000}
				onChange={handleInputChange}
			/>
			{tag && (
				<div className='min-w-[18rem] max-h-96 shadow-lg rounded-md bg-white dark:bg-black absolute z-10 overflow-auto overflow-x-hidden'>
					{users.map((usr, idx) => (
						<UserEntry
							user={usr}
							key={`mention-search-result-${usr._id}`}
							onClick={(e) => {
								setText(text.replace(`@${tag}`, `@${usr.tag} `));
								setTag('');
							}}
						/>
					))}
				</div>
			)}
		</div>
	);
}
