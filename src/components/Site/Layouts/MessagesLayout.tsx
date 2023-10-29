import { ChevronRightIcon, PlusIcon } from "@heroicons/react/20/solid";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";

import Navbar from "../Navbar";
import { api, pusher } from "~/utils/api";
import { useSession } from "next-auth/react";
import { useModal } from "~/components/Handlers/ModalHandler";
import MessageModal from "~/components/Modals/MessageModal";
import Image from "next/image";

type Props = {
    canBack?: boolean;
    title?: string;
    description?: string;
    children?: React.ReactNode;
    preventFolding?: boolean;
};

export default function MessagesLayout({
    title,
    description,
    children,
    canBack = true,
    preventFolding,
}: Props) {
    const [navVisible, setNavVisible] = useState(false);

    const router = useRouter();
    const { setModal } = useModal();
    const { data: session } = useSession();

    const navRef = useRef<HTMLDivElement>(null);

    const { data: chats, refetch: refetchChats } = api.chat.fetchChats.useQuery(
        {},
    );
    const { data: _hasUnreadChats } = api.chat.hasUnreadMessages.useQuery(
        { chatId: chats?.map((chat) => chat.id) ?? [] },
        /* { refetchInterval: 1000 }, */
    );
    const unreadChats =
        typeof _hasUnreadChats === "object" ? _hasUnreadChats : null;

    const getChatImage = (chat: {
        participants: { id: string; image: string | null }[];
    }) => {
        const user = chat.participants.find(
            (participant) =>
                participant.id !== session?.user.id &&
                session?.user.id !== undefined,
        );
        return user?.image ?? session?.user.image;
    };

    const getChatName = (chat: {
        participants: { id: string; name: string | null; tag: string | null }[];
        name: string;
    }) => {
        if (chat.participants.length > 2)
            return <p className="truncate leading-none">{chat.name}</p>;

        const user = chat.participants.find(
            (participant) =>
                participant.id !== session?.user.id &&
                session?.user.id !== undefined,
        );

        return (
            <p className="truncate leading-snug">
                {user?.name ?? session?.user.name}{" "}
                <span className="text-neutral-500">
                    @{user?.tag ?? session?.user.tag}
                </span>
            </p>
        );
    };

    const getChatTimestamp = (chat: {
        latestMessage?: { createdAt: Date };
    }) => {
        const date = new Date(chat.latestMessage?.createdAt ?? Date.now());

        const isThisYear =
            date.getFullYear() === new Date(Date.now()).getFullYear();
        const isToday =
            date.getDate() === new Date(Date.now()).getDate() &&
            date.getMonth() === new Date(Date.now()).getMonth();

        if (!isThisYear)
            return date.toLocaleDateString([], {
                year: "numeric",
                month: "long",
                day: "numeric",
            });
        else if (!isToday)
            return date.toLocaleDateString([], {
                month: "short",
                day: "numeric",
            });
        else
            return date.toLocaleTimeString([], {
                hour: "numeric",
                minute: "numeric",
            });
    };

    useEffect(() => {
        const handleResize = () => {
            if (navRef.current?.offsetWidth === 0) return setNavVisible(false);
            else if (!navVisible) setNavVisible(true);
        };

        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, [navVisible]);

    useEffect(() => {
        if (!session?.user.id) return;
        const channelName = session.user.id;
        const channel = pusher.subscribe(channelName);

        channel.bind("new-chat", () => refetchChats());

        return () => {
            channel.unbind("new-chat");

            pusher.unsubscribe(channelName);
        };
    }, [refetchChats, session?.user.id]);

    return (
        <>
            <Head>
                <title>Twatter - Messages</title>
            </Head>
            <div className="parent w-screen h-screen flex relative bg-white dark:bg-black">
                <Navbar />

                <div
                    ref={navRef}
                    className={`lg:w-1/4 lg:block overflow-hidden lg:shrink-0 ${
                        !preventFolding ? "hidden w-1/4" : "block w-full"
                    } border-r-[1px] border-highlight-light dark:border-highlight-dark grow-0`}
                >
                    <div className="pb-6 px-4 flex justify-between items-center">
                        <h1 className="text-black dark:text-white font-semibold text-xl my-2">
                            Messages
                        </h1>
                        <button
                            onClick={() => setModal(<MessageModal />)}
                            className="h-8 w-8 p-1 hover:bg-neutral-500/50 rounded-full transition-colors"
                        >
                            <PlusIcon />
                        </button>
                    </div>
                    <nav className="flex flex-col overflow-hidden">
                        {chats?.map((chat) => (
                            <Link
                                key={chat.id}
                                href={`/message/${chat.id}`}
                                className={[
                                    unreadChats?.findIndex(
                                        (c) => c.id == chat.id,
                                    ) !== -1 &&
                                        "dark:bg-gray-300/20 bg-gray-700/25",
                                    "flex justify-between items-center pl-4 pr-3 py-2 transition-colors bg-transparent duration-300 dark:hover:bg-neutral-700 hover:bg-neutral-200 w-full",
                                ].join(" ")}
                            >
                                <div className="flex items-center gap-2 grow overflow-hidden mr-2">
                                    <Image
                                        src={
                                            getChatImage(chat) ??
                                            "/assets/imgs/default-avatar.png"
                                        }
                                        alt="Profile picture"
                                        className="rounded-full"
                                        width={32}
                                        height={32}
                                    />
                                    <div className="flex flex-col w-full justify-between overflow-hidden">
                                        <div className="w-full flex items-center justify-between gap-2">
                                            <div className="flex flex-nowrap gap-1 items-center">
                                                {getChatName(chat)}
                                                <div className="flex-none grow-0 flex gap-1 items-center">
                                                    <span className="flex-none text-neutral-500">
                                                        ·
                                                    </span>
                                                    <p className="flex-none text-neutral-500">
                                                        {getChatTimestamp(chat)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="w-2 h-2 rounded-full bg-accent-primary-500 flex justify-self-end" />
                                        </div>
                                        <div className="h-[1.1em]">
                                            <p className="truncate leading-[1.1] text-neutral-500">
                                                {chat.latestMessage?.message ??
                                                    " "}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="h-6 w-6 flex-none">
                                    <ChevronRightIcon className="text-neutral-500" />
                                </div>
                            </Link>
                        ))}
                    </nav>
                </div>
                <div
                    className={`lg:flex overflow-hidden ${
                        preventFolding ? "hidden" : "flex"
                    } flex-col gap-5 grow pt-2`}
                >
                    <div className="ml-3 flex items-center gap-4">
                        {(canBack || !navVisible) && (
                            <div
                                onClick={() => router.back()}
                                className="h-full flex justify-center items-center aspect-square rounded-full p-2 hover:bg-gray-600/25 transition-colors bg-transparent cursor-pointer"
                            >
                                <ArrowLeftIcon className="h-5 w-5 text-black dark:text-white" />
                            </div>
                        )}
                        <h2 className="text-black dark:text-white font-semibold text-xl my-2 whitespace-nowrap truncate">
                            {title}
                        </h2>
                    </div>

                    {description && (
                        <p className="px-3 text-sm text-neutral-500">
                            {description}
                        </p>
                    )}

                    <main className="grow overflow-hidden">{children}</main>
                </div>
                <div className="w-1/6 grow-0 shrink-0 border-l-[1px] lg:block hidden border-highlight-light dark:border-highlight-dark"></div>
            </div>
        </>
    );
}
