import { UserIcon } from "@heroicons/react/24/outline";
import SettingLink from "~/components/Settings/SettingLink";
import SettingsLayout from "~/components/Site/Layouts/SettingsLayout";

export default function Settings() {
    return (
        <SettingsLayout
            title="Privacy and safety"
            description="Manage what information you see and share on Twatter."
            canBack={false}
        >
            <SettingLink
                title="Your Profile"
                description="Manage what information you share on Twatter."
                href="/settings/privacy/info"
                icon={UserIcon}
            />
        </SettingsLayout>
    );
}
