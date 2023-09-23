import type { Post } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useCallback, useState, useEffect } from "react";

import PostComponent from "~/components/Post/Post";
import PostComposer from "~/components/Post/PostComposer";
import Layout from "~/components/Site/Layout";
import PostSkeleton from "~/components/Skeletons/PostSkeleton";

import { api } from "~/utils/api";

export default function Home() {
    /* const [page, setPage] = useState(0); */
    const [localPosts, setLocalPosts] = useState<Post[]>([]);

    const { status } = useSession();

    // TODO: We can use React Query's useInfiniteQuery to create the feed
    const { data /* , fetchNextPage */ } = api.post.getPage.useInfiniteQuery(
        {},
        {
            getNextPageParam: (lastPage) => lastPage.nextCursor,
        },
    );

    const onPost = useCallback((p: Post) => {
        setLocalPosts((prev) => [p, ...prev]);
    }, []);

    /* const handleFetchNextPage = async () => {
        await fetchNextPage();
        setPage((prev) => prev + 1);
    }; */

    useEffect(() => {
        setLocalPosts([]);
    }, [data]);

    // data will be split in pages
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
                        <PostComponent post={post} />
                    </div>
                ))}
                {posts.length <= 0 && (
                    <div className="flex flex-col w-full overflow-hidden items-center">
                        {[...Array<number>(10)].map((_, idx) => {
                            return <PostSkeleton key={`loading-${idx}`} />;
                        })}
                    </div>
                )}
            </div>
        </Layout>
    );
}

/* function AuthShowcase() {
    const { data: sessionData } = useSession();

    const { data: secretMessage } = api.example.getSecretMessage.useQuery(
        undefined, // no input
        { enabled: sessionData?.user !== undefined },
    );

    return (
        <div className="flex flex-col items-center justify-center gap-4">
            <p className="text-center text-2xl text-white">
                {sessionData && (
                    <span>Logged in as {sessionData.user?.name}</span>
                )}
                {secretMessage && <span> - {secretMessage}</span>}
            </p>
            <button
                className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
                onClick={
                    sessionData ? () => void signOut() : () => void signIn()
                }
            >
                {sessionData ? "Sign out" : "Sign in"}
            </button>
        </div>
    );
} */
