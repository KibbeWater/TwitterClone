// Nothing about this file is unsafe and it compiles COMPLETELY fine without these eslint-disable comments
// But whatever pleases the linter eh?
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
    ArrowUturnRightIcon,
    ChatBubbleOvalLeftEllipsisIcon,
    HeartIcon as HeartOutline,
    ShareIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import type { Post } from "@prisma/client";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { api } from "~/utils/api";

export default function PostFooter({
    post,
}: {
    post: Post & {
        comments?: { id: string }[];
        reposts?: { id: string }[];
    };
}) {
    const user = useSession().data?.user;

    const [localLike, setLocalLike] = useState(false);
    const [hasLiked, setHasLiked] = useState(
        user !== undefined ? post.likeIDs.includes(user.id) : false,
    );

    const { mutate: _setLike } = api.post.setLike.useMutation();

    useEffect(() => {
        setLocalLike(false);
    }, [post.likeIDs]);

    const likeCount =
        post.likeIDs.length + (localLike ? (hasLiked ? 1 : -1) : 0);

    const setLike = (shouldLike: boolean) => {
        _setLike({ postId: post.id, shouldLike });
        setLocalLike((p) => !p);
        setHasLiked((p) => !p);
    };

    const HeartIcon = !hasLiked ? HeartOutline : HeartSolid;

    return (
        <div className={"mt-3 h-8 flex justify-evenly"}>
            <div className="flex items-center mr-2">
                <Link
                    href={`/post/${post.id}`}
                    className={
                        "border-0 p-1 h-8 w-8 mr-1 rounded-full flex items-center justify-center transition-colors bg-black/0 cursor-pointer hover:bg-red-500/40 group/btnComment"
                    }
                >
                    <ChatBubbleOvalLeftEllipsisIcon className="text-black dark:text-white group-hover/btnComment:text-red-500" />
                </Link>
                <p className="text-black dark:text-white text-sm">
                    {post.comments?.length ?? "ERR"}
                </p>
            </div>
            <div className="flex items-center mr-2">
                <button
                    className={
                        "border-0 p-1 h-8 w-8 mr-1 rounded-full flex items-center justify-center transition-colors bg-black/0 cursor-pointer hover:bg-[#3cff3c]/40 group/btnRetweet"
                    }
                    onClick={(e) => {
                        e.stopPropagation();
                        /* if (setModal) setModal(<PostModal quote={post} />); */
                    }}
                    aria-label="Retweet"
                >
                    <ArrowUturnRightIcon className="text-black dark:text-white group-hover/btnRetweet:text-green-500" />
                </button>
                <p className="text-black dark:text-white text-sm">
                    {post.reposts?.length ?? "ERR"}
                </p>
            </div>
            <div className="flex items-center mr-2">
                <button
                    className={
                        "border-0 h-8 w-8 mr-1 p-1 rounded-full flex items-center justify-center transition-colors bg-black/0 cursor-pointer hover:bg-red-500/40 group/btnLike disabled:cursor-default"
                    }
                    onClick={(e) => {
                        e.stopPropagation();
                        setLike(!hasLiked);
                    }}
                    aria-label="Like"
                >
                    <HeartIcon
                        className={
                            hasLiked
                                ? "text-red-500 group-hover/btnLike:text-black dark:group-hover/btnLike:text-white/60 transition-colors"
                                : "text-black dark:text-white group-hover/btnLike:text-red-500 transition-colors"
                        }
                    />
                </button>
                <p className="text-black dark:text-white text-sm">
                    {likeCount}
                </p>
            </div>
            <div className="flex items-center mr-2">
                <button
                    className={
                        "border-0 p-1 h-8 w-8 mr-1 rounded-full flex items-center justify-center transition-colors bg-black/0 cursor-pointer hover:bg-red-500/40 group/btnShare disabled:cursor-default"
                    }
                    aria-label="Share"
                    onClick={(e) => e.stopPropagation()}
                >
                    <ShareIcon className="text-black dark:text-white group-hover/btnShare:text-red-500" />
                </button>
            </div>
        </div>
    );
}
