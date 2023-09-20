import type { Post } from "@prisma/client";
import { signIn } from "next-auth/react";
import { useState } from "react";

import { useModal } from "~/components/Handlers/ModalHandler";
import PostComponent from "~/components/Post/Post";
import PostComposer from "~/components/Post/PostComposer";
import Layout from "~/components/Site/Layout";

import { api } from "~/utils/api";

export default function Home() {
    const [page, setPage] = useState(0);
    const [text, setText] = useState("");

    const { modal } = useModal();

    // TODO: We can use React Query's useInfiniteQuery to create the feed
    const { data, fetchNextPage } = api.post.getPage.useInfiniteQuery(
        {},
        {
            getNextPageParam: (lastPage) => lastPage.nextCursor,
        },
    );
    const { mutate: createPost } = api.post.create.useMutation();

    const handleFetchNextPage = async () => {
        await fetchNextPage();
        setPage((prev) => prev + 1);
    };

    const handleFetchPreviousPage = () => {
        setPage((prev) => prev - 1);
    };

    // data will be split in pages
    const posts =
        data?.pages.reduce(
            (acc, cur) => [...acc, ...cur.items],
            [] as Post[],
        ) ?? [];

    return (
        <Layout title="Home">
            {/* <div className="flex w-full h-32">
                <input
                    type="text"
                    className="w-full h-full"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />
                <button
                    onClick={() => {
                        createPost({ content: text });
                    }}
                >
                    Send
                </button>
            </div> */}
            <div className="py-4 px-6 border-b-[1px] border-gray-200 dark:border-gray-700">
                <PostComposer />
            </div>
            {/* <div>
                <p>{`Active modal: ${!!modal}`}</p>
                <button
                    className="px-2 py-px bg-blue-600 hover:bg-blue-800 transition-all duration-300 text-white rounded-md"
                    onClick={() => {
                        signIn()
                            .then((res) => {
                                console.log(res);
                            })
                            .catch((err) => {
                                console.log(err);
                            });
                    }}
                >
                    Sign in
                </button>
            </div> */}
            <div className="flex flex-col w-full overflow-hidden items-center pb-14">
                {posts.map((post) => (
                    <div
                        key={post.id}
                        className="border-b-[1px] border-gray-200 dark:border-gray-700 w-full"
                    >
                        <PostComponent post={post} />
                    </div>
                    /* <p key={post.id}>{`${post.userId}: ${post.content}`}</p> */
                ))}
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
