import Head from "next/head";
import Navbar from "./Navbar";

type LayoutProps = {
    title?: string;
    children?: React.ReactNode;
};

export default function Layout({ title, children }: LayoutProps) {
    return (
        <>
            <Head>
                <title>{`Twatter${title ? ` - ${title}` : ""}`}</title>
            </Head>
            <div className="parent w-screen h-screen flex">
                <Navbar />
                <main className={"flex-1 overflow-y-auto scrollbar-hide"}>
                    {children}
                </main>
                {/* <Filters /> */}
            </div>
        </>
    );
}
