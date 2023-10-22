import { UserIcon } from "@heroicons/react/24/outline";
import SettingLink from "~/components/Settings/SettingLink";
import SettingsLayout from "~/components/Site/Layouts/SettingsLayout";

export default function Settings() {
    return (
        <SettingsLayout
            title="Your Account"
            description="See information about your account, download an archive of your data, or learn about your account deactivation options"
            canBack={false}
        >
            <SettingLink
                title="Account information"
                description="See your account information like your username and email address."
                href="/settings/account/info"
                icon={UserIcon}
            />
        </SettingsLayout>
    );
}
