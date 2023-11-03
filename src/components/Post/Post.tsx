import { TrashIcon } from "@heroicons/react/24/outline";
import { EllipsisHorizontalIcon, UserIcon } from "@heroicons/react/24/solid";
import type { Post } from "@prisma/client";
import { m as motion } from "framer-motion";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";

import { useModal } from "~/components/Handlers/ModalHandler";
import { LazyMotionWrapper } from "~/components/LazyMotionWrapper";
import ImageModal from "~/components/Modals/ImageModal";
import PostContent from "~/components/Post/PostContent";
import PostFooter from "~/components/Post/PostFooter";
import VerifiedCheck from "~/components/Verified";

import { api } from "~/utils/api";
import { PERMISSIONS, hasPermission } from "~/utils/permission";
import { isPremium } from "~/utils/user";

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
    post: Post & {
        user: {
            id: string;
            tag: string;
            name: string;
            image: string;
            verified: boolean;
            followerIds: string[];
            permissions: string;
            roles: { id: string; permissions: string }[];
        };
        reposts: { id: string }[];
        quote?: Post & {
            user: {
                id: string;
                tag: string;
                name: string;
                image: string;
                verified: boolean;
                followerIds: string[];
                permissions: string;
                roles: { id: string; permissions: string }[];
            };
            reposts: { id: string }[];
        };
    };
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

    const { isRef, mini, onMutate, onDeleted, post } = p;

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
        setIsFollowing(isUserFollowing(session?.user, post.user));
    }, [session?.user, post]);

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
                    onSettled: () => setLoading(false),
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
                                        setIsFollowing(!curFollowing);
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
                                            ? `Follow @${user?.tag}`
                                            : `Unfollow @${user?.tag}`}
                                    </p>
                                </button>
                            ) : null}
                            {isMe ||
                            (session &&
                                hasPermission(
                                    session.user,
                                    PERMISSIONS.MANAGE_POSTS,
                                )) ? (
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
                            sizes="100vw"
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
                            sizes="100vw"
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
                        {user.verified &&
                        isPremium(user) &&
                        !hasPermission(user, PERMISSIONS.HIDE_VERIFICATION) ? (
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
                    className="w-9/12 aspect-[5/3] mb-2 grid grid-cols-2 rounded-xl overflow-hidden gap-[2px] justify-self-center border-[1px] border-highlight-light dark:border-highlight-dark"
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        display: images.length !== 0 ? "grid" : "none",
                    }}
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
                                        src={img}
                                        className={"object-cover w-full h-full"}
                                        alt={`Album image ${i}`}
                                        sizes="100vw"
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
                {!post.quote || isRef ? (
                    <></>
                ) : (
                    <div
                        className={
                            "group/quote mt-1 pl-1 rounded-xl border-[1px] border-highlight-light dark:border-highlight-dark transition-colors bg-black/0 hover:bg-gray-500/10 w-full"
                        }
                    >
                        <PostComponent
                            post={post.quote}
                            isRef={true}
                            mini={true}
                        />
                    </div>
                )}
                {!isRef && session && (
                    <PostFooter post={post} onPost={handleMutation} />
                )}
            </div>
        </div>
    );
}
