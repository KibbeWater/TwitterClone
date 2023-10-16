import Link from "next/link";

/* eslint-disable react/no-unescaped-entities */
export default function Migration() {
    return (
        <div className="pl-8 py-12 flex flex-col gap-4 w-3/6 overflow-hidden dark:text-white text-black">
            <h1 className="text-5xl font-bold mb-8">Migration</h1>
            <div>
                <h2 className="text-2xl mb-1 font-semibold">
                    What happened to my Account?
                </h2>
                <p className="dark:text-neutral-300 text-neutral-700">
                    As we are switching our backend infrastructure to provide
                    more performance and safety to our platform, we've been
                    forced to migrate to a new Database. Don't worry though! All
                    your posts and profiles are still there. But you will have
                    to add an email to your account as we are removing the
                    password login.
                </p>
            </div>
            <div>
                <h2 className="text-2xl mb-1 font-semibold">
                    Migrating your account
                </h2>
                <p className="dark:text-neutral-300 text-neutral-700">
                    To begin migrating your account, you will have to begin by
                    navigating to the{" "}
                    <Link
                        className="text-accent-primary-500 hover:text-accent-primary-700 transition-colors font-semibold"
                        href="/auth/migrate"
                    >
                        Login Page
                    </Link>
                    . Once you are there, you will have to sign in with your
                    original username (tag) and password. Then fill in an email
                    address and press the Migrate Account button! You will be
                    then be redirected to the normal email login page. You
                    should recive an email with a link to login to your account.
                </p>
            </div>
        </div>
    );
}
