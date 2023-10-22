import { ArrowPathIcon } from "@heroicons/react/24/solid";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useCallback, useMemo } from "react";
import { UAParser } from "ua-parser-js";

import DeviceInfo from "~/components/Settings/DeviceInfo";
import SettingsLayout from "~/components/Site/Layouts/SettingsLayout";
import { api } from "~/utils/api";

export default function SessionInfo() {
    const router = useRouter();
    const { sessionId } = router.query;

    const { data: mySession } = useSession();

    const { data: _session, refetch: _reloadSessions } =
        api.user.getSession.useQuery(
            { id: sessionId! as string },
            { enabled: typeof sessionId === "string" },
        );

    const { mutate: _deleteSessions, isLoading: isDeletingSessions } =
        api.user.logOutSessions.useMutation({
            onSuccess: () => _reloadSessions(),
        });

    const logOutSession = useCallback(() => {
        if (!_session) return;
        _deleteSessions({
            sessions: [_session.id],
        });
    }, [_session, _deleteSessions]);

    const session = useMemo(() => {
        if (!_session) return null;
        return {
            ..._session,
            userAgent: new UAParser(_session.userAgent ?? undefined),
        };
    }, [_session]);

    const getPlatform = (agent: UAParser.UAParserInstance) => {
        if (agent.getDevice().type) return "mobile";
        const isCommonDesktopArch = ["ia32", "ia64", "amd64"].includes(
            agent.getCPU().architecture ?? "undef",
        );
        if (isCommonDesktopArch) return "desktop";
        return "unknown";
    };

    const getLastAccessed = (lastAccess: Date) => {
        const diff = Date.now() - lastAccess.getTime();
        const minutes = Math.floor(diff / 1000 / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const months = Math.floor(days / 30);
        const years = Math.floor(months / 12);
        if (years > 0) return `${years} years ago`;
        if (months > 0) return `${months} months ago`;
        if (days > 0) return `${days} days ago`;
        if (hours > 0) return `${hours} hours ago`;
        if (minutes > 0) return `${minutes} minutes ago`;
        return true;
    };

    return (
        <SettingsLayout title={session?.userAgent.getBrowser().name}>
            <DeviceInfo
                sessionId={session?.id ?? "unknown"}
                name={session?.userAgent.getBrowser().name ?? "Unknown"}
                device={session ? getPlatform(session.userAgent) : "unknown"}
                active={session ? getLastAccessed(session.lastAccessed) : "N/A"}
                noNav
            />
            <div className="p-3 border-t-[1px] border-gray-200 dark:border-gray-700 flex flex-col gap-4">
                <h3 className="font-bold text-xl">Date and time</h3>
                <p className="text-neutral-500 text-xs">
                    {/* Ex: Oct 22, 2023, 6:55 AM */}
                    {session?.lastAccessed.toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "numeric",
                        minute: "numeric",
                        hour12: true,
                    })}
                </p>
            </div>
            {mySession &&
                new Date(mySession.expires).getTime() !==
                    session?.expires.getTime() && (
                    <button
                        onClick={logOutSession}
                        disabled={isDeletingSessions}
                        className="flex items-center justify-center bg-transparent hover:bg-red-800/10 px-3 py-3 text-red-600 disabled:text-red-800 transition-colors w-full text-sm border-t-[1px] border-gray-200 dark:border-gray-700 "
                    >
                        <div
                            className={`mr-2 h-[1em] ${
                                isDeletingSessions ? "block" : "hidden"
                            }`}
                        >
                            <ArrowPathIcon className="h-full animate-spin" />
                        </div>
                        Log out the device shown
                    </button>
                )}
        </SettingsLayout>
    );
}
