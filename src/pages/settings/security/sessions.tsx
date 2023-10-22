import { ArrowPathIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import {
    ComputerDesktopIcon,
    DevicePhoneMobileIcon,
    GlobeAmericasIcon,
} from "@heroicons/react/24/outline";
import SettingsLayout from "~/components/Site/Layouts/SettingsLayout";
import { api } from "~/utils/api";
import Link from "next/link";
import { useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";

function DeviceItem({
    sessionId,
    name,
    device,
    active,
}: {
    sessionId: string;
    name: string;
    device: "desktop" | "mobile" | "unknown";
    active: true | string;
}) {
    const Icon =
        device === "desktop"
            ? ComputerDesktopIcon
            : device === "mobile"
            ? DevicePhoneMobileIcon
            : GlobeAmericasIcon;

    return (
        <Link
            href={`/settings/security/sessions/${sessionId}`}
            className="flex items-center justify-between px-3 py-3 dark:hover:bg-gray-400/10 hover:bg-gray-600/10 transition-colors"
        >
            <div className="flex gap-4">
                <div className="flex w-12 h-12 items-center justify-center rounded-full border-[1px] border-neutral-500">
                    <Icon className="text-black dark:text-white w-7 h-7" />
                </div>
                <div className="flex flex-col">
                    <p>{name}</p>
                    {active === true ? (
                        <div className="bg-accent-primary-500 px-1 pb-1 pt-[2px] rounded-md">
                            <p className="leading-none text-xs p-0">
                                Active now
                            </p>
                        </div>
                    ) : (
                        <p className="text-neutral-500 text-xs">{active}</p>
                    )}
                </div>
            </div>
            <div className="w-5 h-5">
                <ChevronRightIcon className="text-neutral-500" />
            </div>
        </Link>
    );
}

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

    const currentSession = useMemo(
        () =>
            sessions?.find(
                (s) =>
                    s.expires.getDate() ===
                    new Date(session?.expires ?? 0).getDate(),
            ),
        [sessions, session],
    );

    const otherSessions = useMemo(
        () =>
            sessions?.filter(
                (s) =>
                    s.expires.getDate() !==
                    new Date(session?.expires ?? 0).getDate(),
            ),
        [sessions, session],
    );

    const logOutOtherSessions = useCallback(() => {
        if (!otherSessions) return;
        _deleteSessions({
            sessions: otherSessions.map((s) => s.id),
        });
    }, [otherSessions, _deleteSessions]);

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
                            <DeviceItem
                                sessionId={currentSession.id ?? "unknown"}
                                name="Unknown"
                                device="unknown"
                                active={true}
                            />
                        ) : (
                            <DeviceItem
                                sessionId={"unknown"}
                                name="Unable to find active session"
                                device="unknown"
                                active={"Unknown"}
                            />
                        )
                    ) : (
                        <DeviceItem
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
                            <DeviceItem
                                key={s.id}
                                sessionId={s.id}
                                name={"Unknown"}
                                device={"unknown"}
                                active={s.expires.toLocaleString()}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </SettingsLayout>
    );
}
