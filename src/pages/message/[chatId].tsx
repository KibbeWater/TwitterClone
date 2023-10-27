import { PaperAirplaneIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/router";
import { useCallback } from "react";
import MessagesLayout from "~/components/Site/Layouts/MessagesLayout";
import { api } from "~/utils/api";

export default function Message() {
    const router = useRouter();
    const chatId = router?.query.chatId as string;

    const { mutate: _sendChat } = api.chat.sendChatMessage.useMutation();

    const { data: chat } = api.chat.fetchChat.useQuery(
        { chatId },
        { enabled: !!chatId },
    );
    const { data: messages } = api.chat.fetchMessages.useQuery(
        { chatId },
        { enabled: !!chatId },
    );

    const sendChat = useCallback<(message: string) => void>(
        (msg) => {
            _sendChat(
                { chatId, message: msg },
                {
                    onSuccess: () => {
                        router.reload();
                    },
                },
            );
        },
        [_sendChat],
    );

    return (
        <MessagesLayout title={chat?.name ?? "Loading..."}>
            <div className="w-full h-full flex flex-col">
                <div className="grow h-full">
                    {messages?.map((msg) => {
                        return (
                            <div key={msg.id}>
                                <p>{msg.message}</p>
                            </div>
                        );
                    })}
                </div>
                <div className="grow-0 h-12 pt-3 mb-3 flex px-2 gap-2 items-center">
                    <input
                        type="text"
                        placeholder="Start a new message"
                        className="w-full rounded-md outline-none pl-3 py-1"
                    />
                    <button
                        onClick={}
                        className="h-8 w-8 p-1 bg-transparent hover:bg-neutral-500/50 rounded-full transition-colors"
                    >
                        <PaperAirplaneIcon />
                    </button>
                </div>
            </div>
        </MessagesLayout>
    );
}
