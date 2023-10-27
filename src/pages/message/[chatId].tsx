import { useRouter } from "next/router";
import MessagesLayout from "~/components/Site/Layouts/MessagesLayout";
import { api } from "~/utils/api";

export default function Message() {
    const router = useRouter();
    const chatId = router?.query.chatId as string;

    const { data: chat } = api.chat.fetchChat.useQuery(
        { chatId },
        { enabled: !!chatId },
    );
    const { data: messages } = api.chat.fetchMessages.useQuery(
        { chatId },
        { enabled: !!chatId },
    );

    return (
        <MessagesLayout title={chat?.name ?? "Loading..."}>
            {messages?.map((msg) => {
                return (
                    <div key={msg.id}>
                        <p>{msg.message}</p>
                    </div>
                );
            })}
        </MessagesLayout>
    );
}
