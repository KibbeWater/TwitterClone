import { XMarkIcon } from "@heroicons/react/20/solid";
import { useRouter } from "next/router";
import { useCallback } from "react";

import { useModal } from "~/components/Handlers/ModalHandler";
import PostComposer from "~/components/Post/PostComposer";
import type { PostComponentShape } from "~/components/Post/Post";

type Post = {
    id: string;
};

export default function PostModal({
    quote,
    parent,
    onPost,
}: {
    quote?: PostComponentShape;
    parent?: Post;
    onPost?: (post: PostComponentShape) => boolean;
}) {
    const { reload } = useRouter();
    const { closeModal } = useModal();

    const handleOnPost = useCallback(
        (post: PostComponentShape) => {
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
