import Head from "next/head";
import Navbar from "../Navbar";
import { ChevronRightIcon } from "@heroicons/react/20/solid";
import { useMemo } from "react";

export default function SettingsLayout({
    children,
}: {
    children?: React.ReactNode;
}) {
    const tabs = useMemo<{ name: string }[]>(
        () => [
            { name: "Your account" },
            { name: "Security and account access" },
            { name: "Privacy and safety" },
        ],
        [],
    );

    return (
        <>
            <Head>
                <title>Twatter - Settings</title>
            </Head>
            <div className="parent w-screen h-screen flex relative bg-white dark:bg-black">
                <Navbar />

                <div className="w-1/5 border-r-[1px] border-gray-200 dark:border-gray-700">
                    <div className="pb-6">
                        <h1 className="text-black dark:text-white font-semibold text-xl my-2 ml-4">
                            Settings
                        </h1>
                    </div>
                    <nav className="flex flex-col">
                        {tabs.map((tab, idx) => (
                            <button
                                key={`${tab.name}-${idx}`}
                                className="flex justify-between items-center pl-4 pr-3 py-2 transition-colors bg-transparent duration-300 dark:hover:bg-neutral-700 hover:bg-neutral-200"
                            >
                                <p>{tab.name}</p>
                                <div className="h-6 w-6">
                                    <ChevronRightIcon className="text-neutral-500" />
                                </div>
                            </button>
                        ))}
                    </nav>
                </div>
                <main></main>
            </div>
            {children}
        </>
    );
}
