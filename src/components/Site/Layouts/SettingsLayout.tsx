import Head from "next/head";
import Navbar from "../Navbar";
import { ChevronRightIcon } from "@heroicons/react/20/solid";

export default function SettingsLayout({
    children,
}: {
    children?: React.ReactNode;
}) {
    return (
        <>
            <Head>
                <title>Twatter - Settings</title>
            </Head>
            <div className="parent w-screen h-screen flex relative">
                <Navbar />

                <div className="w-1/5 border-r-[1px] border-gray-200 dark:border-gray-700">
                    <div className="pb-6">
                        <h1 className="text-black dark:text-white font-semibold text-xl my-2 ml-4">
                            Settings
                        </h1>
                    </div>
                    <nav className="flex flex-col">
                        <div className="flex justify-between items-center px-4 py-2 hover:bg-neutral-700">
                            <p className="text-lg">Your account</p>
                            <div className="h-8 w-8">
                                <ChevronRightIcon />
                            </div>
                        </div>
                    </nav>
                </div>
                <main></main>
            </div>
            {children}
        </>
    );
}
