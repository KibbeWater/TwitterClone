import { PaperAirplaneIcon } from "@heroicons/react/24/solid";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";

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
    const { data: messages, refetch: refetchMessages } =
        api.chat.fetchMessages.useQuery(
            {
                chatId,
            },
            { enabled: !!chatId },
        );

    useEffect(() => {
        setStreamedMessages([]);
        setLocalMessages([]);
    }, [messages]);

    useEffect(() => {
        const channelName = `chat-${chatId}`;
        const channel = pusher.subscribe(channelName);

        channel.bind("new-message", () => refetchMessages());

        return () => {
            channel.unbind("new-message");

            pusher.unsubscribe(channelName);
        };
    }, [chatId, refetchMessages]);

    const msgs = [
        ...new Set([
            ...(messages ?? []),
            ...streamedMessages,
            ...localMessages,
        ]),
    ].sort(
        (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );

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
            return timestamp.toLocaleDateString([], {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "numeric",
            });
        }
    }, []);

    return (
        <MessagesLayout title={chat?.name ?? "Loading..."}>
            <div className="w-full h-full flex flex-col">
                <div className="grow h-full flex flex-col justify-end gap-4">
                    {batchedMsgs.map((batch, idx) => (
                        <div
                            className={[
                                "w-full flex flex-col px-4",
                                batch[0] && isSender(batch[0]) && "items-end",
                            ].join(" ")}
                            key={`batch-${idx}`}
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
                                        key={`msg-${msg.id}`}
                                        className={[
                                            "flex",
                                            batch[0] &&
                                                isSender(batch[0]) &&
                                                "justify-end",
                                        ].join(" ")}
                                    >
                                        <p
                                            className={[
                                                "px-4 py-2 rounded-t-full text-white",
                                                isSender(msg)
                                                    ? "bg-accent-primary-500"
                                                    : "bg-neutral-800",
                                                idx === arr.length - 1
                                                    ? !isSender(msg)
                                                        ? "rounded-bl-xl rounded-br-full"
                                                        : "rounded-br-xl rounded-bl-full"
                                                    : "rounded-b-full",
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
                <div className="grow-0 h-12 pt-3 mb-3 flex px-2 gap-2 items-center">
                    <input
                        type="text"
                        disabled={isSendingChat}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Start a new message"
                        className="w-full rounded-md outline-none pl-3 py-1"
                    />
                    <button
                        disabled={isSendingChat}
                        onClick={() => sendChat(text)}
                        className="h-8 w-8 p-1 bg-transparent hover:bg-neutral-500/50 disabled:hover:bg-transparent disabled:text-neutral-500 rounded-full transition-colors"
                    >
                        <PaperAirplaneIcon />
                    </button>
                </div>
            </div>
        </MessagesLayout>
    );
}
