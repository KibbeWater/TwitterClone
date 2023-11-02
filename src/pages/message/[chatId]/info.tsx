import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useCallback, useState } from "react";
import { useModal } from "~/components/Handlers/ModalHandler";
import ChatInfoModal from "~/components/Modals/ChatInfoModal";

import SettingsButton from "~/components/Settings/SettingsButton";
import MessagesLayout from "~/components/Site/Layouts/MessagesLayout";
import UserContext from "~/components/UserContext";

import { api } from "~/utils/api";

function isFollowingUser(
    user: { id: string } | undefined,
    profile: { followerIds: string[] } | undefined,
) {
    if (!user || !profile) return false;
    return profile.followerIds.find((u) => u === user.id) !== undefined;
}

export default function ChatInfo() {
    const [followingText, setFollowingText] = useState<
        { id: string; hovered: boolean }[]
    >([]);
    const [loadingFollows, setLoadingFollows] = useState<string[]>([]);

    const router = useRouter();
    const chatId = router?.query.chatId as string;

    const { data: session } = useSession();
    const { setModal } = useModal();

    const { data: chat, refetch: _reloadChat } = api.chat.fetchChat.useQuery(
        { chatId },
        { enabled: !!chatId },
    );
    const { mutate: _setFollowing } = api.followers.setFollowing.useMutation();
    const { mutate: _leaveChat, isLoading: isLeaving } =
        api.chat.leaveChat.useMutation();

    const setFollowing = useCallback(
        (user: { id: string }, shouldFollow: boolean) => {
            setLoadingFollows((prev) => [...prev, user.id]);
            _setFollowing(
                { id: user.id, shouldFollow },
                {
                    onSuccess: () => {
                        _reloadChat().catch(console.error);
                    },
                    onSettled: () => {
                        setLoadingFollows([]);
                    },
                },
            );
        },
        [_setFollowing, _reloadChat],
    );

    const leaveChat = useCallback(() => {
        _leaveChat(
            { chatId },
            {
                onSuccess: () => {
                    router.push("/message").catch(console.error);
                },
            },
        );
    }, [_leaveChat, router, chatId]);

    const getChatImage = (chat: {
        image?: string | null;
        participants: { id: string; image: string | null }[];
    }) => {
        if (chat.image) return chat.image;
        const user = chat.participants.find(
            (participant) =>
                participant.id !== session?.user.id &&
                session?.user.id !== undefined,
        );
        return user?.image ?? session?.user.image;
    };

    const getChatNameRaw = (chat: {
        participants: { id: string; name: string | null; tag: string | null }[];
        name: string;
    }) => {
        if (chat.participants.length > 2) return chat.name;

        const user = chat.participants.find(
            (participant) =>
                participant.id !== session?.user.id &&
                session?.user.id !== undefined,
        );

        return user?.name ?? session?.user.name;
    };

    const getChatName = (chat: {
        participants: { id: string; name: string | null; tag: string | null }[];
        name: string;
    }) => {
        if (chat.participants.length > 2)
            return (
                <p className="truncate leading-none text-sm font-semibold">
                    {chat.name}
                </p>
            );

        const user = chat.participants.find(
            (participant) =>
                participant.id !== session?.user.id &&
                session?.user.id !== undefined,
        );

        return (
            <p className="truncate leading-snug text-sm font-semibold">
                {user?.name ?? session?.user.name}{" "}
                <span className="text-neutral-500">
                    @{user?.tag ?? session?.user.tag}
                </span>
            </p>
        );
    };

    return (
        <MessagesLayout title="Conversation info" solidHeader={true}>
            <div className="w-full flex flex-col">
                <div className="border-b-[1px] border-highlight-light dark:border-highlight-dark px-3 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Image
                            src={
                                chat
                                    ? getChatImage(chat) ??
                                      "/assets/imgs/default-avatar.png"
                                    : "/assets/imgs/default-avatar.png"
                            }
                            width={36}
                            height={36}
                            alt={"Group icon"}
                            className="rounded-full object-cover w-9 h-9"
                        />
                        {chat ? getChatName(chat) : <p>Loading...</p>}
                    </div>
                    <button
                        onClick={() =>
                            setModal(
                                <ChatInfoModal
                                    id={chat!.id}
                                    name={
                                        chat ? getChatNameRaw(chat) ?? "" : ""
                                    }
                                    image={
                                        chat
                                            ? getChatImage(chat) ??
                                              "/assets/imgs/default-avatar.png"
                                            : "/assets/imgs/default-avatar.png"
                                    }
                                    mutate={() => {
                                        _reloadChat().catch(console.error);
                                    }}
                                />,
                            )
                        }
                        className="text-[#1d9bf0] hover:underline text-sm"
                    >
                        Edit
                    </button>
                </div>
                <div className="border-b-[1px] border-highlight-light dark:border-highlight-dark py-1">
                    {chat?.participants
                        .filter((usr) => usr.id !== session?.user.id)
                        .map((user) => (
                            <div
                                key={`member-${user.id}-ctx`}
                                className="flex flex-nowrap hover:bg-black/20 dark:hover:bg-white/5 pr-3 text-left items-center"
                            >
                                <UserContext
                                    onClick={() => {
                                        router
                                            .push(`/@${user.tag}`)
                                            .catch(console.error);
                                    }}
                                    className="hover:!bg-transparent grow hover:cursor-pointer"
                                    user={user}
                                />
                                {isFollowingUser(session?.user, user) ? (
                                    <button
                                        className={
                                            "bg-black/0 grow-0 px-[15px] py-2 font-semibold border-[1px] text-black dark:text-white border-gray-700 min-w-[36px] transition-all rounded-full disabled:!bg-transparent " +
                                            "hover:bg-red-500/10 hover:text-red-600 hover:border-red-300 hover:cursor-pointer disabled:cursor-default disabled:border-neutral-500 disabled:!text-neutral-500 flex-none text-center"
                                        }
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setFollowing(user, false);
                                        }}
                                        onMouseEnter={() =>
                                            setFollowingText((prev) => [
                                                ...prev,
                                                { id: user.id, hovered: true },
                                            ])
                                        }
                                        onMouseLeave={() =>
                                            setFollowingText((prev) =>
                                                prev.filter(
                                                    (u) => u.id !== user.id,
                                                ),
                                            )
                                        }
                                        disabled={loadingFollows.includes(
                                            user.id,
                                        )}
                                    >
                                        {followingText.find(
                                            (u) => u.id === user.id,
                                        )?.hovered
                                            ? "Unfollow"
                                            : "Following"}
                                    </button>
                                ) : (
                                    <button
                                        className={
                                            "bg-black grow-0 dark:bg-white text-white dark:hover:bg-neutral-400 hover:bg-neutral-600 disabled:!bg-neutral-500 disabled:cursor-default transition-colors dark:text-black px-[15px] py-2 font-bold cursor-pointer rounded-full text-center"
                                        }
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setFollowing(user, true);
                                        }}
                                        disabled={loadingFollows.includes(
                                            user.id,
                                        )}
                                    >
                                        Follow
                                    </button>
                                )}
                            </div>
                        ))}
                </div>
                <SettingsButton
                    onClick={() => leaveChat()}
                    disabled={isLeaving}
                    className="!text-base"
                >
                    Leave chat
                </SettingsButton>
            </div>
        </MessagesLayout>
    );
}
