import { PaperAirplaneIcon } from "@heroicons/react/24/solid";
import type { Message as DM } from "@prisma/client";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";

import MessagesLayout from "~/components/Site/Layouts/MessagesLayout";
import { api, pusher } from "~/utils/api";

export default function Message() {
    const [streamedMessages, setStreamedMessages] = useState<DM[]>([]);
    const [localMessages, setLocalMessages] = useState<DM[]>([]);

    const [text, setText] = useState<string>("");

    const router = useRouter();
    const chatId = router?.query.chatId as string;

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

    return (
        <MessagesLayout title={chat?.name ?? "Loading..."}>
            <div className="w-full h-full flex flex-col">
                <div className="grow h-full">
                    {msgs.map((msg, idx) => {
                        return (
                            <div key={`${msg.id}-${idx}`}>
                                <p>{msg.message}</p>
                            </div>
                        );
                    })}
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
