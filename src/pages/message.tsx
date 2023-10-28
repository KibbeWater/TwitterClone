import MessagesLayout from "~/components/Site/Layouts/MessagesLayout";

export default function Message() {
    return (
        <MessagesLayout canBack={false} preventFolding={true}></MessagesLayout>
    );
}
