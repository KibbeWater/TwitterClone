import { PaperAirplaneIcon } from "@heroicons/react/24/solid";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useInView } from "react-intersection-observer";

import MessagesLayout from "~/components/Site/Layouts/MessagesLayout";
import { api, pusher } from "~/utils/api";

type DM = {
    message: string;
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

export default function Message() {
    const [streamedMessages, setStreamedMessages] = useState<DM[]>([]);
    const [localMessages, setLocalMessages] = useState<DM[]>([]);

    const [text, setText] = useState<string>("");

    const router = useRouter();
    const chatId = router?.query.chatId as string;

    const { data: session } = useSession();

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
        isLoading,
    } = api.chat.fetchMessages.useInfiniteQuery(
        {
            chatId,
        },
        {
            enabled: !!chatId,
            getNextPageParam: (lastPage) => lastPage.nextCursor,
        },
    );

    const { ref: loadingRef, inView } = useInView();

    const handleFetchNextPage = useCallback(async () => {
        await fetchNextPage();
    }, [fetchNextPage]);

    const messages = useMemo(
        () =>
            data?.pages.reduce(
                (acc, cur) => [...acc, ...cur.items],
                [] as {
                    message: string;
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

        channel.bind("new-message", () => refetchMessages());

        return () => {
            channel.unbind("new-message");

            pusher.unsubscribe(channelName);
        };
    }, [chatId, refetchMessages]);

    const msgs = [...(messages ?? []), ...streamedMessages, ...localMessages]
        .sort(
            (a, b) =>
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime(),
        )
        .filter((msg, index, self) => {
            return index === self.findIndex((p) => p.id === msg.id);
        });

    const batchedMsgs = useMemo(() => {
        const batches: DM[][] = [];
        msgs.forEach((msg) => {
            const lastBatch = batches[batches.length - 1] ?? [];
            const lastMsg = lastBatch[lastBatch.length - 1];

            if (
                lastMsg &&
                new Date(msg.createdAt).getTime() -
                    new Date(lastMsg.createdAt).getTime() <
                    1000 * 60 * 5 &&
                lastMsg.userId === msg.userId
            ) {
                lastBatch.push(msg);
            } else {
                batches.push([msg]);
            }
        });
        return batches;
    }, [msgs]);

    const sendChat = useCallback<(message: string) => void>(
        (msg) => {
            _sendChat(
                { chatId, message: msg },
                {
                    onSuccess(data) {
                        setLocalMessages((prev) => [...prev, data]);
                        setText("");
                    },
                },
            );
        },
        [_sendChat, chatId],
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

        // is today?
        const isWithing24Hours: boolean =
            (timestamp.getTime() - date.getTime()) / 1000 / 60 / 60 < 24;
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

    return (
        <MessagesLayout
            canBack={false}
            title={chat ? getChatName(chat) : "Loading..."}
        >
            <div className="w-full h-full flex flex-col-reverse overflow-hidden">
                <div className="h-12 basis-12 flex-none pt-3 mb-3 flex px-2 gap-2 items-center">
                    <form className={"w-full"}>
                        <input
                            type="text"
                            disabled={isSendingChat}
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Start a new message"
                            className="w-full rounded-md outline-none pl-3 py-1"
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
                    <button
                        disabled={isSendingChat}
                        onClick={() => sendChat(text)}
                        className="h-8 w-8 p-1 bg-transparent hover:bg-neutral-500/50 disabled:hover:bg-transparent disabled:text-neutral-500 rounded-full transition-colors"
                    >
                        <PaperAirplaneIcon />
                    </button>
                </div>
                <div className="h-full flex flex-col-reverse gap-4 overflow-auto">
                    {batchedMsgs.map((batch, batchIdx, batchArr) => (
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
                                            "flex",
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
                                        <p
                                            className={[
                                                "px-4 py-2 rounded-t-3xl overflow-hidden text-white text-right",
                                                isSender(msg)
                                                    ? "bg-accent-primary-500"
                                                    : "bg-neutral-800",
                                                idx === arr.length - 1
                                                    ? !isSender(msg)
                                                        ? "rounded-bl-[4px] rounded-br-3xl"
                                                        : "rounded-br-[4px] rounded-bl-3xl"
                                                    : "rounded-b-3xl",
                                            ].join(" ")}
                                        >
                                            {msg.message}
                                        </p>
                                    </div>
                                ))}
                            </div>
                            {batch[0] && (
                                <p className="text-sm text-neutral-500">
                                    {getTimestamp(batch[0].createdAt)}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </MessagesLayout>
    );
}
