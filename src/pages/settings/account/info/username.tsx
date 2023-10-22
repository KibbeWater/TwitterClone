import { useSession } from "next-auth/react";
import { useCallback, useEffect, useMemo, useState } from "react";

import LabelledInput from "~/components/LabelledInput";
import SettingsLayout from "~/components/Site/Layouts/SettingsLayout";

import { api } from "~/utils/api";
import { usernameRegex } from "~/utils/regexStandards";

export default function InfoUsername() {
    const [tag, setTag] = useState<string | undefined>(undefined);

    const { data: session, update: _updateSession } = useSession();
    const { mutate: _updateProfile, isLoading: isUpdating } =
        api.user.updateProfile.useMutation();

    const isTagChanged = useMemo(
        () => tag?.slice(0, 16) !== session?.user.tag?.slice(0, 16),
        [tag, session?.user.tag],
    );

    useEffect(() => {
        if (session?.user.tag) setTag(session.user.tag);
    }, [session?.user.tag]);

    const handleTagUpdate = useCallback<(t: string) => void>(
        (t) => setTag(t.toLowerCase()),
        [setTag],
    );

    const handleSave = useCallback(() => {
        _updateProfile(
            {
                tag: tag === session?.user?.tag ? undefined : tag,
            },
            {
                onSuccess: () => {
                    _updateSession().catch(console.error);
                },
                onError: (e) => {
                    console.error(e);
                    alert(e.message);
                },
            },
        );
    }, [tag, session?.user?.tag, _updateProfile, _updateSession]);

    const tagRegex = useMemo(() => /^[a-zA-Z0-9_-]{0,16}$/, []);
    const softTagRegex = useMemo(() => usernameRegex, []);

    const tagResetDate = new Date(
        new Date(session?.user.lastTagReset ?? 0).getTime() +
            30 * 24 * 60 * 60 * 1000,
    );

    const isTagResetPast = tagResetDate.getTime() < Date.now();

    return (
        <SettingsLayout title="Username">
            <div className="flex flex-col gap-4">
                <div className="relative px-3">
                    {!isTagResetPast && (
                        <p className="absolute -top-[calc(1em+0.25rem)] text-xs text-gray-500 ml-2">
                            Next tag change on {tagResetDate.toLocaleString()}
                        </p>
                    )}
                    <LabelledInput
                        onChange={handleTagUpdate}
                        value={tag}
                        maxLength={16}
                        label="Tag"
                        small={true}
                        disabled={!session?.user || !isTagResetPast}
                        validator={(t) => tagRegex.test(t)}
                        softValidator={(t) => softTagRegex.test(t)}
                        placeholder={session?.user ? undefined : "..."}
                    />
                </div>
                <div className="px-3">
                    <button
                        disabled={isUpdating || !isTagChanged}
                        className={[
                            "px-3 bg-black dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 duration-300 py-1 rounded-md",
                            "disabled:bg-neutral-500 dark:disabled:bg-neutral-500 text-white dark:text-black transition-colors",
                        ].join(" ")}
                        onClick={handleSave}
                    >
                        Save
                    </button>
                </div>
            </div>
        </SettingsLayout>
    );
}
