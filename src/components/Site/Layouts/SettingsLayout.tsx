import { ChevronRightIcon } from "@heroicons/react/20/solid";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useRef, useState } from "react";
import { SpeedInsights } from "@vercel/speed-insights/next";

import Navbar from "../Navbar";

type Props = {
    canBack?: boolean;
    title?: string;
    description?: string;
    children?: React.ReactNode;
    preventFolding?: boolean;
};

export default function SettingsLayout({
    title,
    description,
    children,
    canBack = true,
    preventFolding,
}: Props) {
    const [activeTab, setActiveTab] = useState(-1);
    const [navVisible, setNavVisible] = useState(false);

    const router = useRouter();

    const tabs = useMemo<{ name: string; slug: string }[]>(
        () => [
            { name: "Your account", slug: "account" },
            { name: "Security and account access", slug: "security" },
            { name: "Privacy and safety", slug: "privacy" },
        ],
        [],
    );

    const navRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const tab = tabs.find((tab) =>
            router.asPath.startsWith(`/settings/${tab.slug}`),
        );
        if (tab) setActiveTab(tabs.indexOf(tab));
    }, [router.asPath, tabs]);

    useEffect(() => {
        const handleResize = () => {
            // is invisible?
            if (navRef.current?.offsetWidth === 0) {
                setNavVisible(false);
                return;
            } else {
                if (navVisible) return;
                setNavVisible(true);
            }
        };

        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, [navVisible]);

    return (
        <>
            <Head>
                <title>Twatter - Settings</title>
            </Head>
            <body className="parent w-screen h-screen flex relative bg-white dark:bg-black">
                <Navbar />

                <div
                    ref={navRef}
                    className={`lg:w-1/5 lg:block ${
                        !preventFolding ? "hidden w-1/5" : "block w-full"
                    } border-r-[1px] border-highlight-light dark:border-highlight-dark grow-0 flex-none`}
                >
                    <div className="pb-6">
                        <h1 className="text-black dark:text-white font-semibold text-xl my-2 ml-4">
                            Settings
                        </h1>
                    </div>
                    <nav className="flex flex-col">
                        {tabs.map((tab, idx) => (
                            <Link
                                key={`${tab.name}-${idx}`}
                                href={`/settings/${tab.slug}`}
                                className={[
                                    "flex justify-between items-center pl-4 pr-3 py-2 border-r-[1px]",
                                    "transition-colors bg-transparent duration-300 dark:hover:bg-neutral-700 hover:bg-neutral-200",
                                    activeTab === idx
                                        ? "border-accent-primary-500 dark:bg-neutral-700/30 bg-neutral-200/40"
                                        : "border-transparent",
                                ].join(" ")}
                            >
                                <p>{tab.name}</p>
                                <div className="h-6 w-6">
                                    <ChevronRightIcon className="text-neutral-500" />
                                </div>
                            </Link>
                        ))}
                    </nav>
                </div>
                <div
                    className={`lg:flex ${
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
                        <h2 className="text-black dark:text-white font-semibold text-xl my-2">
                            {title}
                        </h2>
                    </div>

                    {description && (
                        <p className="px-3 text-sm text-neutral-500">
                            {description}
                        </p>
                    )}

                    <main className="overflow-hidden">{children}</main>
                </div>
                <div className="w-1/6 grow-0 border-l-[1px] lg:block hidden border-highlight-light dark:border-highlight-dark"></div>
                <SpeedInsights />
            </body>
        </>
    );
}
