import { useEffect, useRef, useState } from "react";

export default function SingleLabelledInput({
    label,
    value,
    maxLength = -1,
    onChange,
}: {
    label: string;
    value?: string;
    maxLength?: number;
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

    return (
        <div
            className="w-full p-2 flex flex-col gap-1 focus-within:border-[2px] transition-colors border-[1px] border-gray-500 focus-within:border-accent-primary-500 rounded-md cursor-pointer box-content group/lbl"
            onClick={() => {
                inputRef.current?.focus();
            }}
        >
            <div className="flex justify-between">
                <p className="text-sm text-gray-500 group-focus-within/lbl:text-accent-primary-500 transition-colors">
                    {label}
                </p>
                {maxLength !== -1 && (
                    <p className="text-gray-500 text-xs">
                        {text.length}/{maxLength}
                    </p>
                )}
            </div>
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
        </div>
    );
}
