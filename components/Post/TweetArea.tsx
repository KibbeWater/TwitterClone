import { useEffect, useRef, useState } from 'react';
import TextareaAutosize from '../TextAutosize';

type TweetAreaProps = {
	placeholder?: string;
	value?: string;
	inline?: boolean;
	onChange?: (text: string) => void;
};

export default function TweetArea({ placeholder, inline, value, onChange }: TweetAreaProps) {
	const [text, setText] = useState(value || '');
	const [tag, setTag] = useState('');
	const [popoverPosition, setPopoverPosition] = useState<{ top: number; left: number } | null>(null);

	const parent = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!value) return;
		setText(value);
	}, [value]);

	useEffect(() => {
		if (!onChange) return;
		onChange(text);
	}, [text]);

	const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setText(e.target.value);

		const value = e.target.value;
		const regex = /@\w+/g; // regex to match @username
		const match = value.match(regex);
		if (match && match.length > 0) {
			const username = match[0].substring(1); // remove @ symbol from username
			setTag(username);

			// Get position of tag
			const textarea = e.target;
			const textareaRect = textarea.getBoundingClientRect();
			const parentRect = parent.current?.getBoundingClientRect();
			const scrollTop = textarea.scrollTop;
			const lineHeight = parseFloat(window.getComputedStyle(textarea).lineHeight);
			const tagRect = textareaRect.bottom - scrollTop - lineHeight;

			const topRelativeToParent = tagRect - (parentRect?.top || 0);

			// Calculate the length of the text on the current line
			const cursorPos = e.target.selectionStart;
			const cursorRect = getCaretCoordinates(e.target, cursorPos);
			const cursorDistanceFromEnd = textareaRect.right - cursorRect.left;
			const charWidth = parseFloat(window.getComputedStyle(textarea).fontSize);
			const textWidthOnCurrentLine = cursorDistanceFromEnd / charWidth;

			// Position the popover at the end of the textarea text
			const leftRelativeToParent = textareaRect.left - (parentRect?.left || 0) + textWidthOnCurrentLine * charWidth;

			setPopoverPosition({ top: topRelativeToParent, left: leftRelativeToParent });
		} else {
			setTag('');
			setPopoverPosition(null);
		}
	};

	return (
		<div style={{ position: 'relative' }} ref={parent}>
			<TextareaAutosize
				minRows={1}
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
			{tag && popoverPosition && (
				<div style={{ position: 'absolute', top: popoverPosition.top, left: popoverPosition.left }}>Popover content for {tag}</div>
			)}
		</div>
	);
}

/* type TweetAreaProps = {
	placeholder?: string;
	className?: string;
	onChange?: (text: string) => void;
	value?: string;
	maxLength?: number;
};

export default function TweetArea({ placeholder, className, maxLength, value, onChange }: TweetAreaProps) {

	const divRef = useRef<HTMLDivElement>(null);

	const handleChange = (e: React.ChangeEvent<HTMLDivElement>) => {
		if (!divRef.current) return;

		let content = e.target.innerHTML;
		if (maxLength && content.length > maxLength) content = content.slice(0, maxLength);

		// If the content ends with "@(username)", we want to add a modal at the end of the content
		// Preferably, we want to use regex to check if the content ends with a required @ and then a optional username following it. Any character after that is not allowed (such as a space)
		const regex = /@([a-zA-Z0-9_]{1,15})$/;
		const match = content.match(regex);

		divRef.current.innerHTML = e.target.innerHTML;
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
} */
