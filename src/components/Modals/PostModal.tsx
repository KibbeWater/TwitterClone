import { XMarkIcon } from "@heroicons/react/20/solid";
import type { Post as _PostType } from "@prisma/client";
import { useRouter } from "next/router";
import { useCallback } from "react";

import { useModal } from "~/components/Handlers/ModalHandler";
import PostComposer from "~/components/Post/PostComposer";

type User = {
    id: string;
    name: string | null;
    tag: string | null;
    permissions: string;
    roles: {
        id: string;
        permissions: string;
    }[];
    verified: boolean | null;
    image: string | null;
    followerIds: string[];
    followingIds: string[];
};

type Post = _PostType & {
    user: User;
    quote:
        | (_PostType & {
              user: User;
              quote: null;
              reposts: { id: string; user: User }[];
          })
        | null;
    reposts: { id: string; user: User }[];
};

export default function PostModal({
    quote,
    parent,
    onPost,
}: {
    quote?: Post;
    parent?: Post;
    onPost?: (post: Post) => boolean;
}) {
    const { reload } = useRouter();
    const { closeModal } = useModal();

    const handleOnPost = useCallback(
        (post: Post) => {
            if (onPost?.(post) === false || onPost === undefined) reload();
            closeModal();
        },
        [onPost, reload, closeModal],
    );

    return (
        <div
            className={
                "bg-white dark:bg-black lg:w-[35%] md:w-1/3 w-5/6 rounded-xl flex flex-col"
            }
        >
            <div className={"h-10 p-1 flex justify-end"}>
                <div
                    className={
                        "w-8 h-8 rounded-full flex items-center justify-center bg-black/0 hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer"
                    }
                    onClick={() => closeModal()}
                >
                    <XMarkIcon className={"text-black dark:text-white"} />
                </div>
            </div>
            <div className={"grow flex break-words px-4 pb-[10px]"}>
                <PostComposer
                    quote={quote}
                    parent={parent?.id}
                    onPost={handleOnPost}
                />
            </div>
        </div>
    );
}
