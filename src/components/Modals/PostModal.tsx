import { XMarkIcon } from "@heroicons/react/20/solid";
import type { Post } from "@prisma/client";

import { useModal } from "../Handlers/ModalHandler";
import PostComposer from "../Post/PostComposer";
import { useRouter } from "next/router";
import { useCallback } from "react";

export default function PostModal({
    quote,
    onPost,
}: {
    quote?: Post;
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
                "bg-white dark:bg-black w-[45%] rounded-xl flex flex-col"
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
                <PostComposer quote={quote} onPost={handleOnPost} />
            </div>
        </div>
    );
}
