import { EllipsisHorizontalIcon, UserIcon } from "@heroicons/react/24/solid";
import type { Post } from "@prisma/client";
import { m as motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/router";
import { useCallback, useState, useEffect } from "react";

import { useModal } from "../Handlers/ModalHandler";
import { LazyMotionWrapper } from "../LazyMotionWrapper";
import ImageModal from "../Modals/ImageModal";
import VerifiedCheck from "../Verified";
import PostContent from "./PostContent";
import PostFooter from "./PostFooter";
import { useSession } from "next-auth/react";
import { api } from "~/utils/api";
import { TrashIcon } from "@heroicons/react/24/outline";

function isUserFollowing(
    user: { id: string } | undefined,
    profile: { followerIds: string[] } | undefined,
) {
    if (!user || !profile) return false;
    return profile.followerIds.find((u) => u === user.id) !== undefined;
}

function FormatDate(date: Date) {
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 10) return "Now";
    else if (diff < 60000) return Math.floor(diff / 1000) + "s";
    else if (diff < 3600000) return Math.floor(diff / 60000) + "m";
    else if (diff < 86400000) return Math.floor(diff / 3600000) + "h";
    else if (diff < 31536000000)
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        });
    else
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
}

export default function PostComponent(p: {
    post: Post;
    isRef?: boolean;
    mini?: boolean;
    onMutate?: (post: Post) => void;
    onDeleted?: () => void;
}) {
    const [optionsActive, setOptionsActive] = useState(false);
    const [loading, setLoading] = useState(false);

    const { data: session } = useSession();

    const { mutate: _setFollowing } = api.followers.setFollowing.useMutation();
    const { mutate: _deletePost } = api.post.delete.useMutation();

    const { isRef, mini, onMutate, onDeleted } = p;
    const post = p.post as Post & {
        user: {
            id: string;
            tag: string;
            name: string;
            image: string;
            verified: boolean;
            followerIds: string[];
        };
        reposts: { id: string }[];
        quote: Post;
    };

    const router = useRouter();
    const { setModal } = useModal();

    const user = post.user;
    const avatar = user.image || "/assets/imgs/default-avatar.png";

    const images = post.images;

    const isMe =
        post.user.id === session?.user.id && session?.user !== undefined;

    const handleMutation = useCallback(
        (post: Post) => {
            if (onMutate) {
                onMutate?.(post);
                return true;
            } else return false;
        },
        [onMutate],
    );

    const [isFollowing, setIsFollowing] = useState(
        isUserFollowing(session?.user, post.user),
    );

    useEffect(() => {
        setIsFollowing(isUserFollowing(user, post.user));
    }, [user, post]);

    const setFollowing = useCallback(
        (shouldFollow: boolean) => {
            if (!post?.user) return;

            const oldFollow = isFollowing;
            setIsFollowing(shouldFollow);

            _setFollowing(
                { id: post.user.id, shouldFollow },
                {
                    onSuccess: () => setIsFollowing(shouldFollow),
                    onError: () => setIsFollowing(oldFollow),
                },
            );
        },
        [post, _setFollowing, isFollowing],
    );

    return (
        <div
            className={`p-3 mb-px w-full max-w-full relative bg-transparent transition-all cursor-pointer flex hover:bg-gray-500/5 ${
                isRef ? "!border-0 !bg-transparent hover:!bg-transparent" : ""
            }`}
            onClick={(e) => {
                e.stopPropagation();
                router.push(`/post/${post.id}`).catch(console.error);
            }}
        >
            {!isRef ? (
                <div className="absolute w-7 h-7 right-2 top-2">
                    <div
                        className="w-7 h-7 rounded-full hover:bg-black/20 flex justify-center items-center"
                        onClick={(e) => {
                            e.stopPropagation();
                            setOptionsActive((prev) => !prev);
                        }}
                    >
                        <EllipsisHorizontalIcon
                            className={"text-black dark:text-white"}
                        />
                    </div>

                    <LazyMotionWrapper>
                        <motion.div
                            className={
                                "absolute top-7 right-0 w-max py-3 bg-gray-100 dark:bg-neutral-900 shadow-lg rounded-2xl cursor-default overflow-hidden z-20 flex flex-col"
                            }
                            onClick={(e) => e.stopPropagation()}
                            /* Animate using clip to slowly reveal */
                            initial={{ opacity: 0, maxHeight: 0 }}
                            variants={{
                                enter: { opacity: 1, maxHeight: 120 },
                                exit: { opacity: 0, maxHeight: 0 },
                            }}
                            animate={optionsActive ? "enter" : "exit"}
                            transition={{ duration: 0.3 }}
                        >
                            {!isMe ? (
                                <button
                                    disabled={loading || !optionsActive}
                                    className="w-full px-6 py-2 text-center enabled:hover:bg-black/5 enabled:cursor-pointer transition-colors"
                                    onClick={() => {
                                        setLoading(true);
                                        const curFollowing = isFollowing;
                                        setIsFollowing(!isFollowing);
                                        setFollowing(!curFollowing);
                                    }}
                                >
                                    <p className="text-black dark:text-white font-semibold leading-none flex items-center">
                                        <span className="mr-1">
                                            <UserIcon
                                                className={
                                                    "text-black dark:text-white h-5 w-5"
                                                }
                                            />
                                        </span>{" "}
                                        {!isFollowing
                                            ? `Follow @${user?.name}`
                                            : `Unfollow @${user?.name}`}
                                    </p>
                                </button>
                            ) : null}
                            {isMe || session?.user.role === "ADMIN" ? (
                                <button
                                    disabled={loading || !optionsActive}
                                    className="w-full px-6 py-2 text-center enabled:hover:bg-black/5 enabled:cursor-pointer transition-colors grow-0"
                                    onClick={() => {
                                        setLoading(true);
                                        _deletePost(
                                            { id: post.id },
                                            {
                                                onSuccess: () => onDeleted?.(),
                                                onError: (err) => alert(err),
                                            },
                                        );
                                    }}
                                >
                                    <p className="text-red-500 font-semibold leading-none whitespace-nowrap flex items-center">
                                        <span className="mr-1">
                                            <TrashIcon className="text-red-500 h-5 w-5" />
                                        </span>{" "}
                                        Delete Post
                                    </p>
                                </button>
                            ) : null}
                        </motion.div>
                    </LazyMotionWrapper>
                </div>
            ) : null}
            {!mini && (
                <div
                    className="w-12 h-12 relative shrink-0"
                    onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/@${user.tag}`).catch(console.error);
                    }}
                >
                    <div className="w-12 h-12 absolute">
                        <Image
                            className={
                                "w-full h-full rounded-full object-cover cursor-pointer transition-opacity hover:opacity-80"
                            }
                            src={avatar}
                            alt={`${user.tag}'s avatar`}
                            placeholder="blur"
                            blurDataURL="/assets/imgs/default-avatar.png"
                            quality={70}
                            width={48}
                            height={48}
                        />
                    </div>
                </div>
            )}
            <div
                className={`${
                    mini ? "" : "pl-3"
                } w-full flex flex-col overflow-hidden`}
            >
                <div
                    onClick={(e) => e.stopPropagation()}
                    className={
                        "max-w-full w-full pr-9 flex-nowrap flex overflow-hidden items-center"
                    }
                >
                    {mini && (
                        <Image
                            className={
                                "h-6 w-6 mr-1 rounded-full object-cover cursor-pointer transition-opacity hover:opacity-80"
                            }
                            src={avatar}
                            alt={`${user.tag}'s avatar`}
                            quality={20}
                            width={24}
                            height={24}
                        />
                    )}
                    <a
                        className={
                            "text-black dark:text-white " +
                            (!user.verified ? "mr-[5px] " : "") +
                            "cursor-pointer no-underline font-semibold hover:underline truncate max-w-full max-h-min items-center"
                        }
                        href={`/@${user.tag}`}
                    >
                        {user.name}
                    </a>

                    <a
                        className={
                            "ml-[2px] text-gray-500 no-underline flex items-center"
                        }
                        href={`/@${user.tag}`}
                    >
                        {user.verified ? (
                            <p className="mr-[5px] flex h-[1em] items-center">
                                <VerifiedCheck />
                            </p>
                        ) : null}
                        {`@${user.tag}`}
                        <span className="mx-[6px]">·</span>
                    </a>
                    <span
                        className={
                            "text-gray-500 hover:underline whitespace-nowrap"
                        }
                    >
                        {FormatDate(post.createdAt)}
                    </span>
                </div>
                <PostContent post={post} />
                <div
                    className="w-9/12 aspect-[5/3] mb-2 grid grid-cols-2 rounded-xl overflow-hidden gap-[2px] justify-self-center"
                    style={{
                        display: images.length !== 0 ? "grid" : "none",
                    }}
                    /* onClick={routeAggresive} */
                >
                    {images.map(
                        (img, i) =>
                            img && (
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
                                        src={img + "?format=webp"}
                                        className={"object-cover w-full h-full"}
                                        alt={`Album image ${i}`}
                                        sizes={"100vw"}
                                        fill
                                        quality={70}
                                        priority={true}
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
                            ),
                    )}
                </div>
                {/* <div
                    className="w-9/12 aspect-video relative grid grid-cols-2 rounded-xl overflow-hidden gap-[2px] justify-self-center border-[1px] border-gray-700"
                    style={{
                        display: videos.length !== 0 ? "block" : "none",
                    }}
                >
                    {memodVideos}
                </div> */}
                {!post.quoteId || isRef ? (
                    <></>
                ) : (
                    <div
                        className={
                            "group/quote mt-1 pl-1 rounded-md border-[1px] border-gray-700 transition-colors bg-black/0 hover:bg-gray-500/10 w-full"
                        }
                    >
                        <PostComponent
                            post={post.quote}
                            isRef={true}
                            mini={true}
                        />
                    </div>
                )}
                {isRef ?? <PostFooter post={post} onPost={handleMutation} />}
            </div>
        </div>
    );
}
