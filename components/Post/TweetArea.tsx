import { useEffect, useRef, useState } from 'react';

type TweetAreaProps = {
	placeholder?: string;
	className?: string;
	onChange?: (text: string) => void;
	value?: string;
	maxLength?: number;
};

export default function TweetArea({ placeholder, className, value, onChange }: TweetAreaProps) {
	/* const [text, setText] = useState(value); */

	const divRef = useRef<HTMLDivElement>(null);

	const handleChange = (e: React.ChangeEvent<HTMLDivElement>) => {
		if (!divRef.current) return;
		divRef.current.textContent = e.target.textContent;
		console.log(e.target.textContent);
		onChange && onChange(e.target.innerHTML);
	};

	useEffect(() => {
		if (!value || !divRef.current) return;
		divRef.current.textContent = value;
	}, [value]);

	return (
		<div
			ref={divRef}
			className={[
				className?.replaceAll('placeholder:', 'empty:before:'),
				'empty:before:content-[attr(data-placeholder)] empty:before:text-gray-500 cursor-text break-all',
			]
				.filter((p) => p)
				.join(' ')}
			data-placeholder={placeholder}
			onInput={handleChange}
			contentEditable
			suppressContentEditableWarning
		/>
	);
}
