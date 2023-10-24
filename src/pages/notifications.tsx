import { ArrowPathIcon } from "@heroicons/react/24/solid";
import type { Notification } from "@prisma/client";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useInView } from "react-intersection-observer";

import NotificationComponent from "~/components/Notification";
import Layout from "~/components/Site/Layouts/Layout";

import { authOptions, getServerAuthSession } from "~/server/auth";
import { api } from "~/utils/api";

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
    const [readIds, setReadIds] = useState<string[]>([]);

    const { data, fetchNextPage, isLoading } =
        api.notifications.getNotifications.useInfiniteQuery(
            {},
            {
                getNextPageParam: (lastPage) => lastPage.nextCursor,
            },
        );
    const { mutate: _markRead } =
        api.notifications.markNotificationRead.useMutation();

    const handleFetchNextPage = useCallback(async () => {
        await fetchNextPage();
    }, [fetchNextPage]);

    // TODO: Still some double send issue?? Fix later, fine for now
    const markRead = useCallback<(id: string) => void>(
        (id: string) => {
            if (readIds.indexOf(id) !== -1) return;
            setReadIds((prev) => [...prev, id]);
            _markRead({ id });
        },
        [_markRead, readIds],
    );

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

    const notificationList = useMemo(
        () =>
            notifications.map((notification) => (
                <div
                    key={`notification-${notification.id}`}
                    className="border-b-[1px] border-highlight-light dark:border-highlight-dark w-full"
                >
                    <NotificationComponent
                        notif={notification}
                        onInView={
                            !notification.read
                                ? () => markRead(notification.id)
                                : undefined
                        }
                    />
                </div>
            )),
        [notifications, markRead],
    );

    return (
        <Layout title="Notifications">
            {notificationList}
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
