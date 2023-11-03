import { ArrowPathIcon } from "@heroicons/react/24/solid";
import type { Post as _PostType } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState, useMemo } from "react";
import { useInView } from "react-intersection-observer";

import PostComponent from "~/components/Post/Post";
import PostComposer from "~/components/Post/PostComposer";
import Layout from "~/components/Site/Layouts/Layout";
import PostSkeleton from "~/components/Skeletons/PostSkeleton";

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

export default function Home() {
    const [localPosts, setLocalPosts] = useState<Post[]>([]);
    const [deletedPosts, setDeletedPosts] = useState<string[]>([]);

    const { status } = useSession();

    const { data, fetchNextPage, isLoading } =
        api.post.getPage.useInfiniteQuery(
            {},
            {
                getNextPageParam: (lastPage) => lastPage.nextCursor,
            },
        );

    const onPost = useCallback((p: Post) => {
        setLocalPosts((prev) => [p, ...prev]);
    }, []);

    const handleFetchNextPage = useCallback(async () => {
        await fetchNextPage();
    }, [fetchNextPage]);

    const { ref: loadingRef, inView } = useInView();

    useEffect(() => {
        if (inView) handleFetchNextPage().catch(console.error);
    }, [inView, handleFetchNextPage]);

    useEffect(() => {
        setLocalPosts([]);
        setDeletedPosts([]);
    }, [data]);

    const posts = useMemo(
        () =>
            [
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
                ) ?? ([] as Post[])),
            ]
                .filter((post, index, self) => {
                    return index === self.findIndex((p) => p.id === post.id);
                })
                .filter((post) => !deletedPosts.includes(post.id)),
        [data?.pages, deletedPosts, localPosts],
    );

    return (
        <Layout title="Home">
            {status === "authenticated" && (
                <div className="py-4 px-6 border-b-[1px] border-highlight-light dark:border-highlight-dark">
                    <PostComposer onPost={onPost} />
                </div>
            )}
            <div className="flex flex-col w-full overflow-hidden items-center pb-14">
                {posts.map((post) => (
                    <div
                        key={`post-${post.id}`}
                        className="border-b-[1px] border-highlight-light dark:border-highlight-dark w-full"
                    >
                        <PostComponent
                            post={post}
                            onMutate={onPost}
                            onDeleted={() =>
                                setDeletedPosts((p) => [...p, post.id])
                            }
                        />
                    </div>
                ))}
                {posts.length <= 0 && (
                    <div className="flex flex-col w-full overflow-hidden items-center">
                        {[...Array<number>(10)].map((_, idx) => {
                            return <PostSkeleton key={`loading-${idx}`} />;
                        })}
                    </div>
                )}
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
        </Layout>
    );
}
