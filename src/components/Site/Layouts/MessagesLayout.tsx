import { ChevronRightIcon, PlusIcon } from "@heroicons/react/20/solid";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
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
    solidHeader?: boolean;
    enableInfo?: boolean;
    handleInfoClick?: () => void;
};

export default function MessagesLayout({
    title,
    children,
    canBack = true,
    preventFolding,
    solidHeader,
    enableInfo,
    handleInfoClick,
}: Props) {
    const [navVisible, setNavVisible] = useState(false);

    const router = useRouter();
    const { setModal } = useModal();
    const { data: session } = useSession();

    const navRef = useRef<HTMLDivElement>(null);

    const { data: chats, refetch: refetchChats } = api.chat.fetchChats.useQuery(
        {},
    );
    const { data: _hasUnreadChats, refetch: refetchUnreads } =
        api.chat.hasUnreadMessages.useQuery(
            { chatId: chats?.map((chat) => chat.id) ?? [] },
            { refetchInterval: 30000 },
        );
    const unreadChats =
        typeof _hasUnreadChats === "object" ? _hasUnreadChats : null;

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
        setTimeout(() => {
            refetchUnreads().catch(console.error);
        }, 2000);
    }, [router.asPath, refetchUnreads]);

    useEffect(() => {
        if (!session?.user.id) return;
        const channelName = session.user.id;
        const channel = pusher.subscribe(channelName);

        channel.bind("new-chat", () => {
            refetchChats().catch(console.error);
            refetchUnreads().catch(console.error);
        });

        channel.bind("new-message", () => {
            refetchChats().catch(console.error);
            refetchUnreads().catch(console.error);
        });

        return () => {
            channel.unbind("new-chat");
            channel.unbind("new-message");

            pusher.unsubscribe(channelName);
        };
    }, [refetchChats, refetchUnreads, session?.user.id]);

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
                                    <div className="shrink-0">
                                        <Image
                                            src={
                                                getChatImage(chat) ??
                                                "/assets/imgs/default-avatar.png"
                                            }
                                            alt="Profile picture"
                                            className="rounded-full object-cover h-8 w-8"
                                            width={32}
                                            height={32}
                                        />
                                    </div>
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
                                            {unreadChats?.findIndex(
                                                (c) => c.id == chat.id,
                                            ) !== -1 && (
                                                <div className="w-2 h-2 rounded-full bg-accent-primary-500 flex justify-self-end" />
                                            )}
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
                    className={`lg:flex overflow-hidden relative ${
                        preventFolding ? "hidden" : "flex"
                    } flex-col grow`}
                >
                    <div
                        className={[
                            "flex w-full justify-between items-center pr-2 py-1 backdrop-blur-md dark:bg-black/30 bg-white/30",
                            !solidHeader ? "absolute top-0 left-0" : undefined,
                        ].join(" ")}
                    >
                        <div className="ml-3 flex items-center gap-4 overflow-hidden">
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
                        {enableInfo && (
                            <button
                                onClick={() => handleInfoClick?.()}
                                className="w-9 h-9 p-[6px] flex-none hover:bg-neutral-500/30 transition-colors rounded-full"
                            >
                                <InformationCircleIcon className="w-full h-full" />
                            </button>
                        )}
                    </div>

                    <main
                        className={[
                            "grow overflow-hidden",
                            !solidHeader && "pt-14",
                        ].join(" ")}
                    >
                        {children}
                    </main>
                </div>
                <div className="w-1/6 grow-0 shrink-0 border-l-[1px] lg:block hidden border-highlight-light dark:border-highlight-dark"></div>
            </div>
        </>
    );
}
