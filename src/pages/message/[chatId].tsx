import { PhotoIcon } from "@heroicons/react/24/outline";
import { PaperAirplaneIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useInView } from "react-intersection-observer";
import { useModal } from "~/components/Handlers/ModalHandler";

import { useImageUploader } from "~/components/Hooks/ImageUpload";
import ImageOnlyModal from "~/components/Modals/ImageOnlyModal";
import MessagesLayout from "~/components/Site/Layouts/MessagesLayout";

import { api, pusher } from "~/utils/api";

type DM = {
    message: string;
    image: string | null;
    id: string;
    createdAt: Date;
    userId: string;
    sender: {
        name: string | null;
        id: string;
        tag: string | null;
        image: string | null;
    };
};

type LocalDM = DM & {
    status?: "sending" | "sent" | "failed";
    error?: string;
};

export default function Message() {
    const [streamedMessages, setStreamedMessages] = useState<DM[]>([]);
    const [localMessages, setLocalMessages] = useState<LocalDM[]>([]);

    const [image, setImage] = useState<string | undefined | null>(undefined);
    const [imageFile, setImageFile] = useState<File | undefined>(undefined);

    const [text, setText] = useState<string>("");

    const router = useRouter();
    const chatId = router?.query.chatId as string;

    const { data: session } = useSession();
    const { setModal } = useModal();

    const { mutate: _sendChat, isLoading: isSendingChat } =
        api.chat.sendChatMessage.useMutation();

    const { data: chat } = api.chat.fetchChat.useQuery(
        { chatId },
        { enabled: !!chatId },
    );
    const {
        data,
        refetch: refetchMessages,
        fetchNextPage,
    } = api.chat.fetchMessages.useInfiniteQuery(
        {
            chatId,
        },
        {
            enabled: !!chatId,
            keepPreviousData: true,
            getNextPageParam: (lastPage) => lastPage.nextCursor,
        },
    );

    const { uploadImage, rules, isUploading } = useImageUploader();
    const { sizes: maxSizes, types } = rules;

    const {
        getRootProps: imageRProps,
        isDragActive: isImageActive,
        open: openFilePicker,
    } = useDropzone({
        multiple: false,
        maxSize: maxSizes?.chat ?? 20 * 1024 * 1024,
        noClick: true,
        accept: {
            "image/png": [".png"],
            "image/jpeg": [".jpg", ".jpeg"],
            "image/webp": [".webp"],
        },
        onDropAccepted: (files) => {
            const file = files[0];
            const reader = new FileReader();
            reader.onload = () => {
                const buf = Buffer.from(reader.result as ArrayBuffer);
                setImage(`data:image/png;base64,${buf.toString("base64")}`);
                setImageFile(file as File);
            };
            reader.readAsArrayBuffer(file!);
        },
    });

    const { ref: loadingRef, inView } = useInView();

    const inputRef = useRef<HTMLInputElement>(null);

    const handleFetchNextPage = useCallback(async () => {
        await fetchNextPage();
    }, [fetchNextPage]);

    const messages = useMemo(
        () =>
            data?.pages.reduce(
                (acc, cur) => [...acc, ...cur.items],
                [] as {
                    message: string;
                    image: string | null;
                    id: string;
                    createdAt: Date;
                    userId: string;
                    sender: {
                        name: string | null;
                        id: string;
                        tag: string | null;
                        image: string | null;
                    };
                }[],
            ) ?? [],
        [data?.pages],
    );

    useEffect(() => {
        setStreamedMessages([]);
        setLocalMessages([]);
    }, [messages]);

    useEffect(() => {
        if (inView) handleFetchNextPage().catch(console.error);
    }, [inView, handleFetchNextPage]);

    useEffect(() => {
        const channelName = `chat-${chatId}`;
        const channel = pusher.subscribe(channelName);

        channel.bind("new-message", (senderId: string) => {
            if (senderId !== session?.user.id)
                refetchMessages().catch(console.error);
        });

        return () => {
            channel.unbind("new-message");

            pusher.unsubscribe(channelName);
        };
    }, [chatId, refetchMessages, session?.user.id]);

    const msgs: LocalDM[] = [
        ...(messages ?? []),
        ...streamedMessages,
        ...localMessages,
    ]
        .sort(
            (a, b) =>
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime(),
        )
        .filter((msg, index, self) => {
            return index === self.findIndex((p) => p.id === msg.id);
        });

    const batchedMsgs = useMemo(() => {
        const batches: LocalDM[][] = [];
        msgs.forEach((msg) => {
            const lastBatch = batches[batches.length - 1] ?? [];
            const lastMsg = lastBatch[lastBatch.length - 1];

            const lastStatus = lastMsg?.status ?? "sent";
            const curStatus = msg.status ?? "sent";

            if (
                lastMsg &&
                new Date(msg.createdAt).getTime() -
                    new Date(lastMsg.createdAt).getTime() <
                    1000 * 60 * 5 &&
                lastMsg.userId === msg.userId &&
                lastStatus === curStatus
            )
                lastBatch.push(msg);
            else batches.push([msg]);
        });
        return batches;
    }, [msgs]);

    const sendChat = useCallback<(message: string) => void>(
        async (msg) => {
            if (!text && !image) return;
            if (!session?.user) return;

            const tempId = Math.random().toString(36).substr(2, 9);
            const tempChat: LocalDM = {
                id: tempId,
                createdAt: new Date(),
                image: image ?? null,
                status: "sending",
                userId: session.user.id,
                message: msg,
                sender: {
                    id: session.user.id,
                    name: session.user.name ?? null,
                    tag: session.user.tag,
                    image: session.user.image ?? null,
                },
            };

            setLocalMessages((prev) => [...prev, tempChat]);

            let img: string | null = null;
            if (imageFile) img = await uploadImage(imageFile, "chat");

            setText("");
            setImage(undefined);
            setImageFile(undefined);

            _sendChat(
                { chatId, message: msg, image: img ?? undefined },
                {
                    onSuccess(data) {
                        setLocalMessages((prev) =>
                            [...prev, data].filter((msg) => msg.id !== tempId),
                        );
                    },
                    onError(err) {
                        setLocalMessages((prev) =>
                            prev.map((msg) => {
                                if (msg.id === tempId)
                                    return {
                                        ...msg,
                                        status: "failed",
                                        error:
                                            err.data?.code ===
                                            "TOO_MANY_REQUESTS"
                                                ? "You are sending too many messages."
                                                : "Failed to send message",
                                    };
                                return msg;
                            }),
                        );
                    },
                },
            );
        },
        [_sendChat, imageFile, text, image, session?.user, chatId, uploadImage],
    );

    const isSender = useCallback<(msg: { userId: string }) => boolean>(
        (msg) => {
            if (!session?.user) return false;
            return msg.userId === session.user.id;
        },
        [session],
    );

    const getTimestamp = useCallback<(date: Date) => string>((timestamp) => {
        const date = new Date();

        const dte = date.getTime() - timestamp.getTime();

        // is today?
        const isWithing24Hours: boolean = dte / 1000 / 60 / 60 < 24;
        if (
            date.getFullYear() === timestamp.getFullYear() &&
            date.getMonth() === timestamp.getMonth() &&
            date.getDate() === timestamp.getDate()
        ) {
            // x:xx AM/PM
            return timestamp.toLocaleTimeString([], {
                hour: "numeric",
                minute: "numeric",
            });
        } else {
            if (isWithing24Hours)
                return `Yesterday, ${timestamp.toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "numeric",
                })}`;

            return timestamp.toLocaleDateString([], {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "numeric",
            });
        }
    }, []);

    const getChatName = (chat: {
        participants: { id: string; name: string | null; tag: string | null }[];
        name: string;
    }): string => {
        if (chat.participants.length > 2) return chat.name;

        const user = chat.participants.find(
            (participant) =>
                participant.id !== session?.user.id &&
                session?.user.id !== undefined,
        );

        return user?.name ?? session?.user.name ?? "Loading...";
    };

    useEffect(() => {
        const ev = (e: ClipboardEvent) => {
            if (document.activeElement !== inputRef.current) return;

            const items = e.clipboardData?.items;
            if (items) {
                for (const item of items) {
                    if (item.kind === "file") {
                        const file = item.getAsFile();

                        if (!file) return;
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
                            setImageFile(file);
                            setImage(
                                `data:image/png;base64,${buf.toString(
                                    "base64",
                                )}`,
                            );
                        };
                        reader.readAsArrayBuffer(file);
                    }
                }
            }
        };

        document.addEventListener("paste", ev);

        return () => {
            document.removeEventListener("paste", ev);
        };
    }, [maxSizes.image, types]);

    return (
        <MessagesLayout
            canBack={false}
            title={chat ? getChatName(chat) : "Loading..."}
            enableInfo
            handleInfoClick={() => {
                router.push(`/message/${chatId}/info`).catch(console.error);
            }}
        >
            <style jsx global>{`
                .dropzone-outline {
                    width: calc(100% - 4px);
                    height: calc(100% - 2px);
                }
            `}</style>
            <div
                {...imageRProps()}
                className={[
                    "flex flex-col-reverse overflow-hidden",
                    isImageActive
                        ? "outline-dashed outline-[2px] mx-[2px] mb-2 box-border outline-accent-primary-500 dropzone-outline"
                        : "w-full h-full",
                ].join(" ")}
            >
                <div className="flex-none py-2 flex px-2 gap-2 items-center border-t-[1px] border-highlight-light dark:border-highlight-dark">
                    <div className="flex flex-col gap-2 w-full items-center pl-2 bg-neutral-200 dark:bg-neutral-800 rounded-lg">
                        {image && (
                            <div className="flex h-36 pt-2 justify-start w-full">
                                <div className="h-full relative">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={image}
                                        alt="Uploaded image 1"
                                        className="h-full rounded-lg"
                                    />
                                    <div
                                        className={
                                            "absolute top-2 right-2 z-10 w-7 h-7 flex justify-center items-center rounded-full" +
                                            " backdrop-blur-md bg-neutral-900/60 hover:bg-neutral-700/40 transition-colors cursor-pointer p-1"
                                        }
                                        onClick={() => {
                                            if (isSendingChat || isUploading)
                                                return;
                                            setImage(undefined);
                                        }}
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
                            </div>
                        )}
                        <div className="flex w-full">
                            <div className="flex-none">
                                <button
                                    onClick={openFilePicker}
                                    className="h-6 w-6 p-1 my-1 text-accent-primary-500 hover:bg-accent-primary-500/30 rounded-full transition-colors"
                                >
                                    <PhotoIcon />
                                </button>
                            </div>
                            <form className="grow">
                                <input
                                    type="text"
                                    ref={inputRef}
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    placeholder="Start a new message"
                                    className="w-full rounded-md outline-none pl-3 py-1 text-sm bg-transparent"
                                />
                                <input
                                    type="submit"
                                    className="hidden"
                                    value="Send"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        sendChat(text);
                                    }}
                                />
                            </form>
                        </div>
                    </div>
                    <button
                        disabled={isUploading || (!text && !image)}
                        onClick={() => sendChat(text)}
                        className="h-8 w-8 p-1 bg-transparent hover:bg-neutral-500/50 disabled:hover:bg-transparent disabled:text-neutral-500 rounded-full transition-colors"
                    >
                        <PaperAirplaneIcon />
                    </button>
                </div>
                <div className="h-full flex flex-col-reverse gap-4 overflow-auto">
                    {batchedMsgs.reverse().map((batch, batchIdx, batchArr) => (
                        <div
                            className={[
                                "w-full flex flex-col px-4",
                                batch[0] && isSender(batch[0]) && "items-end",
                            ].join(" ")}
                            key={`batch-${batchIdx}`}
                        >
                            <div
                                className={[
                                    "w-full flex flex-col gap-2",
                                    batch[0] &&
                                        isSender(batch[0]) &&
                                        "justify-end",
                                ].join(" ")}
                            >
                                {batch.map((msg, idx, arr) => (
                                    <div
                                        key={msg.id}
                                        className={[
                                            "flex w-full",
                                            batch[0] &&
                                                isSender(batch[0]) &&
                                                "justify-end",
                                        ].join(" ")}
                                        ref={
                                            idx === 0 &&
                                            batchIdx === batchArr.length - 1
                                                ? loadingRef
                                                : undefined
                                        }
                                    >
                                        <div className="flex w-full flex-col gap-1">
                                            {msg.image && (
                                                <div
                                                    className={[
                                                        "relative flex",
                                                        batch[0] &&
                                                            isSender(
                                                                batch[0],
                                                            ) &&
                                                            "justify-end",
                                                    ].join(" ")}
                                                >
                                                    <div
                                                        onClick={() =>
                                                            setModal(
                                                                <ImageOnlyModal
                                                                    src={
                                                                        msg.image!
                                                                    }
                                                                />,
                                                            )
                                                        }
                                                        className="relative w-4/6 aspect-video rounded-lg shadow-lg dark:shadow-white/10"
                                                    >
                                                        <Image
                                                            src={msg.image}
                                                            alt="Uploaded image 1"
                                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                            fill
                                                            className="object-cover rounded-lg cursor-pointer"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                            {msg.message && (
                                                <div
                                                    className={[
                                                        "flex",
                                                        batch[0] &&
                                                            isSender(
                                                                batch[0],
                                                            ) &&
                                                            "justify-end",
                                                    ].join(" ")}
                                                >
                                                    <p
                                                        className={[
                                                            "px-4 py-2 rounded-t-3xl overflow-hidden text-white text-right",
                                                            isSender(msg)
                                                                ? msg.status ===
                                                                  "sending"
                                                                    ? "bg-accent-primary-500/50"
                                                                    : "bg-accent-primary-500"
                                                                : "bg-neutral-800",
                                                            idx ===
                                                            arr.length - 1
                                                                ? !isSender(msg)
                                                                    ? "rounded-bl-[4px] rounded-br-3xl"
                                                                    : "rounded-br-[4px] rounded-bl-3xl"
                                                                : "rounded-b-3xl",
                                                        ].join(" ")}
                                                    >
                                                        {msg.message}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {batch[0] &&
                                (batch[0].status === "sending" ? (
                                    <p className="text-sm text-neutral-500">
                                        Sending...
                                    </p>
                                ) : batch[0].status === "failed" ? (
                                    <p className="text-sm text-red-500">
                                        {batch[0].error ??
                                            "Failed to send message"}
                                    </p>
                                ) : (
                                    <p className="text-sm text-neutral-500">
                                        {getTimestamp(batch[0].createdAt)}
                                    </p>
                                ))}
                        </div>
                    ))}
                </div>
            </div>
        </MessagesLayout>
    );
}
