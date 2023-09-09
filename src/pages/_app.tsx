import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import Head from "next/head";

import { ThemeProvider } from "next-themes";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import "@fortawesome/fontawesome-svg-core/styles.css";

const MyApp: AppType<{ session: Session | null }> = ({
    Component,
    pageProps: { session, ...pageProps },
}) => {
    return (
        <>
            <Head>
                <meta
                    name="description"
                    content="The place where the bird is still alive"
                />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <ThemeProvider attribute="class">
                <SessionProvider session={session}>
                    <Component {...pageProps} />
                </SessionProvider>
            </ThemeProvider>
        </>
    );
};

export default api.withTRPC(MyApp);
