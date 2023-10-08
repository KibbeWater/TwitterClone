import type { Notification } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

import {
    AtSymbolIcon as AtSolid,
    HeartIcon as HeartSolid,
    ArrowUturnRightIcon as RepeatSolid,
    UserIcon as UserSolid,
    XMarkIcon as XMarkSolid,
} from "@heroicons/react/24/solid";

import PostComponent from "~/components/Post/Post";
import PostSkeleton from "~/components/Skeletons/PostSkeleton";

import { api } from "~/utils/api";

export default function Notification({
    notif,
}: {
    notif: Notification & {
        targets: {
            id: string;
            name: string | null;
            tag: string | null;
            image: string | null;
        }[];
    };
}) {
    const { targets, type } = notif;

    const { data: post } = api.post.getPost.useQuery(
        { id: notif.value },
        {
            enabled:
                notif.type == "reply" ||
                notif.type == "mention" ||
                notif.type == "like",
        },
    );

    const targetsRef = useRef<HTMLDivElement>(null);

    let title = <></>;
    /* let content = <></>; */

    switch (type) {
        case "follow":
            title = (
                <p className="text-black dark:text-white">
                    <span className="font-bold">{targets[0]?.name}</span>
                    {targets.length > 1
                        ? ` and ${targets.length - 1} other${
                              targets.length - 2 > 0 ? "s" : ""
                          }`
                        : ""}{" "}
                    followed you
                </p>
            );
            break;
        case "like":
            title = (
                <>
                    <p className="text-black dark:text-white">
                        <span className="font-bold">{targets[0]?.name}</span>
                        {targets.length > 1
                            ? ` and ${targets.length - 1} other${
                                  targets.length - 2 > 0 ? "s" : ""
                              }`
                            : ""}{" "}
                        liked your <Link href={`/post/${post?.id}`}>post</Link>
                    </p>
                    <p className="text-gray-500 mt-1">{post?.content}</p>
                </>
            );
            break;
        default:
            break;
    }

    const left = (() => {
        const spacing = 8;
        const oWidth = 28;
        const totalWidth = spacing + oWidth;
        /* const left = targetsRef.current?.clientWidth */

        const tCount = targets.length * oWidth + (targets.length - 1) * spacing;
        const offset =
            (targetsRef.current?.clientWidth ?? 0) -
            (tCount + totalWidth + spacing);
        console.log(targetsRef.current?.clientWidth, offset);
        if (offset > 0) return totalWidth;

        const left = oWidth + spacing - (offset * -1) / targets.length;

        return Math.min(left, 14);
    })();

    if (notif.type == "reply" || notif.type == "mention") {
        if (!post) return <PostSkeleton />;
        else return <PostComponent post={post} />;
    }

    const Icon =
        type == "follow"
            ? UserSolid
            : type == "like"
            ? HeartSolid
            : type == "mention"
            ? AtSolid
            : type == "repost"
            ? RepeatSolid
            : XMarkSolid;

    return (
        <div className={`w-full flex px-4 py-2`}>
            <div className="h-full justify-end mt-1">
                <Icon
                    className={
                        type == "follow"
                            ? "text-red-500"
                            : type == "like"
                            ? "text-red-500"
                            : type == "mention"
                            ? "text-sky-500"
                            : "text-green-500"
                    }
                />
            </div>
            <div className="flex flex-col justify-center w-full ml-4">
                <div ref={targetsRef} className="relative w-full h-7 mb-1">
                    {targets.map((t, i) => (
                        <div
                            key={`t-${notif.id}-${i}`}
                            className={`absolute border-white dark:border-black border-2 box-content top-0 bottom-0 h-7 w-7 rounded-full overflow-hidden`}
                            style={{ zIndex: i + 1, left: i * left }}
                        >
                            <Image
                                src={
                                    t.image ?? "/assets/imgs/default-avatar.png"
                                }
                                alt="Avatar"
                                fill
                                sizes="100vw"
                                quality={10}
                            />
                        </div>
                    ))}
                </div>
                {title}
            </div>
        </div>
    );
}
