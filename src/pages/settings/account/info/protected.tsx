import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import SettingsCheckbox from "~/components/Settings/SettingsCheckbox";

import SettingsLayout from "~/components/Site/Layouts/SettingsLayout";
import { api } from "~/utils/api";

export default function InfoProtected() {
    const { data: session } = useSession();

    const [isProtected, setIsProtected] = useState(
        session?.user?.protected ?? false,
    );

    const { mutate: _setProtected } = api.user.setProtected.useMutation();

    const setProtected = useCallback<(shouldProtect: boolean) => void>(
        (shouldProtect) => {
            const oldVal = isProtected;
            _setProtected(
                { protected: shouldProtect },
                { onError: () => setIsProtected(oldVal) },
            );
        },
        [_setProtected, isProtected],
    );

    const handleProtectedChange = useCallback((e: boolean) => {
        setIsProtected(e);
    }, []);

    useEffect(() => {
        setProtected(isProtected);
    }, [isProtected, setProtected]);

    useEffect(() => {
        if (session?.user) setIsProtected(session.user.protected);
    }, [session]);

    return (
        <SettingsLayout
            title="Protected Account"
            description="This is purely cosmetic for the time being, but for later you will be able to lock your profile from being viewed by anyone."
        >
            <SettingsCheckbox
                value={isProtected}
                onChange={handleProtectedChange}
                title="Protect your profile"
                description="When selected, your posts and other account information are only visible to people who follow you."
            />
        </SettingsLayout>
    );
}
