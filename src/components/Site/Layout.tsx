import Head from "next/head";

import Navbar from "./Navbar";
import Filters from "./Filters";
import LoginBanner from "./LoginBanner";
import { useSession } from "next-auth/react";

type LayoutProps = {
    title?: string;
    children?: React.ReactNode;
};

export default function Layout({ title, children }: LayoutProps) {
    const { status } = useSession();

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
                    <div className="py-4 flex flex-col gap-8 border-b-[1px] border-gray-200 dark:border-gray-700">
                        <h1 className="text-black dark:text-white ml-4 font-semibold text-xl">
                            {title}
                        </h1>
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
