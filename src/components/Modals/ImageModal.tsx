import {
    ArrowLeftIcon,
    ArrowPathIcon,
    ArrowRightIcon,
    EllipsisHorizontalIcon,
    XMarkIcon,
} from "@heroicons/react/24/solid";
import type { Post } from "@prisma/client";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

import { useModal } from "../Handlers/ModalHandler";
import PostComposer from "../Post/PostComposer";

import { api } from "~/utils/api";

import PostFooter from "../Post/PostFooter";
import PostComponent from "../Post/Post";

export default function ImageModal({
    src,
    post,
}: {
    src: string;
    post: Post & { reposts: { id: string }[] };
}) {
    const [commentsOpen, setCommentsOpen] = useState(true);
    const [localPosts, setLocalPosts] = useState<Post[]>([]);
    const [deletedPosts, setDeletedPosts] = useState<string[]>([]);

    const { data: session } = useSession();
    const user = session?.user;

    const { closeModal } = useModal();

    const { data, fetchNextPage, isLoading } =
        api.post.getCommentPage.useInfiniteQuery(
            { id: post.id },
            {
                getNextPageParam: (lastPage) => lastPage.nextCursor,
            },
        );

    const handleFetchNextPage = useCallback(async () => {
        await fetchNextPage();
    }, [fetchNextPage]);

    const handlePost = (post: Post) => {
        setLocalPosts((p) => [...p, post]);
    };

    const { ref: loadingRef, inView } = useInView();

    useEffect(() => {
        if (inView) handleFetchNextPage().catch(console.error);
    }, [inView, handleFetchNextPage]);

    const posts = [
        ...localPosts,
        ...(data?.pages.reduce(
            (acc, cur) => [...acc, ...cur.items],
            [] as Post[],
        ) ?? []),
    ]
        .filter((post, index, self) => {
            return index === self.findIndex((p) => p.id === post.id);
        })
        .filter((post) => !deletedPosts.includes(post.id));

    if (!post) return;

    return (
        <div className="flex w-full h-full justify-end">
            <div className="grow relative flex flex-col justify-end items-center">
                <div
                    className={
                        "absolute w-8 h-8 rounded-full bg-gray-700/20 backdrop-blur-sm p-1" +
                        " top-2 right-2 flex items-center justify-center cursor-pointer z-10"
                    }
                    onClick={() => setCommentsOpen((prev) => !prev)}
                >
                    {commentsOpen ? (
                        <ArrowRightIcon className="text-black dark:text-white" />
                    ) : (
                        <ArrowLeftIcon className="text-black dark:text-white" />
                    )}
                </div>
                <div
                    className={
                        "absolute w-8 h-8 rounded-full bg-gray-700/20 backdrop-blur-sm p-1" +
                        " top-2 left-2 flex items-center justify-center cursor-pointer z-10"
                    }
                    onClick={() => {
                        closeModal();
                    }}
                >
                    <XMarkIcon className="text-black dark:text-white" />
                </div>
                <div className="grow h-full w-full relative">
                    <div
                        className="absolute left-0 right-0 top-0 bottom-0 m-auto flex justify-center"
                        onClick={(e) => {
                            if (e.target === e.currentTarget) closeModal();
                        }}
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            className="h-full object-contain"
                            src={src}
                            alt={"Post Image"}
                        />
                    </div>
                </div>
                <div className="py-1 flex overflow-hidden items-center justify-center w-full sm:w-3/6 md:w-2/6">
                    <PostFooter post={post} />
                </div>
            </div>
            <div
                className="h-full pt-3 min-w-max w-2/12 bg-white dark:bg-black dark:border-l-[1px] dark:border-gray-500/20"
                style={{ display: commentsOpen ? "block" : "none" }}
            >
                <div className="flex justify-between mx-3">
                    <div className="flex">
                        <div className="relative h-12 w-12">
                            <Link
                                href={"/@" + user?.tag}
                                className="absolute h-12 w-12"
                            >
                                <Image
                                    src={
                                        user?.image ??
                                        "/assets/imgs/default-avatar.png"
                                    }
                                    alt={"Author's Avatar"}
                                    sizes={"100vw"}
                                    fill
                                    className="rounded-full object-cover cursor-pointer transition-opacity hover:opacity-80"
                                />
                            </Link>
                        </div>
                        <div>
                            <div className="flex flex-col ml-3">
                                <Link
                                    href={`/@${user?.tag}`}
                                    className="text-sm font-semibold m-0 text-black dark:text-white"
                                >
                                    {user?.name}
                                </Link>
                                <Link
                                    href={`/@${user?.tag}`}
                                    className="text-gray-500 text-sm m-0"
                                >
                                    @{user?.tag}
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className="group/postMenu bg-red-500/0 hover:bg-red-500/30 hover:cursor-pointer w-8 h-8 p-1 rounded-full flex justify-center items-center">
                            <EllipsisHorizontalIcon
                                className={
                                    "group-hover/postMenu:text-accent-primary-500 text-black dark:text-white"
                                }
                            />
                        </div>
                    </div>
                </div>
                <div className="mx-3 mt-2">
                    <p className="text-xl text-black dark:text-white">
                        {post.content}
                    </p>
                </div>
                <div>
                    <div className="flex justify-between mx-3 mt-3">
                        {/* Format date: h:mm (AM/PM) (dot) M D, Y */}
                        <p className="text-gray-500 text-sm hover:underline cursor-pointer">
                            {new Date(post.createdAt).toLocaleString("en-US", {
                                hour: "numeric",
                                minute: "numeric",
                                hour12: true,
                            })}
                            {" · "}
                            {new Date(post.createdAt).toLocaleString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                            })}
                        </p>
                    </div>
                    <div className="h-px grow mx-3 my-3 bg-gray-500/20" />
                    <div className="mx-3 flex items-center">
                        <p className="text-sm ml-1 mr-4 text-gray-500">
                            <span className="font-semibold text-black dark:text-white">
                                {post.reposts.length}
                            </span>{" "}
                            Retwaats
                        </p>
                        <p className="text-sm ml-1 mr-4 text-gray-500">
                            <span className="font-semibold text-black dark:text-white">
                                {post.likeIDs}
                            </span>{" "}
                            Likes
                        </p>
                    </div>
                    <div className="h-px grow mx-3 my-3 bg-gray-500/20" />
                    <div className="flex justify-evenly mx-3 mt-3">
                        <PostFooter post={post} />
                    </div>
                    <div className="h-px grow mx-3 my-3 bg-gray-500/20" />
                </div>
                <div className="mt-2 flex">
                    <PostComposer
                        parent={post.id}
                        inline={true}
                        padding={12}
                        placeholder={"Twaat your reply"}
                        btnText={"Reply"}
                        onPost={handlePost}
                    >
                        <div className="h-px grow mt-3 bg-gray-700" />
                    </PostComposer>
                </div>
                {posts.map((reply: Post) => (
                    <div
                        key={reply.id}
                        className="border-b-[1px] border-gray-200 dark:border-gray-700 w-full"
                    >
                        <PostComponent
                            post={reply}
                            onDeleted={() =>
                                setDeletedPosts((p) => [...p, reply.id])
                            }
                        />
                    </div>
                ))}
                <div
                    className={
                        "w-full mt-4 flex justify-center items-center" +
                        (!isLoading ? " invisible" : " visible")
                    }
                    ref={loadingRef}
                >
                    <ArrowPathIcon
                        className={
                            "animate-spin h-[1.5em] text-black dark:text-white"
                        }
                    />
                </div>
            </div>
        </div>
    );
}
