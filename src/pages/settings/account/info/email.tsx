import { useSession } from "next-auth/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { z } from "zod";
import LabelledInput from "~/components/LabelledInput";
import SettingsLayout from "~/components/Site/Layouts/SettingsLayout";
import { api } from "~/utils/api";

export default function InfoEmail() {
    const [email, setEmail] = useState<string | undefined>(undefined);

    const { data: session, update: _updateSession } = useSession();
    const { mutate: _updateProfile, isLoading: isUpdating } =
        api.user.updateEmail.useMutation();

    const isEmailChanged = useMemo(
        () => email !== session?.user.email,
        [email, session?.user.email],
    );

    useEffect(() => {
        if (session?.user.email) setEmail(session.user.email);
    }, [session?.user.email]);

    const handleEmailUpdate = useCallback<(t: string) => void>(
        (t) => setEmail(t.toLowerCase()),
        [setEmail],
    );

    const isEmailValid = useMemo(
        () => z.string().email().safeParse(email),
        [email],
    );

    const handleSave = useCallback(() => {
        if (!isEmailValid) return;
        _updateProfile(
            {
                email: email!,
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
    }, [email, isEmailValid, _updateProfile, _updateSession]);

    const emailValidator = useCallback<(text: string) => boolean>(
        (e: string) => z.string().email().safeParse(e).success,
        [],
    );

    return (
        <SettingsLayout title="Email">
            <div className="flex flex-col gap-4">
                <LabelledInput
                    label="Email"
                    value={email}
                    small={true}
                    onChange={handleEmailUpdate}
                    disabled={!session?.user || isUpdating}
                    softValidator={emailValidator}
                    className="mx-3"
                    placeholder={session?.user ? undefined : "..."}
                />
                <div className="px-3">
                    <button
                        onClick={handleSave}
                        disabled={!isEmailChanged || !isEmailValid.success}
                        className={[
                            "px-3 bg-black dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 duration-300 py-1 rounded-md",
                            "disabled:bg-neutral-500 dark:disabled:bg-neutral-500 text-white dark:text-black transition-colors",
                        ].join(" ")}
                    >
                        Update Email
                    </button>
                </div>
                <p className="text-xs px-3 text-neutral-500">
                    Please tread with caution! Changing to an invalid email may
                    lock you out of your account!
                </p>
            </div>
        </SettingsLayout>
    );
}
