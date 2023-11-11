import { useRef, useState, forwardRef, useCallback } from "react";
import TextareaAutosize from "react-textarea-autosize";

import UserContext from "~/components/UserContext";

import { api } from "~/utils/api";

type TweetAreaProps = {
    placeholder?: string;
    value: string;
    inline?: boolean;
    maxLength?: number;
    onChange?: (text: string) => void;
};

const Component = forwardRef<HTMLTextAreaElement, TweetAreaProps>(
    function PostTextarea(
        { placeholder, inline, value, onChange, maxLength }: TweetAreaProps,
        ref,
    ) {
        const [tag, setTag] = useState("");

        const { data: users } = api.user.findUsers.useQuery(
            { query: tag },
            { trpc: { abortOnUnmount: true } },
        );

        const parent = useRef<HTMLDivElement>(null);
        const innerRef = useRef<HTMLTextAreaElement | null>(null);

        const setRef = useCallback(
            (element: HTMLTextAreaElement) => {
                if (typeof ref === "function") ref(element);
                else if (ref) ref.current = element;
                innerRef.current = element;
            },
            [ref],
        );

        const handleInputChange = useCallback(
            (content: string) => {
                onChange?.(content);

                const value = content;
                const regex = /@\w+/g; // regex to match @username
                const match = value.match(regex);

                const lastMatch =
                    match && match.length > 0 && match[match.length - 1];
                if (lastMatch && value.endsWith(lastMatch))
                    return setTag(lastMatch.substring(1)); // remove @ symbol from username

                setTag("");
            },
            [onChange],
        );

        return (
            <div className="relative" ref={parent}>
                <TextareaAutosize
                    placeholder={placeholder ?? "What's happening?"}
                    className={
                        !inline
                            ? "w-full outline-none border-0 resize-none text-xl bg-transparent text-black dark:text-white"
                            : "text-black dark:text-white bg-transparent border-0 text-lg leading-6 columns-4 resize-none w-full p-0 m-0 outline-none"
                    }
                    value={value}
                    maxLength={maxLength ?? 300}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        handleInputChange(e.target.value)
                    }
                    ref={setRef}
                />
                {tag && (
                    <div className="min-w-[18rem] max-h-96 min-h-[2rem] shadow-lg rounded-md bg-neutral-50 dark:bg-neutral-950 absolute z-10 overflow-auto overflow-x-hidden">
                        {(users ?? []).map((usr) => (
                            <div
                                key={`mention-search-result-${usr.id}`}
                                className="cursor-pointer"
                            >
                                <UserContext
                                    user={usr}
                                    onClick={() => {
                                        onChange?.(
                                            value.replace(
                                                `@${tag}`,
                                                `@${usr.tag} `,
                                            ),
                                        );
                                        setTag("");
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    },
);

export default Component;
