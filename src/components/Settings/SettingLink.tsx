import { ChevronRightIcon } from "@heroicons/react/24/solid";
import Link from "next/link";

import type { SettingComponentProps } from "~/types/settings";

export default function SettingsLink({
    newSeparator,
    icon: Icon,
    title,
    description,
    href,
    onClick,
}: SettingComponentProps & { href?: string; onClick?: () => void }) {
    const content = (
        <>
            <div className="flex items-center">
                {Icon && (
                    <div className="w-5 h-5 ml-4 mr-7">
                        <Icon className="text-neutral-500" />
                    </div>
                )}
                <div className="flex flex-col">
                    <h3 className="font-semibold text-sm">{title}</h3>
                    {description && (
                        <p className="text-neutral-500 text-xs">
                            {description}
                        </p>
                    )}
                </div>
            </div>
            <div className="flex w-5 h-5">
                <ChevronRightIcon className="text-neutral-500" />
            </div>
        </>
    );

    return href ? (
        <Link
            href={href}
            className={[
                "flex items-center justify-between py-3 px-3 dark:hover:bg-gray-400/10 hover:bg-gray-600/10 transition-colors",
                newSeparator &&
                    "border-t-[1px] border-gray-200 dark:border-gray-700",
            ].join(" ")}
        >
            {content}
        </Link>
    ) : (
        onClick && (
            <button
                onClick={onClick}
                className={[
                    "flex items-center justify-between py-3 px-3 dark:hover:bg-gray-400/10 hover:bg-gray-600/10 transition-colors",
                    newSeparator &&
                        "border-t-[1px] border-gray-200 dark:border-gray-700",
                ].join(" ")}
            >
                {content}
            </button>
        )
    );
}
