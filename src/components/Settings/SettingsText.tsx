import type { SettingComponentProps } from "~/types/settings";

export default function SettingsText({
    newSeparator,
    icon: Icon,
    title,
    description,
}: SettingComponentProps) {
    return (
        <div
            className={[
                "flex items-center py-3 px-3",
                newSeparator &&
                    "border-t-[1px] border-gray-200 dark:border-gray-700",
            ].join(" ")}
        >
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
        </div>
    );
}
