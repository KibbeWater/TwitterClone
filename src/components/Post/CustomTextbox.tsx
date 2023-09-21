import { useEffect, useRef } from "react";

type TweetAreaProps = {
    placeholder?: string;
    className?: string;
    value?: string;
    maxLength?: number;
};

export default function CustomTextarea({
    placeholder,
    className,
    maxLength,
    value,
}: TweetAreaProps) {
    const divRef = useRef<HTMLDivElement>(null);
    const selectionRef = useRef<Selection | null>();

    const handleChange = (e: React.ChangeEvent<HTMLDivElement>) => {
        if (!divRef.current) return;

        const selection = window.getSelection();
        selectionRef.current = selection;

        let content = e.target.innerHTML || "";
        if (maxLength && content.length > maxLength)
            content = content.slice(0, maxLength);

        const regex = /(@\w+)\s/g;
        const match = content.match(regex);
        if (match) {
            match.forEach((m) => {
                const span = document.createElement("a");
                span.className = "text-blue-500";
                span.textContent = m.replaceAll(" ", "");
                span.onclick = () =>
                    window.open(
                        `/@${m.replaceAll(" ", "").substring(1)}`,
                        "_blank",
                    );
                content = content.replace(
                    m.replaceAll(" ", ""),
                    span.outerHTML,
                );
            });
        }

        divRef.current.innerHTML = content;
    };

    useEffect(() => {
        if (!value || !divRef.current) return;
        divRef.current.innerHTML = value;
    }, [value]);

    useEffect(() => {
        const selection = selectionRef.current;
        if (!selection?.anchorNode || !selection.focusNode) return;

        // restore the selection range after modifying the content
        const range = document.createRange();
        range.setStart(selection.anchorNode, selection.anchorOffset);
        range.setEnd(selection.focusNode, selection.focusOffset);
        selection.removeAllRanges();
        selection.addRange(range);
    }, [divRef.current?.innerHTML]);

    /* useEffect(() => {
		if (!value || !divRef.current) return;
		divRef.current.textContent = value;
	}, [value]); */

    return (
        <div
            ref={divRef}
            className={[
                className?.replaceAll("placeholder:", "empty:before:"),
                "empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 empty:before:text-lg text-xl cursor-text break-all outline-none",
            ]
                .filter((p) => p)
                .join(" ")}
            data-placeholder={placeholder}
            onInput={handleChange}
            contentEditable
            suppressContentEditableWarning
        />
    );
}
