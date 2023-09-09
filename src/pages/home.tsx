import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import Layout from "~/components/Site/Layout";

import { api } from "~/utils/api";

export default function Home() {
    return (
        <Layout title="Home">
            <div className="flex flex-col w-full overflow-hidden items-center pb-14">
                {posts.length !== 0 ? (
                    posts.map((post) =>
                        post ? (
                            <Post
                                key={post._id as unknown as string}
                                post={post}
                                onMutate={() => mutate()}
                            />
                        ) : null,
                    )
                ) : (
                    <div className="flex flex-col w-full overflow-hidden items-center">
                        {[...Array(10)].map((_, idx) => {
                            return <PostSkeleton key={`loading-${idx}`} />;
                        })}
                    </div>
                )}
                <div
                    className={
                        "w-full mt-4 flex justify-center items-center" +
                        (!isValidating ? " invisible" : " visible")
                    }
                    ref={loadingRef}
                >
                    <FontAwesomeSvgIcon
                        icon={faSpinner}
                        size={"2x"}
                        className={"animate-spin text-black dark:text-white"}
                    />
                </div>
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
