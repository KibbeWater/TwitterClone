import { ArrowsRightLeftIcon } from "@heroicons/react/24/outline";

import SettingLink from "~/components/Settings/SettingLink";
import SettingsLayout from "~/components/Site/Layouts/SettingsLayout";

export default function Settings() {
    return (
        <SettingsLayout
            title="Security and account access"
            description="Manage your account’s security and keep track of who is logged in and where."
            canBack={false}
        >
            <SettingLink
                title="Linked accounts"
                description="Manage your OAuth linked accounts. (Google, Apple, etc...)"
                href="/settings/security/link"
                icon={ArrowsRightLeftIcon}
            />
        </SettingsLayout>
    );
}
