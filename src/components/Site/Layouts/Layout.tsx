import Head from "next/head";

import Navbar from "../Navbar";
import Filters from "../Filters";
import LoginBanner from "../LoginBanner";
import { useSession } from "next-auth/react";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/router";

type LayoutProps = {
    title?: string;
    children?: React.ReactNode;
};

export default function Layout({ title, children }: LayoutProps) {
    const { status } = useSession();

    const router = useRouter();

    return (
        <>
            <Head>
                <title>{`Twatter${title ? ` - ${title}` : ""}`}</title>
            </Head>
            <div className="parent w-screen h-screen flex relative">
                <Navbar />
                <div
                    className={
                        "flex-1 overflow-y-auto scrollbar-hide dark:bg-black bg-white"
                    }
                >
                    <div className="py-2 flex flex-col gap-8 border-b-[1px] border-gray-200 dark:border-gray-700">
                        <div className="ml-4 flex items-center gap-4">
                            {router.pathname !== "/home" && (
                                <div
                                    onClick={() => router.back()}
                                    className="h-full aspect-square rounded-full p-2 hover:bg-gray-600/25 transition-colors bg-transparent cursor-pointer"
                                >
                                    <ArrowLeftIcon className="h-6 w-6 text-black dark:text-white" />
                                </div>
                            )}
                            <h1 className="text-black dark:text-white font-semibold text-xl my-2">
                                {title}
                            </h1>
                        </div>
                        {/* <nav className="items-end justify-center flex">
                            <div className="hover:bg-white/30 flex-grow">
                                <div className="flex flex-col gap-3 justify-between w-min">
                                    <p className="whitespace-nowrap text-black dark:text-white text-base font-semibold">
                                        For you
                                    </p>
                                    <div className="h-1 w-full bg-accent-primary-500 rounded-md" />
                                </div>
                            </div>
                        </nav> */}
                    </div>
                    <main>{children}</main>
                </div>
                <Filters />
                {status === "unauthenticated" && (
                    <div className="absolute bottom-0 left-0 right-0 w-full">
                        <LoginBanner />
                    </div>
                )}
            </div>
        </>
    );
}
