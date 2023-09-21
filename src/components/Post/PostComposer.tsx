import Image from "next/image";
import { useState, useEffect } from "react";
import type { Post } from "@prisma/client";

import PostComponent from "./Post";
import { useSession } from "next-auth/react";

import { api } from "~/utils/api";
import { PhotoIcon } from "@heroicons/react/20/solid";
import PostTextarea from "./PostTextarea";

type Props = {
    placeholder?: string;
    btnText?: string;
    onPost?: (post: Post) => void;
    children?: React.ReactNode;
    inline?: boolean;
    avatarSize?: number;
    padding?: number;
    parent?: string;
    quote?: Post;
};

export default function PostTwaat({
    onPost,
    placeholder,
    btnText,
    children,
    inline,
    avatarSize = 48,
    padding,
    parent,
    quote,
}: Props) {
    const [text, setText] = useState("");
    const [tempDisabled, setTempDisabled] = useState(false);

    const { mutate: _sendPost, isLoading } = api.post.create.useMutation({
        onSuccess: (post) => {
            onPost?.(post); // There is nothing I love more than this GOOFY ASS javascript syntax
            setText("");
        },
        onError: () => setTempDisabled(true),
    });

    const { data: session } = useSession();
    const user = session?.user;

    const btnPostClick = () => {
        if (isLoading) return;
        _sendPost({ content: text });
    };

    useEffect(() => {
        setTempDisabled(false);
    }, [text]);

    if (!user) return null;

    return (
        <div className="flex flex-col w-full">
            <div
                className="flex w-full bg-white dark:bg-black relative z-10"
                style={{ paddingInline: padding }}
            >
                <div
                    className="relative"
                    style={{ width: avatarSize, height: avatarSize }}
                >
                    <div
                        className="absolute"
                        style={{ width: avatarSize, height: avatarSize }}
                    >
                        <Image
                            className="object-cover rounded-full w-full h-full"
                            src={user.image ?? "/default_avatar.png"}
                            alt={`${user.name}'s Avatar`}
                            sizes="100vw"
                            fill
                            priority
                        />
                    </div>
                </div>

                <div
                    className="flex flex-col pl-5 pr-1 w-full"
                    style={{ marginTop: inline ? 12 : 0 }}
                >
                    <PostTextarea
                        placeholder={placeholder ?? "What's happening?"}
                        inline={inline}
                        value={text}
                        onChange={(t) => setText(t)}
                    />
                    {quote ? (
                        <div
                            className={
                                "group/quote mt-1 pl-1 rounded-md border-[1px] border-gray-500 transition-colors bg-black/0 hover:bg-black/10"
                            }
                        >
                            <PostComponent post={quote} isRef={true} />
                        </div>
                    ) : (
                        <></>
                    )}
                    {!inline ? (
                        <div className="h-px w-full opacity-50 bg-gray-500" />
                    ) : null}
                    <div className="flex justify-between items-center mt-2 h-min">
                        <div
                            className="flex items-center justify-center w-10 h-10 rounded-full transition-colors text-red-500 bg-accent-primary-500/0 hover:bg-accent-primary-500/20 hover:cursor-pointer"
                            /* onClick={() => uploadMedia()} */
                        >
                            <PhotoIcon className="m-2" />
                        </div>
                        <div>
                            <button
                                className={
                                    "py-[6px] px-4 rounded-full border-0 bg-accent-primary-500 text-white cursor-pointer text-md font-bold transition-colors " +
                                    "disabled:bg-red-800 disabled:text-gray-200 disabled:cursor-default transition-all duration-300"
                                }
                                onClick={btnPostClick}
                                disabled={!text || isLoading || tempDisabled}
                            >
                                {btnText ?? "Twaat"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {children}
        </div>
    );
}
