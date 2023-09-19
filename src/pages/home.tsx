import { signIn } from "next-auth/react";
import { useState } from "react";
import { useModal } from "~/components/Handlers/ModalHandler";
import Layout from "~/components/Site/Layout";

import { api } from "~/utils/api";

export default function Home() {
    const { modal, setModal } = useModal();
    const [text, setText] = useState("");

    // TODO: We can use React Query's useInfiniteQuery to create the feed
    const { data } = api.post.getPage.useQuery({ page: 1 });
    const { mutate: createPost } = api.post.create.useMutation();

    const posts = data?.posts ?? [];

    return (
        <Layout title="Home">
            <div className="flex w-full h-32">
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
            </div>
            <div>
                <p>{`Active modal: ${!!modal}`}</p>
                <button
                    onClick={() => {
                        /* if (modal) setModal(null);
                        else setModal(<Login />); */
                        signIn()
                            .then((res) => {
                                console.log(res);
                            })
                            .catch((err) => {
                                console.log(err);
                            });
                    }}
                >
                    Toggle Login Modal
                </button>
                {/* <button
                    onClick={() => {
                        signIn(p);
                    }}
                >
                    Sign In
                </button> */}
            </div>
            <div className="flex flex-col w-full overflow-hidden items-center pb-14">
                {posts.map((post) => (
                    <p key={post.id}>{`${post.userId}: ${post.content}`}</p>
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
