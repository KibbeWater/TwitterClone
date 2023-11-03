import { ArrowPathIcon } from "@heroicons/react/24/solid";
import type { Post as _PostType } from "@prisma/client";
import { useCallback, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

import PostComponent from "~/components/Post/Post";
import PostComposer from "~/components/Post/PostComposer";

import { api } from "~/utils/api";

type User = {
    id: string;
    name: string | null;
    tag: string | null;
    image: string | null;
    permissions: string;
    roles: {
        id: string;
        permissions: string;
    }[];
    verified: boolean | null;
    followerIds: string[];
    followingIds: string[];
};

type Post = _PostType & {
    user: User;
    quote:
        | (_PostType & {
              user: User;
              quote: null;
              reposts: { id: string; user: User }[];
          })
        | null;
    reposts: { id: string; user: User }[];
    comments?: { id: string }[];
};

export default function PostComments({
    post,
    onPost,
}: {
    post: Post;
    onPost?: (post: Post) => void;
}) {
    const [localPosts, setLocalPosts] = useState<Post[]>([]);
    const [deletedPosts, setDeletedPosts] = useState<string[]>([]);

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

    const handlePost = useCallback(
        (post: Post) => {
            onPost?.(post);
            setLocalPosts((p) => [...p, post]);
        },
        [onPost],
    );

    const { ref: loadingRef, inView } = useInView();

    useEffect(() => {
        if (inView) handleFetchNextPage().catch(console.error);
    }, [inView, handleFetchNextPage]);

    useEffect(() => {
        setLocalPosts([]);
    }, [data]);

    const posts = [
        ...localPosts,
        ...(data?.pages.reduce(
            (acc, cur) => [
                ...acc,
                ...cur.items.map((p) => ({
                    ...p,
                    quote: p.quote ? { ...p.quote, quote: null } : null,
                })),
            ],
            [] as Post[],
        ) ?? []),
    ]
        .filter((post, index, self) => {
            return index === self.findIndex((p) => p.id === post.id);
        })
        .filter((post) => !deletedPosts.includes(post.id));

    return (
        <>
            <div className="mt-2 pb-3 flex border-b-[1px] border-highlight-light dark:border-highlight-dark">
                <PostComposer
                    inline={true}
                    padding={12}
                    placeholder={"Twaat your reply"}
                    btnText={"Reply"}
                    parent={post.id}
                    onPost={handlePost}
                />
            </div>
            {posts.map((reply: Post) => (
                <div
                    key={`post-${reply.id}`}
                    className="border-b-[1px] border-highlight-light dark:border-highlight-dark w-full"
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
        </>
    );
}
