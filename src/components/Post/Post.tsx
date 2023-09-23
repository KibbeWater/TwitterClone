import type { Post } from "@prisma/client";
import { useRouter } from "next/router";
import { useCallback } from "react";

import Image from "next/image";
import VerifiedCheck from "../Verified";
import PostContent from "./PostContent";
import PostFooter from "./PostFooter";

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
}) {
    const { isRef, mini, onMutate } = p;
    const post = p.post as Post & {
        user: {
            id: string;
            tag: string;
            name: string;
            image: string;
            verified: boolean;
        };
        quote: Post;
    };

    const router = useRouter();

    const user = post.user;
    const avatar = user.image || "/assets/imgs/default-avatar.png";

    const images = post.images;

    const handleMutation = useCallback(
        (post: Post) => {
            if (onMutate) {
                onMutate?.(post);
                return true;
            } else return false;
        },
        [onMutate],
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
            {/* !isRef ? (
                <div className="absolute w-7 h-7 right-2 top-2">
                    <div
                        className="w-7 h-7 rounded-full hover:bg-black/20 flex justify-center items-center"
                        onClick={() => setOptionsActive((prev) => !prev)}
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
                            Animate using clip to slowly reveal
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
                                        CreateRelationship(
                                            user._id.toString(),
                                            isFollowing ? "remove" : "follow",
                                        )
                                            .then(() => {
                                                setLoading(false);
                                                if (mutateMe) mutateMe();
                                            })
                                            .catch(() => {
                                                setLoading(false);
                                                setIsFollowing(curFollowing);
                                            });
                                    }}
                                >
                                    <p className="text-black dark:text-white font-semibold leading-none">
                                        <span className="mr-1">
                                            <FontAwesomeSvgIcon
                                                icon={faUser}
                                                className={
                                                    "text-black dark:text-white"
                                                }
                                            />
                                        </span>{" "}
                                        {!isFollowing
                                            ? `Follow @${user.username}`
                                            : `Unfollow @${user.username}`}
                                    </p>
                                </button>
                            ) : null}
                            {isMe || isAdmin ? (
                                <button
                                    disabled={loading || !optionsActive}
                                    className="w-full px-6 py-2 text-center enabled:hover:bg-black/5 enabled:cursor-pointer transition-colors grow-0"
                                    onClick={() => {
                                        setLoading(true);
                                        DeletePost(post._id.toString())
                                            .then(() => {
                                                if (onMutate) onMutate(post);
                                            })
                                            .catch((err) => {
                                                alert(err);
                                                setLoading(false);
                                            });
                                    }}
                                >
                                    <p className="text-red-500 font-semibold leading-none">
                                        <span className="mr-1">
                                            <FontAwesomeSvgIcon
                                                icon={faTrash}
                                                color={"red"}
                                            />
                                        </span>{" "}
                                        Delete Post
                                    </p>
                                </button>
                            ) : null}
                        </motion.div>
                    </LazyMotionWrapper>
                </div>
            ) : null */}
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
                                        /* loader={fullCDNImageLoader} */
                                        quality={70}
                                        priority={true}
                                        /* onClick={() => {
                                            if (setModal)
                                                setModal(
                                                    <ImageModal
                                                        src={img}
                                                        post={post}
                                                    />,
                                                );
                                        }} */
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
