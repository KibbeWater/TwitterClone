import {
    BellIcon as BellOutline,
    HomeIcon as HomeOutline,
    UserIcon as UserOutline,
    UsersIcon as UsersOutline,
    Cog6ToothIcon as CogOutline,
    EnvelopeIcon as EnvelopeOutline,
    CheckBadgeIcon,
} from "@heroicons/react/24/outline";
import {
    BellIcon as BellSolid,
    EllipsisHorizontalIcon,
    HomeIcon as HomeSolid,
    PencilIcon,
    UserIcon as UserSolid,
    UsersIcon as UsersSolid,
    Cog6ToothIcon as CogSolid,
    MoonIcon,
    SunIcon,
    EnvelopeIcon as EnvelopeSolid,
} from "@heroicons/react/24/solid";
import { signIn, signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";

import { useModal } from "~/components/Handlers/ModalHandler";
import PostModal from "~/components/Modals/PostModal";

import { api } from "~/utils/api";
import VerifiedCheck from "../Verified";
import { PERMISSIONS, hasPermission } from "~/utils/permission";
import PremiumModal from "../Modals/PremiumModal";

export default function Navbar() {
    const [activateUserPanel, setActivateUserPanel] = useState(false);

    const { data: session } = useSession();
    const { setModal } = useModal();
    const { theme, setTheme } = useTheme();

    const { data: notifData } = api.notifications.getUnreadCount.useQuery(
        {},
        { enabled: !!session },
    );

    const { data: _hasUnreadChats } = api.chat.hasUnreadMessages.useQuery({});

    const hasUnreadChats =
        typeof _hasUnreadChats === "boolean" ? _hasUnreadChats : false;

    const router = useRouter();

    const links = useMemo<
        {
            name: string;
            activeURLs: string[];
            href?: string;
            onClick?: () => void;
            badge?: number | boolean;
            permission?: { requiredPerms: bigint | bigint[]; or?: boolean };
            iconSolid: React.ForwardRefExoticComponent<
                Omit<React.SVGProps<SVGSVGElement>, "ref"> & {
                    title?: string | undefined;
                    titleId?: string | undefined;
                } & React.RefAttributes<SVGSVGElement>
            >;
            iconOutline: React.ForwardRefExoticComponent<
                Omit<React.SVGProps<SVGSVGElement>, "ref"> & {
                    title?: string | undefined;
                    titleId?: string | undefined;
                } & React.RefAttributes<SVGSVGElement>
            >;
        }[]
    >(
        () => [
            {
                name: "Home",
                href: "/home",
                activeURLs: ["/home"],
                iconSolid: HomeSolid,
                iconOutline: HomeOutline,
            },
            {
                name: "Messages",
                href: "/message",
                activeURLs: ["/message"],
                badge: hasUnreadChats ? true : undefined,
                onClick: () => {
                    if (!session)
                        signIn(undefined, { callbackUrl: "/profile" }).catch(
                            console.error,
                        );
                    else router.push(`/message`).catch(console.error);
                },
                iconSolid: EnvelopeSolid,
                iconOutline: EnvelopeOutline,
            },
            {
                name: "Notifications",
                href: "/notifications",
                activeURLs: ["/notifications"],
                badge:
                    notifData && notifData.count > 0
                        ? notifData.count
                        : undefined,
                iconSolid: BellSolid,
                iconOutline: BellOutline,
            },
            {
                name: "Admin",
                href: "/admin",
                activeURLs: ["/admin"],
                permission: {
                    requiredPerms: [
                        PERMISSIONS.MANAGE_USERS,
                        PERMISSIONS.MANAGE_USER_ROLES,
                        PERMISSIONS.MANAGE_POSTS,
                    ],
                    or: true,
                },
                iconSolid: UsersSolid,
                iconOutline: UsersOutline,
            },
            {
                name: "Profile",
                href: session?.user.tag ? `/@${session?.user.tag}` : "/login",
                activeURLs: [
                    `/@${session?.user.tag}`,
                    `/user/${session?.user.tag}`,
                    `/profile`,
                ],
                onClick: () => {
                    if (!session)
                        signIn(undefined, { callbackUrl: "/profile" }).catch(
                            console.error,
                        );
                    else
                        router
                            .push(`/@${session?.user.tag}`)
                            .catch(console.error);
                },
                iconSolid: UserSolid,
                iconOutline: UserOutline,
            },
            {
                name: "Premium",
                activeURLs: [],
                onClick: () => {
                    setModal(<PremiumModal />);
                },
                iconSolid: CheckBadgeIcon,
                iconOutline: CheckBadgeIcon,
            },
            {
                name: "Settings",
                activeURLs: [`/settings`],
                onClick: () => {
                    if (!session)
                        signIn(undefined, { callbackUrl: "/settings" }).catch(
                            console.error,
                        );
                    else router.push(`/settings`).catch(console.error);
                },
                iconSolid: CogSolid,
                iconOutline: CogOutline,
            },
        ],
        [session, router, notifData, hasUnreadChats, setModal],
    );

    const user = session?.user;

    return (
        <nav
            className={
                "min-w-[10%] sm:max-w-[30%] max-w-min pt-2 w-full h-screen flex justify-end bg-white dark:bg-black border-r-[1px] border-highlight-light dark:border-highlight-dark"
            }
        >
            <div className="flex flex-col h-full">
                <div className={"flex flex-col sm:mx-4 mx-2 w-16 lg:w-60"}>
                    <Link
                        href="/home"
                        className={
                            "h-12 w-12 ml-1 mb-1 rounded-full transition-all flex items-center justify-center bg-transparent hover:bg-accent-primary-500/25"
                        }
                    >
                        <Image
                            src="/assets/favicons/icon-512x512.png"
                            alt="Home"
                            className="dark:brightness-0 dark:invert transition-all"
                            width={35}
                            height={35}
                        />
                    </Link>
                    {links.map(
                        (link) =>
                            ((!link.permission ||
                                hasPermission(
                                    session?.user ?? {
                                        permissions: "0",
                                        roles: [],
                                    },
                                    link.permission.requiredPerms,
                                    link.permission.or,
                                )) &&
                                link.onClick && (
                                    <button
                                        className={
                                            "lg:h-12 h-16 mb-2 rounded-full bg-transparent hover:bg-gray-600/25 flex items-center"
                                        }
                                        onClick={link.onClick}
                                        key={"link-" + link.name}
                                    >
                                        <div className="w-8 ml-4 flex items-center justify-center relative">
                                            {!link.activeURLs
                                                .map((u) => u.toLowerCase())
                                                .includes(
                                                    router.asPath.toLowerCase(),
                                                ) ? (
                                                <link.iconOutline className="text-2xl text-black dark:text-white w-8 h-8" />
                                            ) : (
                                                <link.iconSolid className="text-2xl text-black dark:text-white w-8 h-8" />
                                            )}
                                            {link.badge !== undefined ? (
                                                <div
                                                    className={[
                                                        typeof link.badge ===
                                                        "boolean"
                                                            ? "w-3 h-3 -right-1 -top-1"
                                                            : "w-5 h-5 left-2/4 bottom-2/4",
                                                        "bg-red-500 rounded-full absolute z-20 border-2 dark:border-black border-white box-content",
                                                    ].join(" ")}
                                                >
                                                    <div className="w-full h-full bg-red-500 rounded-full absolute top-0 left-0 m-auto animate-ping z-10" />
                                                    {typeof link.badge ===
                                                        "number" && (
                                                        <p className="text-white leading-5 text-center align-middle text-xs">
                                                            {(link.badge ?? 0) >
                                                            99
                                                                ? "99+"
                                                                : link.badge}
                                                        </p>
                                                    )}
                                                </div>
                                            ) : null}
                                        </div>

                                        <span className="ml-5 font-bold text-lg hidden lg:block text-black dark:text-white">
                                            {link.name}
                                        </span>
                                    </button>
                                )) ??
                            (link.href && (
                                <Link
                                    href={link.href}
                                    className={
                                        "lg:h-12 h-16 mb-2 rounded-full bg-transparent hover:bg-gray-600/25 flex items-center"
                                    }
                                    key={"link-" + link.name}
                                >
                                    <div className="w-8 ml-4 flex items-center justify-center relative">
                                        {!link.activeURLs
                                            .map((u) => u.toLowerCase())
                                            .includes(
                                                router.asPath.toLowerCase(),
                                            ) ? (
                                            <link.iconOutline className="text-2xl text-black dark:text-white w-8 h-8" />
                                        ) : (
                                            <link.iconSolid className="text-2xl text-black dark:text-white w-8 h-8" />
                                        )}
                                        {link.badge !== undefined ? (
                                            <div
                                                className={[
                                                    typeof link.badge ===
                                                    "boolean"
                                                        ? "w-3 h-3 -right-1 -top-1"
                                                        : "w-5 h-5 left-2/4 bottom-2/4",
                                                    "bg-red-500 rounded-full absolute z-20 border-2 dark:border-black border-white box-content",
                                                ].join(" ")}
                                            >
                                                <div className="w-5 h-5 bg-red-500 rounded-full absolute top-0 bottom-0 left-0 right-0 m-auto animate-ping z-10" />
                                                {typeof link.badge ===
                                                    "number" && (
                                                    <p className="text-white leading-5 text-center align-middle text-xs">
                                                        {(link.badge ?? 0) > 99
                                                            ? "99+"
                                                            : link.badge}
                                                    </p>
                                                )}
                                            </div>
                                        ) : null}
                                    </div>

                                    <span className="ml-5 font-bold text-lg hidden lg:block text-black dark:text-white">
                                        {link.name}
                                    </span>
                                </Link>
                            )),
                    )}
                    <button
                        className={
                            "w-16 h-16 lg:h-14 mb-1 rounded-full transition-all flex justify-center items-center text-white cursor-pointer bg-accent-primary-500 hover:bg-accent-primary-700 disabled:bg-red-900 disabled:cursor-default lg:w-full"
                        }
                        id="btnPost"
                        onClick={() => setModal(<PostModal />)}
                        disabled={!session}
                    >
                        <PencilIcon className="m-4 text-2xl text-white transition-all opacity-100 lg:opacity-0 block lg:!hidden w-8 h-8" />
                        <span className="hidden transition-all lg:block text-lg font-bold opacity-0 lg:opacity-100 text-white">
                            Twaat
                        </span>
                    </button>
                </div>
                <div className="flex items-end mb-2 sm:mr-4 mr-2 h-full ml-2">
                    {session?.user ? (
                        <div
                            className={
                                "w-16 h-16 text-white lg:w-full relative"
                            }
                        >
                            <button
                                className={
                                    "h-full w-full rounded-full transition-all hover:bg-gray-500/10" +
                                    " cursor-pointer flex lg:justify-between justify-center items-center mb-1 px-2"
                                }
                                onClick={() => setActivateUserPanel((p) => !p)}
                            >
                                <div className="flex items-center justify-center">
                                    <div className="w-11 h-11 relative">
                                        <div className="w-11 h-11 absolute">
                                            <Image
                                                src={
                                                    user?.image ??
                                                    "/assets/imgs/default-avatar.png"
                                                }
                                                alt={"Your Avatar"}
                                                sizes={"100vw"}
                                                fill
                                                className={"rounded-full"}
                                            />
                                        </div>
                                    </div>

                                    <div className="ml-2 flex-col items-start hidden lg:flex">
                                        <div className="flex flex-nowrap items-center gap-[2px]">
                                            <p className="hidden transition-all lg:block font-bold opacity-0 lg:opacity-100 text-black dark:text-white leading-none truncate whitespace-nowrap">
                                                {user?.name}
                                            </p>
                                            {session.user.verified && (
                                                <VerifiedCheck />
                                            )}
                                        </div>

                                        <p className="hidden transition-all lg:block opacity-0 lg:opacity-100 w-min text-gray-600 leading-[1.1]">{`@${user?.tag}`}</p>
                                    </div>
                                </div>
                                <div className="hidden lg:block lg:mr-2">
                                    <EllipsisHorizontalIcon
                                        className={
                                            "text-black dark:text-white w-5 h-5"
                                        }
                                    />
                                </div>
                            </button>
                            <div
                                className={`absolute min-w-max m-2 py-4 bottom-16 left-0 lg:right-0 bg-gray-100 dark:bg-neutral-900 shadow-lg rounded-2xl cursor-default overflow-hidden z-20 ${
                                    activateUserPanel
                                        ? "opacity-100"
                                        : "opacity-0"
                                }`}
                            >
                                <div className="w-full">
                                    <button
                                        className="w-full pl-4 pr-2 h-8 hover:bg-gray-500/20 transition-all flex items-center"
                                        disabled={!activateUserPanel}
                                        onClick={() => {
                                            signOut().catch(console.error);
                                        }}
                                    >
                                        <p className="text-left font-semibold text-black dark:text-white leading-none">
                                            Log out @{user?.tag}
                                        </p>
                                    </button>
                                    <button
                                        className="w-full pl-4 pr-2 h-8 hover:bg-gray-500/20 transition-all flex items-center"
                                        disabled={!activateUserPanel}
                                        onClick={() => {
                                            setTheme(
                                                theme === "light"
                                                    ? "dark"
                                                    : "light",
                                            );
                                        }}
                                    >
                                        {theme === "dark" ? (
                                            <p className="text-left font-semibold text-black dark:text-white leading-none flex items-center">
                                                <span>
                                                    <SunIcon
                                                        className={
                                                            "text-black dark:text-white mr-1 w-5 h-5"
                                                        }
                                                    />
                                                </span>{" "}
                                                Light Mode
                                            </p>
                                        ) : (
                                            <p className="text-left font-semibold text-black dark:text-white leading-none flex items-center">
                                                <span>
                                                    <MoonIcon
                                                        className={
                                                            "text-black dark:text-white mr-1 w-5 h-5"
                                                        }
                                                    />
                                                </span>{" "}
                                                Dark Mode
                                            </p>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </nav>
    );
}
