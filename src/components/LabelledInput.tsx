import { useEffect, useRef, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";

export default function LabelledInput({
    className = "",
    label,
    value,
    maxLength = -1,
    minRows = -1,
    maxRows = -1,
    onChange,
}: {
    className?: string;
    label: string;
    value?: string;
    maxLength?: number;
    minRows?: number;
    maxRows?: number;
    onChange?: (text: string) => void;
}) {
    const [text, setText] = useState(value ?? "");

    useEffect(() => {
        onChange?.(text);
    }, [text, onChange]);

    useEffect(() => {
        if (value !== undefined) setText(value);
    }, [value]);

    const inputRef = useRef<HTMLInputElement>(null);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    return (
        <div
            className={`p-2 flex flex-col gap-1 focus-within:border-[2px] transition-colors border-[1px] border-gray-500 focus-within:border-accent-primary-500 rounded-md cursor-text box-content group/lbl${
                className ? ` ${className}` : ""
            }`}
            onClick={() => {
                inputRef.current?.focus();
                textAreaRef.current?.focus();
            }}
        >
            <div className="flex justify-between">
                <p className="text-sm text-gray-500 group-focus-within/lbl:text-accent-primary-500 transition-colors">
                    {label}
                </p>
                {maxLength !== -1 && (
                    <p className="text-gray-500 text-xs hidden group-focus-within/lbl:block">
                        {text.length}/{maxLength}
                    </p>
                )}
            </div>
            {maxRows !== -1 || minRows !== -1 ? (
                <TextareaAutosize
                    className="dark:text-white dark:caret-white bg-transparent w-full resize-none group focus:outline-none"
                    ref={textAreaRef}
                    maxRows={maxRows === -1 ? undefined : maxRows}
                    minRows={maxRows === -1 ? undefined : minRows}
                    value={text}
                    onChange={(e) =>
                        e.target.value.length <= maxLength || maxLength === -1
                            ? setText(e.target.value)
                            : null
                    }
                />
            ) : (
                <input
                    className="dark:text-white dark:caret-white bg-transparent w-full group focus:outline-none"
                    type="text"
                    ref={inputRef}
                    value={text}
                    onChange={(e) =>
                        e.target.value.length <= maxLength || maxLength === -1
                            ? setText(e.target.value)
                            : null
                    }
                />
            )}
        </div>
    );
}
