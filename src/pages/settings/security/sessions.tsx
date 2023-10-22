import { ArrowPathIcon } from "@heroicons/react/24/solid";
import { useSession } from "next-auth/react";
import { useCallback, useMemo } from "react";
import { UAParser } from "ua-parser-js";

import DeviceInfo from "~/components/Settings/DeviceInfo";
import SettingsLayout from "~/components/Site/Layouts/SettingsLayout";
import { api } from "~/utils/api";

export default function SecuritySessions() {
    const { data: session } = useSession();

    const {
        data: sessions,
        isLoading,
        refetch: _reloadSessions,
    } = api.user.getActiveSessions.useQuery({});
    const { mutate: _deleteSessions, isLoading: isDeletingSessions } =
        api.user.logOutSessions.useMutation({
            onSuccess: () => _reloadSessions(),
        });

    const sessionUAMapper = useCallback<
        (mapArr: {
            id: string;
            userAgent: string | null;
            expires: Date;
            lastAccessed: Date;
        }) => {
            id: string;
            userAgent: UAParser.UAParserInstance;
            expires: Date;
            lastAccessed: Date;
        }
    >(
        (obj) => ({
            ...obj,
            userAgent: new UAParser(obj.userAgent ?? undefined),
        }),
        [],
    );

    const currentSession = useMemo(() => {
        const sess = sessions?.find(
            (s) =>
                s.expires.getTime() ===
                new Date(session?.expires ?? 0).getTime(),
        );
        return sess ? sessionUAMapper(sess) : null;
    }, [session?.expires, sessions, sessionUAMapper]);

    const otherSessions = useMemo(
        () =>
            sessions
                ?.filter(
                    (s) =>
                        s.expires.getTime() !==
                        new Date(session?.expires ?? 0).getTime(),
                )
                .map(sessionUAMapper),
        [sessions, session?.expires, sessionUAMapper],
    );

    const logOutOtherSessions = useCallback(() => {
        if (!otherSessions) return;
        _deleteSessions({
            sessions: otherSessions.map((s) => s.id),
        });
    }, [otherSessions, _deleteSessions]);

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
        <SettingsLayout
            title="Sessions"
            description="Sessions are the devices you are using or that have used your Twatter account. These are the sessions where your account is currently logged in. You can log out of each session."
        >
            <div className="flex flex-col gap-5">
                <h4 className="text-black dark:text-white font-semibold text-lg px-3">
                    Current active session
                </h4>
                <p className="text-sm text-neutral-500 px-3">
                    You’re logged into this Twatter account on this device and
                    are currently using it.
                </p>
                <div className="flex flex-col border-b-[1px] border-gray-200 dark:border-gray-700">
                    {!isLoading ? (
                        currentSession ? (
                            <DeviceInfo
                                sessionId={currentSession.id ?? "unknown"}
                                name={
                                    currentSession?.userAgent.getBrowser()
                                        .name ?? "Unknown"
                                }
                                device={getPlatform(currentSession?.userAgent)}
                                active={true}
                            />
                        ) : (
                            <DeviceInfo
                                sessionId={"unknown"}
                                name="Unable to find active session"
                                device="unknown"
                                active={"Unknown"}
                            />
                        )
                    ) : (
                        <DeviceInfo
                            sessionId={"unknown"}
                            name="Loading..."
                            device="unknown"
                            active={"Loading..."}
                        />
                    )}
                </div>
            </div>
            <div className="flex flex-col gap-5 pt-3">
                <h4 className="text-black dark:text-white font-semibold text-lg px-3">
                    Log out of other sessions
                </h4>
                <p className="text-sm text-neutral-500 px-3">
                    You’re logged into these accounts on these devices and
                    aren’t currently using them.
                </p>
                <p className="text-sm text-neutral-500 px-3">
                    Logging out will end {otherSessions?.length ?? "..."} of
                    your other active sessions. It won’t affect your current
                    active session.
                </p>
                <div className="flex flex-col flex-0 overflow-hidden">
                    <button
                        onClick={logOutOtherSessions}
                        disabled={isDeletingSessions}
                        className="flex items-center bg-transparent hover:bg-red-800/10 px-3 py-2 text-red-600 disabled:text-red-800 transition-colors text-left"
                    >
                        <div
                            className={`mr-2 h-[1em] ${
                                isDeletingSessions ? "block" : "hidden"
                            }`}
                        >
                            <ArrowPathIcon className="h-full animate-spin" />
                        </div>
                        Log out of all other sessions
                    </button>
                    <div className="h-64 overflow-y-auto">
                        {otherSessions?.map((s) => (
                            <DeviceInfo
                                key={s.id}
                                sessionId={s.id}
                                name={
                                    currentSession?.userAgent.getBrowser()
                                        .name ?? "Unknown"
                                }
                                device={
                                    currentSession
                                        ? getPlatform(currentSession.userAgent)
                                        : "unknown"
                                }
                                active={getLastAccessed(s.lastAccessed)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </SettingsLayout>
    );
}
