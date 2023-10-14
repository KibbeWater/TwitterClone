import {
    ArrowPathIcon,
    EllipsisHorizontalIcon,
} from "@heroicons/react/24/solid";
import type { Post } from "@prisma/client";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMemo } from "react";

import { useModal } from "~/components/Handlers/ModalHandler";
import ImageModal from "~/components/Modals/ImageModal";
import PostComponent from "~/components/Post/Post";
import PostComments from "~/components/Post/PostComments";
import PostContent from "~/components/Post/PostContent";
import PostFooter from "~/components/Post/PostFooter";
import Layout from "~/components/Site/Layouts/Layout";
import VerifiedCheck from "~/components/Verified";

import { api } from "~/utils/api";

function PostThreadSeparator({ isSmall }: { isSmall?: boolean }) {
    return isSmall ? (
        <div className="flex flex-col px-3 pb-3">
            <div className="w-1 h-7 rounded-lg bg-neutral-200 dark:bg-neutral-900 ml-5"></div>
            <div className="w-1 h-4 rounded-full bg-neutral-200 dark:bg-neutral-900 ml-5 my-2"></div>
            <div className="w-1 h-2 rounded-full bg-neutral-200 dark:bg-neutral-900 ml-5"></div>
        </div>
    ) : (
        <div className="flex flex-col px-3">
            <div className="w-1 h-9 rounded-lg bg-neutral-200 dark:bg-neutral-900 ml-5"></div>
        </div>
    );
}

export default function Page() {
    const postId = useRouter().query.id as string;

    const { data: post } = api.post.getPost.useQuery({ id: postId });

    const { setModal } = useModal();
    const { data: session } = useSession();

    const user = post?.user;
    const quote = post?.quote;
    const images = post?.images ?? [];

    const parents = useMemo(() => {
        const parents = [];
        let parent: Post & { parent: Post | null } = post?.parent as Post & {
            parent: Post | null;
        };
        while (parent) {
            parents.push(parent);
            parent = parent.parent as Post & { parent: Post | null };
        }
        return parents.reverse();
    }, [post?.parent]);

    if (!post || !user)
        return (
            <Layout title="Loading...">
                <div className="flex justify-center items-center my-5">
                    <p className="text-black dark:text-white">Loading...</p>{" "}
                    <ArrowPathIcon
                        className={
                            "animate-spin ml-3 h-[1.5em] text-black dark:text-white"
                        }
                    />
                </div>
            </Layout>
        );

    return (
        <Layout title="Twaat">
            {parents.map((parent, idx, arr) => (
                <>
                    <PostComponent post={parent} isRef={true} />
                    <PostThreadSeparator isSmall={idx + 1 >= arr.length} />
                </>
            ))}
            <div
                className={`flex flex-col ${parents.length <= 0 ? "mt-3" : ""}`}
            >
                <div className="flex justify-between mx-3">
                    <div className="flex">
                        <div className="relative h-12 w-12">
                            <Link
                                href={"/@" + user.tag}
                                className="absolute h-12 w-12"
                            >
                                <Image
                                    src={
                                        user.image ??
                                        "/assets/imgs/default-avatar.png"
                                    }
                                    alt={"Author's Avatar"}
                                    fill
                                    priority
                                    sizes={"100vw"}
                                    className="rounded-full object-cover cursor-pointer transition-opacity hover:opacity-80"
                                />
                            </Link>
                        </div>
                        <div className="flex items-center">
                            <div className="flex flex-col ml-3 ">
                                <Link
                                    href={`/@${user.tag}`}
                                    className="text-base truncate mb-1 leading-none font-semibold m-0 text-black dark:text-white flex"
                                >
                                    {user?.name}
                                    {user.verified ? <VerifiedCheck /> : null}
                                </Link>
                                <Link
                                    href={`/@${user.tag}`}
                                    className="text-gray-500 truncate mb-1 leading-none text-base m-0"
                                >
                                    @{user.tag}
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className="group/postMenu bg-red-500/0 hover:bg-red-500/30 hover:cursor-pointer w-8 h-8 rounded-full flex justify-center items-center">
                            <EllipsisHorizontalIcon
                                className={
                                    "group-hover/postMenu:text-accent-primary-500 text-black"
                                }
                            />
                        </div>
                    </div>
                </div>
                <div className="mx-3 mt-2">
                    <PostContent post={post} />
                    {images.length > 0 && (
                        <div
                            className="w-full aspect-[5/3] mt-2 cursor-pointer grid grid-cols-2 rounded-xl overflow-hidden gap-[2px] justify-self-center border-[1px] border-gray-200 dark:border-gray-700"
                            style={{
                                display: images.length !== 0 ? "grid" : "none",
                            }}
                        >
                            {images.map((img, i) => (
                                <div
                                    key={`post-${post.id}-image-${i}`}
                                    className={
                                        "w-full h-full relative" +
                                        (images.length == 1 ||
                                        (images.length == 3 && i == 0)
                                            ? " row-span-2"
                                            : "") +
                                        (images.length == 1
                                            ? " col-span-2"
                                            : "")
                                    }
                                >
                                    <Image
                                        src={img}
                                        className={"object-cover w-full h-full"}
                                        alt={`Album image ${i}`}
                                        sizes={"100vw"}
                                        quality={100}
                                        fill
                                        onClick={() => {
                                            setModal(
                                                <ImageModal
                                                    src={img}
                                                    post={post}
                                                />,
                                                {
                                                    bgOverride:
                                                        "rgba(0, 0, 0, 0.7)",
                                                },
                                            );
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                    {quote ? (
                        <div
                            className={
                                "group/quote mt-1 pl-1 rounded-md border-[1px] border-gray-700 transition-colors bg-black/0 hover:bg-gray-500/10"
                            }
                        >
                            <PostComponent
                                post={quote}
                                isRef={true}
                                mini={true}
                            />
                        </div>
                    ) : null}
                </div>
                <div>
                    <div className="flex justify-between mx-3 mt-3">
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
                    <div className="h-px grow mx-3 my-3 bg-gray-200 dark:bg-gray-700" />
                    <div className="mx-3 flex items-center">
                        <p className="text-sm ml-1 mr-4 text-gray-500 ">
                            <span className="font-semibold text-black dark:text-white">
                                {post.reposts.length}
                            </span>{" "}
                            Retwaats
                        </p>
                        <p className="text-sm ml-1 mr-4 text-gray-500">
                            <span className="font-semibold text-black dark:text-white">
                                {post.likeIDs.length}
                            </span>{" "}
                            Likes
                        </p>
                    </div>
                    {session && (
                        <>
                            <div className="h-px grow mx-3 my-3 bg-gray-200 dark:bg-gray-700" />
                            <PostFooter post={post} />
                            <div className="h-px grow mx-3 my-3 bg-gray-200 dark:bg-gray-700" />
                        </>
                    )}
                </div>
                <PostComments post={post} />
            </div>
        </Layout>
    );
}
