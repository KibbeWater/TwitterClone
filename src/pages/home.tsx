import { ArrowPathIcon } from "@heroicons/react/24/solid";
import type { Post } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

import PostComponent from "~/components/Post/Post";
import PostComposer from "~/components/Post/PostComposer";
import Layout from "~/components/Site/Layout";
import PostSkeleton from "~/components/Skeletons/PostSkeleton";

import { api } from "~/utils/api";

export default function Home() {
    const [localPosts, setLocalPosts] = useState<Post[]>([]);

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
    }, [data]);

    const posts = [
        ...localPosts,
        ...(data?.pages.reduce(
            (acc, cur) => [...acc, ...cur.items],
            [] as Post[],
        ) ?? []),
    ];

    return (
        <Layout title="Home">
            {status === "authenticated" && (
                <div className="py-4 px-6 border-b-[1px] border-gray-200 dark:border-gray-700">
                    <PostComposer onPost={onPost} />
                </div>
            )}
            <div className="flex flex-col w-full overflow-hidden items-center pb-14">
                {posts.map((post) => (
                    <div
                        key={`post-${post.id}`}
                        className="border-b-[1px] border-gray-200 dark:border-gray-700 w-full"
                    >
                        <PostComponent post={post} onMutate={onPost} />
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
