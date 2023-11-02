import { useRef, useCallback } from "react";
import TextareaAutosize from "react-textarea-autosize";

type LabelledInputProps = {
    className?: string;
    label: string;
    value?: string;
    placeholder?: string;
    small?: boolean;
    maxLength?: number;
    minRows?: number;
    maxRows?: number;
    disabled?: boolean;
    validator?: (text: string) => boolean;
    softValidator?: (text: string) => boolean;
    onChange?: (text: string) => void;
};

export default function LabelledInput({
    className = "",
    label,
    value: _val,
    placeholder,
    small,
    maxLength = -1,
    minRows = -1,
    maxRows = -1,
    disabled = false,
    validator,
    softValidator,
    onChange,
}: LabelledInputProps) {
    const handleTextChange = useCallback(
        (newText: string) => {
            if (newText.length > maxLength && maxLength !== -1) return;
            if (validator && !validator(newText)) return;
            onChange?.(newText);
        },
        [maxLength, validator, onChange],
    );

    const text = useCallback<() => string>(() => {
        let text = _val ?? "";
        if (maxLength !== -1) text = text.slice(0, maxLength);
        return text;
    }, [_val, maxLength]);

    const inputRef = useRef<HTMLInputElement>(null);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    return (
        <div
            className={`p-2 flex flex-col ${
                small && "gap-1"
            } focus-within:border-[2px] transition-colors border-[1px] border-gray-500 focus-within:border-accent-primary-500 rounded-md cursor-text box-content group/lbl${
                className ? ` ${className}` : ""
            }`}
            onClick={() => {
                inputRef.current?.focus();
                textAreaRef.current?.focus();
            }}
        >
            <div
                className={[
                    "flex justify-between",
                    disabled ? "cursor-default" : "cursor-text",
                ].join(" ")}
            >
                <p
                    className={[
                        "text-sm text-gray-500 group-focus-within/lbl:text-accent-primary-500 transition-colors select-none",
                        small && "!text-xs leading-snug",
                        disabled ? "cursor-default" : "cursor-text",
                    ].join(" ")}
                >
                    {label}
                </p>
                {maxLength !== -1 && (
                    <p
                        className={`${
                            !softValidator || softValidator(text())
                                ? "text-gray-500"
                                : "text-red-500"
                        } text-xs hidden group-focus-within/lbl:block`}
                    >
                        {text().length}/{maxLength}
                    </p>
                )}
            </div>
            {maxRows !== -1 || minRows !== -1 ? (
                <TextareaAutosize
                    className={`dark:text-white dark:caret-white bg-transparent w-full resize-none group focus:outline-none ${
                        disabled ? "!text-gray-500" : ""
                    } ${small ? "text-sm" : "text-base"}`}
                    ref={textAreaRef}
                    maxRows={maxRows === -1 ? undefined : maxRows}
                    minRows={maxRows === -1 ? undefined : minRows}
                    value={text()}
                    disabled={disabled}
                    placeholder={placeholder}
                    onChange={(e) => handleTextChange(e.target.value)}
                />
            ) : (
                <input
                    className={`dark:text-white dark:caret-white bg-transparent w-full group focus:outline-none ${
                        disabled ? "!text-gray-500" : ""
                    } ${small ? "text-sm" : "text-base"}`}
                    type="text"
                    ref={inputRef}
                    value={text()}
                    disabled={disabled}
                    placeholder={placeholder}
                    onChange={(e) => handleTextChange(e.target.value)}
                />
            )}
        </div>
    );
}
