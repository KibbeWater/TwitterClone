/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import Image from "next/image";
import Link from "next/link";

import { FontAwesomeSvgIcon } from "react-fontawesome-svg-icon";
import {
    faFeatherPointed,
    faUser,
    faHome,
    /* faEllipsis,
    faMoon,
    faSun, */
    faBell,
} from "@fortawesome/free-solid-svg-icons";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

export default function Navbar() {
    const { data: session, status } = useSession();
    const user = session?.user;

    useEffect(() => {
        console.log(status, user, session);
    }, [status]);

    return (
        <nav
            className={
                "min-w-[10%] sm:max-w-[25%] max-w-min pt-2 w-full h-screen flex justify-end bg-white dark:bg-black border-r-[1px] border-gray-700"
            }
        >
            <div className="flex flex-col h-full">
                <div className={"flex flex-col sm:mr-4 mr-2 w-16 lg:w-60"}>
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
                    <Link
                        href="/home"
                        className={
                            "lg:h-12 h-16 mb-2 rounded-full bg-transparent hover:bg-gray-600/25 flex items-center"
                        }
                    >
                        <div className="w-8 ml-4 flex items-center justify-center">
                            <FontAwesomeSvgIcon
                                icon={faHome}
                                size={"xl"}
                                className={"text-black dark:text-white"}
                            />
                        </div>

                        <span className="ml-5 font-bold text-lg hidden lg:block text-black dark:text-white">
                            Home
                        </span>
                    </Link>
                    <Link
                        href="/notifications"
                        className={
                            "lg:h-12 h-16 mb-2 rounded-full bg-transparent hover:bg-gray-600/25 flex items-center"
                        }
                    >
                        <div className="w-8 ml-4 flex items-center justify-center relative">
                            <FontAwesomeSvgIcon
                                icon={faBell}
                                size={"xl"}
                                className={"text-black dark:text-white"}
                            />
                            {/* {unreadNotifications.length > 0 ? (
                                <div className="w-5 h-5 bg-red-500 rounded-full absolute left-2/4 bottom-2/4 z-20 border-2 dark:border-black border-white box-content">
                                    <div className="w-5 h-5 bg-red-500 rounded-full absolute top-0 bottom-0 left-0 right-0 m-auto animate-ping z-10" />
                                    <p className="text-white leading-5 text-center align-middle text-xs">
                                        {unreadNotifications.length > 99
                                            ? "99+"
                                            : unreadNotifications.length}
                                    </p>
                                </div>
                            ) : null} */}
                        </div>

                        <span className="ml-5 font-bold text-lg hidden lg:block text-black dark:text-white">
                            Notifications
                        </span>
                    </Link>
                    <Link
                        href={user ? `@${user.tag}` : "/login"}
                        className={
                            "lg:h-12 h-16 mb-2 rounded-full bg-transparent hover:bg-gray-600/25 flex items-center"
                        }
                    >
                        <div className="w-8 ml-4 flex items-center justify-center">
                            <FontAwesomeSvgIcon
                                icon={faUser}
                                size={"xl"}
                                className={"text-black dark:text-white"}
                            />
                        </div>
                        <span className="ml-5 font-bold text-lg hidden lg:block text-black dark:text-white">
                            Profile
                        </span>
                    </Link>
                    <button
                        className={
                            "w-16 h-16 lg:h-14 mb-1 rounded-full transition-all flex justify-center items-center text-white cursor-pointer bg-accent-primary-500 hover:bg-accent-primary-400 lg:w-full"
                        }
                        id="btnPost"
                        /* onClick={() => {
                            if (setModal) setModal(<PostModal />);
                        }} */
                    >
                        <FontAwesomeSvgIcon
                            icon={faFeatherPointed}
                            size={"2xl"}
                            color={"white"}
                            className={
                                "transition-all opacity-100 lg:opacity-0 block lg:!hidden"
                            }
                        />
                        <span className="hidden transition-all lg:block text-lg font-bold opacity-0 lg:opacity-100 text-white">
                            Twaat
                        </span>
                    </button>
                </div>
                {/* <div className="flex items-end mb-2 sm:mr-4 mr-2 h-full">
                    {user ? (
                        <div
                            className={
                                "w-16 h-16 text-white lg:w-full relative"
                            }
                        >
                            <button
                                className={
                                    "h-full w-full rounded-full transition-all hover:bg-gray-500/10" +
                                    " cursor-pointer flex justify-between items-center mb-1 px-2"
                                }
                                onClick={() => setActivateUserPanel()}
                            >
                                <div className="flex items-center justify-center">
                                    <div className="w-11 h-11 relative">
                                        <div className="w-11 h-11 absolute">
                                            <Image
                                                src={
                                                    user?.avatar ||
                                                    "/default_avatar.png"
                                                }
                                                alt={"Your Avatar"}
                                                sizes={"100vw"}
                                                fill
                                                className={"rounded-full h-"}
                                            />
                                        </div>
                                    </div>

                                    <div className="ml-2 flex flex-col items-start">
                                        <p className="hidden transition-all lg:block font-bold opacity-0 lg:opacity-100 text-black dark:text-white leading-[1.1]">
                                            {user?.username}
                                        </p>
                                        <p className="hidden transition-all lg:block opacity-0 lg:opacity-100 w-min text-gray-600 leading-[1.1]">{`@${user?.tag}`}</p>
                                    </div>
                                </div>
                                <div className="mr-2 hidden lg:block">
                                    <FontAwesomeSvgIcon
                                        icon={faEllipsis}
                                        className={"text-black dark:text-white"}
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
                                            window.location.assign(
                                                "/api/logout",
                                            );
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
                                            <p className="text-left font-semibold text-black dark:text-white leading-none">
                                                <span>
                                                    <FontAwesomeSvgIcon
                                                        icon={faSun}
                                                        className={
                                                            "text-black dark:text-white mr-1"
                                                        }
                                                    />
                                                </span>{" "}
                                                Light Mode
                                            </p>
                                        ) : (
                                            <p className="text-left font-semibold text-black dark:text-white leading-none">
                                                <span>
                                                    <FontAwesomeSvgIcon
                                                        icon={faMoon}
                                                        className={
                                                            "text-black dark:text-white mr-1"
                                                        }
                                                    />
                                                </span>{" "}
                                                Dark Mode (BETA)
                                            </p>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div> */}
            </div>
        </nav>
    );
}
