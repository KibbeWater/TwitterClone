import { CheckIcon } from "@heroicons/react/20/solid";
import { useCallback, useEffect, useState } from "react";
import type { SettingComponentProps } from "~/types/settings";

export default function SettingsCheckbox({
    newSeparator,
    title,
    description,
    onChange,
    value: _val,
}: SettingComponentProps & {
    onChange?: (newValue: boolean) => void;
    value?: boolean;
}) {
    const [value, setValue] = useState(_val ?? false);

    const handleChange = useCallback(
        (e: boolean) => {
            onChange?.(e);
        },
        [onChange],
    );

    useEffect(() => {
        if (_val !== undefined && _val != value) setValue(_val);
    }, [_val, value]);

    useEffect(() => {
        onChange?.(value);
    }, [value, onChange]);

    return (
        <div
            className={[
                "flex items-center py-3 px-3",
                newSeparator &&
                    "border-t-[1px] border-gray-200 dark:border-gray-700",
            ].join(" ")}
        >
            <div className="flex items-center justify-between w-full">
                <div className="flex flex-col w-full">
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-sm">{title}</h3>
                        <div
                            onClick={() => handleChange(!value)}
                            className={[
                                "h-5 w-5 border-[2px] border-gray-200 dark:border-gray-700 bg-transparent transition-colors rounded-[.2rem]",
                                value &&
                                    "!bg-accent-primary-500 !border-transparent",
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
