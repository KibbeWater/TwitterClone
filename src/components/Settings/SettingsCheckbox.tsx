import { CheckIcon } from "@heroicons/react/20/solid";

import type { SettingComponentProps } from "~/types/settings";

export default function SettingsCheckbox({
    newSeparator,
    title,
    description,
    onChange,
    value,
    disabled,
}: SettingComponentProps & {
    onChange?: (newValue: boolean) => void;
    value?: boolean;
    disabled?: boolean;
}) {
    return (
        <div
            className={[
                "flex items-center py-3 px-3",
                newSeparator &&
                    "border-t-[1px] border-highlight-light dark:border-highlight-dark",
            ].join(" ")}
        >
            <div className="flex items-center justify-between w-full">
                <div className="flex flex-col w-full">
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-sm">{title}</h3>
                        <div
                            onClick={() => !disabled && onChange?.(!value)}
                            className={[
                                "h-5 w-5 border-[2px] border-neutral-400 dark:border-neutral-600 bg-transparent transition-colors cursor-pointer rounded-[.2rem]",
                                value &&
                                    "!bg-accent-primary-500 !border-transparent",
                                disabled && "!cursor-default opacity-50",
                            ].join(" ")}
                        >
                            <CheckIcon
                                className={[
                                    "text-white opacity-1 transition-opacity select-none",
                                    !value && "opacity-0",
                                ].join(" ")}
                            />
                        </div>
                    </div>
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
