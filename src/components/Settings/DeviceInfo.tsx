import { ChevronRightIcon } from "@heroicons/react/24/solid";
import {
    ComputerDesktopIcon,
    DevicePhoneMobileIcon,
    GlobeAmericasIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

export default function DeviceInfo({
    sessionId,
    name,
    device,
    active,
    noNav = false,
}: {
    sessionId: string;
    name: string;
    device: "desktop" | "mobile" | "unknown";
    active: true | string;
    noNav?: boolean;
}) {
    const Icon =
        device === "desktop"
            ? ComputerDesktopIcon
            : device === "mobile"
            ? DevicePhoneMobileIcon
            : GlobeAmericasIcon;

    return !noNav ? (
        <Link
            href={`/settings/security/sessions/${sessionId}`}
            className="flex items-center justify-between px-3 py-3 dark:hover:bg-gray-400/10 hover:bg-gray-600/10 transition-colors"
        >
            <div className="flex gap-4">
                <div className="flex w-12 h-12 items-center justify-center rounded-full border-[1px] border-neutral-500">
                    <Icon className="text-black dark:text-white w-6 h-6" />
                </div>
                <div className="flex flex-col">
                    <p>{name}</p>
                    {active === true ? (
                        <div className="bg-accent-primary-500 px-1 pb-1 pt-[2px] rounded-md w-min whitespace-nowrap">
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
    ) : (
        <div className="flex items-center px-3 py-3">
            <div className="flex gap-4">
                <div className="flex w-12 h-12 items-center justify-center rounded-full border-[1px] border-neutral-500">
                    <Icon className="text-black dark:text-white w-7 h-7" />
                </div>
                <div className="flex flex-col">
                    <p>{name}</p>
                    {active === true ? (
                        <div className="bg-accent-primary-500 px-1 pb-1 pt-[2px] rounded-md w-min whitespace-nowrap">
                            <p className="leading-none text-xs p-0">
                                Active now
                            </p>
                        </div>
                    ) : (
                        <p className="text-neutral-500 text-xs">{active}</p>
                    )}
                </div>
            </div>
        </div>
    );
}
