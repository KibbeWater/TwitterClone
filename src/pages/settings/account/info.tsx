import { useSession } from "next-auth/react";

import SettingsLink from "~/components/Settings/SettingLink";
import SettingsText from "~/components/Settings/SettingsText";
import SettingsLayout from "~/components/Site/Layouts/SettingsLayout";

export default function AccountInfo() {
    const { data: session } = useSession();

    const { user } = session ?? { user: null };

    return (
        <SettingsLayout title="Account information">
            <SettingsLink
                title="Username"
                description={user?.tag ? `@${user.tag}` : "Loading..."}
                href="/settings/account/info/username"
            />
            <SettingsLink
                title="Email"
                description={user?.email ?? "Loading..."}
                href="/settings/account/info/email"
            />
            <SettingsText
                title="Verified"
                description={user?.verified ? "Yes." : "No."}
            />
            <SettingsLink
                title="Protected account"
                description={user?.protected ? "Yes." : "No."}
                href="/settings/account/info/protected"
                newSeparator={true}
            />
        </SettingsLayout>
    );
}
