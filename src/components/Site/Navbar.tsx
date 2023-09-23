import Image from "next/image";
import Link from "next/link";

import { useSession } from "next-auth/react";

import {
    UserIcon as UserSolid,
    BellIcon as BellSolid,
    HomeIcon as HomeSolid,
    PencilIcon,
} from "@heroicons/react/24/solid";
import {
    UserIcon as UserOutline,
    BellIcon as BellOutline,
    HomeIcon as HomeOutline,
} from "@heroicons/react/24/outline";
import { useMemo } from "react";
import { useRouter } from "next/router";
import PostModal from "../Modals/PostModal";
import { useModal } from "../Handlers/ModalHandler";

export default function Navbar() {
    const { data: session } = useSession();
    const { setModal } = useModal();

    const router = useRouter();

    const links = useMemo(() => {
        return [
            {
                name: "Home",
                href: "/home",
                iconSolid: HomeSolid,
                iconOutline: HomeOutline,
            },
            {
                name: "Notifications",
                href: "/notifications",
                iconSolid: BellSolid,
                iconOutline: BellOutline,
            },
            {
                name: "Profile",
                href: session?.user.tag ? `/@${session?.user.tag}` : "/login",
                iconSolid: UserSolid,
                iconOutline: UserOutline,
            },
        ];
    }, [session]);

    return (
        <nav
            className={
                "min-w-[10%] sm:max-w-[25%] max-w-min pt-2 w-full h-screen flex justify-end bg-white dark:bg-black border-r-[1px] border-gray-200 dark:border-gray-700"
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
                    {links.map((link) => (
                        <Link
                            href={link.href}
                            className={
                                "lg:h-12 h-16 mb-2 rounded-full bg-transparent hover:bg-gray-600/25 flex items-center"
                            }
                            key={"link-" + link.name}
                        >
                            <div className="w-8 ml-4 flex items-center justify-center">
                                {router.asPath.toLowerCase() !==
                                link.href.toLowerCase() ? (
                                    <link.iconOutline className="text-2xl text-black dark:text-white" />
                                ) : (
                                    <link.iconSolid className="text-2xl text-black dark:text-white" />
                                )}
                            </div>

                            <span className="ml-5 font-bold text-lg hidden lg:block text-black dark:text-white">
                                {link.name}
                            </span>
                        </Link>
                    ))}
                    <button
                        className={
                            "w-16 h-16 lg:h-14 mb-1 rounded-full transition-all flex justify-center items-center text-white cursor-pointer bg-accent-primary-500 hover:bg-accent-primary-400 lg:w-full"
                        }
                        id="btnPost"
                        onClick={() => setModal(<PostModal />)}
                    >
                        <PencilIcon className="m-4 text-2xl text-white transition-all opacity-100 lg:opacity-0 block lg:!hidden" />
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
                                                    "/assets/imgs/default-avatar.png"
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
