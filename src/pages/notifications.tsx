import { Notification } from "@prisma/client";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { useCallback, useEffect, useMemo } from "react";
import { useInView } from "react-intersection-observer";

import Layout from "~/components/Site/Layouts/Layout";
import { authOptions, getServerAuthSession } from "~/server/auth";
import { api } from "~/utils/api";
import NotificationComponent from "~/components/Notification";
import { ArrowPathIcon } from "@heroicons/react/24/solid";

export const getServerSideProps = (async (ctx) => {
    const session = await getServerAuthSession(ctx);

    if (!session)
        return {
            redirect: {
                destination: authOptions.pages?.signIn ?? "/",
                permanent: false,
            },
        };

    return {
        props: {},
    };
}) satisfies GetServerSideProps;

export default function NotificationsPage({}: InferGetServerSidePropsType<
    typeof getServerSideProps
>) {
    const { data, fetchNextPage, isLoading } =
        api.notifications.getNotifications.useInfiniteQuery(
            {},
            {
                getNextPageParam: (lastPage) => lastPage.nextCursor,
            },
        );

    const handleFetchNextPage = useCallback(async () => {
        await fetchNextPage();
    }, [fetchNextPage]);

    const { ref: loadingRef, inView } = useInView();

    useEffect(() => {
        if (inView) handleFetchNextPage().catch(console.error);
    }, [inView, handleFetchNextPage]);

    const notifications = useMemo(
        () =>
            data?.pages.reduce(
                (acc, cur) => [...acc, ...cur.items],
                [] as (Notification & {
                    targets: {
                        id: string;
                        name: string | null;
                        tag: string | null;
                        image: string | null;
                    }[];
                })[],
            ) ?? [],
        [data?.pages],
    );

    return (
        <Layout title="Notifications">
            {notifications.map((notification) => (
                <div
                    key={`notification-${notification.id}`}
                    className="border-b-[1px] border-gray-200 dark:border-gray-700 w-full"
                >
                    <NotificationComponent notif={notification} />
                </div>
            ))}
            <div
                className={
                    "w-full mt-4 flex justify-center items-center" +
                    (!isLoading ? " invisible" : " visible")
                }
                ref={loadingRef}
            >
                <ArrowPathIcon
                    className={
                        "animate-spin h-[1.5em] text-black dark:text-white"
                    }
                />
            </div>
        </Layout>
    );
}
