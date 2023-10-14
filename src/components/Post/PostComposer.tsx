import { PhotoIcon } from "@heroicons/react/20/solid";
import { XMarkIcon } from "@heroicons/react/24/solid";
import type { Post } from "@prisma/client";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { useImageUploader } from "~/components/Hooks/ImageUpload";
import PostTextarea from "~/components/Post/PostTextarea";
import PostComponent from "./Post";

import { api } from "~/utils/api";

type Props = {
    placeholder?: string;
    btnText?: string;
    onPost?: (post: Post) => void;
    children?: React.ReactNode;
    inline?: boolean;
    avatarSize?: number;
    padding?: number;
    quote?: Post;
    parent?: string;
};

export default function PostComposer({
    onPost,
    placeholder,
    btnText,
    children,
    inline,
    avatarSize = 48,
    padding,
    quote,
    parent,
}: Props) {
    const [text, setText] = useState("");
    const [tempDisabled, setTempDisabled] = useState(false);
    const [images, setImages] = useState<{ file: File; uri: string }[]>([]);

    const { mutate: _sendPost, isLoading } = api.post.create.useMutation({
        onSuccess: (post) => {
            onPost?.(post); // There is nothing I love more than this GOOFY ASS javascript syntax
            setText("");
            setImages([]);
        },
        onError: () => setTempDisabled(true),
    });

    const { uploadImage, rules } = useImageUploader();
    const { sizes: maxSizes, types } = rules;

    const { data: session } = useSession();
    const user = session?.user;

    const selectImageRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const btnPostClick = () => {
        if (isLoading) return;
        (async () => {
            let urls: string[] = [];
            for (const img of images) {
                console.log(`Uploading image nr smth`);
                const url = await uploadImage(img.file, "image");
                console.log(`Finished Uploading image nr smth`);
                urls = [...urls, url];
            }
            return urls;
        })()
            .then((urls) => {
                _sendPost({
                    content: text,
                    parent,
                    quote: quote?.id,
                    images: urls,
                });
            })
            .catch((error) => console.error(error));
    };

    const receiveTextUpdate = useCallback<(t: string) => void>(
        (t) => setText(t),
        [],
    );

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (images.length >= 4) return alert("You can only upload 4 images!");

        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.size > maxSizes.image)
                return alert(
                    "The max upload size is " + maxSizes.image / 1048576,
                );

            if (!types.includes(selectedFile.type))
                return alert("Only images allowed!!");

            const reader = new FileReader();
            reader.onload = () => {
                const buf = Buffer.from(reader.result as ArrayBuffer);
                setImages((a) => [
                    ...a,
                    {
                        file: selectedFile,
                        uri: `data:image/png;base64,${buf.toString("base64")}`,
                    },
                ]);
            };
            reader.readAsArrayBuffer(selectedFile);
        }
    };

    useEffect(() => {
        setTempDisabled(false);
    }, [text]);

    useEffect(() => {
        const ev = (e: ClipboardEvent) => {
            console.log(images);
            if (document.activeElement !== textareaRef.current) return;
            if (images.length >= 4)
                return alert("You can only upload 4 images!");

            const items = e.clipboardData?.items;
            if (items) {
                for (const item of items) {
                    if (item.kind === "file") {
                        const file = item.getAsFile();
                        if (file) {
                            if (file.size > maxSizes.image)
                                return alert(
                                    "The max upload size is " +
                                        maxSizes.image / 1048576,
                                );

                            if (!types.includes(file.type))
                                return alert("Only images allowed!!");

                            const reader = new FileReader();
                            reader.onload = () => {
                                const buf = Buffer.from(
                                    reader.result as ArrayBuffer,
                                );
                                setImages((a) => [
                                    ...a,
                                    {
                                        file,
                                        uri: `data:image/png;base64,${buf.toString(
                                            "base64",
                                        )}`,
                                    },
                                ]);
                            };
                            reader.readAsArrayBuffer(file);
                        }
                    }
                }
            }
        };

        document.addEventListener("paste", ev);

        return () => {
            document.removeEventListener("paste", ev);
        };
    }, [maxSizes.image, types, images]);

    if (!user) return null;

    return (
        <div className="flex flex-col w-full">
            <div
                className="flex w-full bg-white dark:bg-black relative z-10"
                style={{ paddingInline: padding }}
            >
                <div
                    className="relative"
                    style={{ width: avatarSize, height: avatarSize }}
                >
                    <div
                        className="absolute"
                        style={{ width: avatarSize, height: avatarSize }}
                    >
                        <Image
                            className="object-cover rounded-full w-full h-full"
                            src={
                                user.image ?? "/assets/imgs/default-avatar.png"
                            }
                            alt={`${user.name}'s Avatar`}
                            sizes="100vw"
                            fill
                            priority
                        />
                    </div>
                </div>

                <div
                    className="flex flex-col pl-5 pr-1 w-full"
                    style={{ marginTop: inline ? 12 : 0 }}
                >
                    <PostTextarea
                        placeholder={placeholder ?? "What's happening?"}
                        inline={inline}
                        value={text}
                        onChange={receiveTextUpdate}
                        ref={textareaRef}
                    />
                    {quote ? (
                        <div
                            className={
                                "group/quote mt-1 pl-1 rounded-md border-[1px] border-gray-500 transition-colors bg-black/0 hover:bg-black/10"
                            }
                        >
                            <PostComponent
                                post={quote}
                                isRef={true}
                                mini={true}
                            />
                        </div>
                    ) : (
                        <></>
                    )}
                    {images.length > 0 && (
                        <div
                            className={
                                "grid grid-cols-2 gap-1 mt-3 b-1 aspect-[5/3]"
                            }
                        >
                            {images.map((img, i) => (
                                <div
                                    key={`post-image-${i}`}
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
                                        src={img.uri}
                                        className={
                                            "object-cover w-full h-full rounded-xl"
                                        }
                                        alt={`Album image ${i}`}
                                        sizes={"100vw"}
                                        fill
                                    />
                                    <div
                                        className={
                                            "absolute top-2 right-2 z-10 w-7 h-7 flex justify-center items-center rounded-full" +
                                            " backdrop-blur-md bg-neutral-900/60 hover:bg-neutral-700/40 transition-colors cursor-pointer p-1"
                                        }
                                        onClick={() =>
                                            setImages((prev) =>
                                                prev.filter((_, j) => j !== i),
                                            )
                                        }
                                    >
                                        <XMarkIcon className="text-white" />
                                    </div>
                                    <button
                                        className={
                                            "absolute bottom-2 right-2 z-10 px-4 text-sm font-bold h-7 flex justify-center items-center rounded-full" +
                                            " backdrop-blur-md bg-neutral-900/60 hover:bg-neutral-700/40 transition-colors cursor-pointer p-1 text-white"
                                        }
                                    >
                                        Edit
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    {!inline ? (
                        <div className="h-px w-full mt-3 opacity-50 bg-gray-500" />
                    ) : null}
                    <div className="flex justify-between items-center mt-2 h-min">
                        <div
                            onClick={() => selectImageRef.current?.click()}
                            className="flex items-center justify-center w-10 h-10 rounded-full transition-colors text-red-500 bg-accent-primary-500/0 hover:bg-accent-primary-500/20 hover:cursor-pointer"
                        >
                            <PhotoIcon className="m-2" />
                            <input
                                type="file"
                                multiple={false}
                                ref={selectImageRef}
                                accept={types.join(",")}
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </div>
                        <div>
                            <button
                                className={
                                    "py-[6px] px-4 rounded-full border-0 bg-accent-primary-500 text-white cursor-pointer text-md font-bold transition-colors " +
                                    "disabled:bg-red-800 disabled:text-gray-200 disabled:cursor-default transition-all duration-300"
                                }
                                onClick={btnPostClick}
                                disabled={!text || isLoading || tempDisabled}
                            >
                                {btnText ?? "Twaat"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {children}
        </div>
    );
}
