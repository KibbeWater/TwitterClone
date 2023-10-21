import SettingsLayout from "~/components/Site/Layouts/SettingsLayout";

export default function Settings() {
    return (
        <SettingsLayout
            title="Your Account"
            description="See information about your account, download an archive of your data, or learn about your account deactivation options"
            canBack={false}
        ></SettingsLayout>
    );
}
