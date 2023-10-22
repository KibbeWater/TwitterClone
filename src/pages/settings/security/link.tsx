import { signIn } from "next-auth/react";
import Image from "next/image";
import { useCallback } from "react";

import SettingsLayout from "~/components/Site/Layouts/SettingsLayout";
import { api } from "~/utils/api";

function OAuthButton({
    friendlyName,
    provider,
    imageUrl,
    isLoading,
    isUnlinking,
    checkIsLinked,
    handleUnlink,
}: {
    friendlyName: string;
    provider: string;
    imageUrl: string;
    isLoading: boolean;
    isUnlinking: boolean;
    checkIsLinked: (provider: string) => boolean;
    handleUnlink: (provider: string) => void;
}) {
    return (
        <div className="flex justify-between items-center py-2">
            <div className="flex gap-4 items-center dark:bg-white bg-transparent text-black font-semibold px-2 py-1 rounded-md">
                {imageUrl && (
                    <Image
                        width={20}
                        height={20}
                        alt={friendlyName + " Logo"}
                        unoptimized={true}
                        src={imageUrl}
                    />
                )}
                <p>{friendlyName}</p>
            </div>
            {isLoading ? (
                <button
                    key={`${provider}-link-btn`}
                    disabled={isLoading}
                    className="py-1 px-3 bg-neutral-600 dark:disabled:bg-neutral-400 transition-colors duration-300 text-white dark:text-black rounded-full"
                >
                    Loading...
                </button>
            ) : !checkIsLinked(provider) ? (
                <button
                    key={`${provider}-link-btn`}
                    disabled={isLoading}
                    onClick={() => {
                        signIn(provider).catch(console.error);
                    }}
                    className="py-1 px-3 bg-black hover:bg-neutral-700 disabled:bg-neutral-600 dark:bg-white dark:hover:bg-neutral-300 dark:disabled:bg-neutral-400 transition-colors duration-300 text-white dark:text-black rounded-full"
                >
                    Link Account
                </button>
            ) : (
                <button
                    key={`${provider}-link-btn`}
                    disabled={isUnlinking}
                    onClick={() => handleUnlink(provider)}
                    className="py-1 px-3 bg-red-500 hover:bg-red-700 disabled:bg-red-900 transition-colors duration-300 text-white rounded-full"
                >
                    Unlink Account
                </button>
            )}
        </div>
    );
}

export default function SecurityLink() {
    const {
        data: linkedAccounts,
        isLoading,
        refetch: _reloadLinkedAccounts,
    } = api.user.getLinkedAccounts.useQuery({});

    const { mutate: _unlinkProvider, isLoading: isUnlinking } =
        api.user.unlinkAccount.useMutation({
            onSettled: () => _reloadLinkedAccounts,
        });

    const handleUnlink = useCallback<(provider: string) => void>(
        (p) => {
            if (
                linkedAccounts?.length === 1 &&
                !confirm(
                    "You are about to unlink your last OAuth provider, this will lock you out of your account unless you have an email set. Are you sure you want to continue?",
                )
            )
                return;
            _unlinkProvider(
                { provider: p },
                {
                    onSuccess: () => {
                        _reloadLinkedAccounts().catch(console.error);
                    },
                },
            );
        },
        [_unlinkProvider, linkedAccounts, _reloadLinkedAccounts],
    );

    const isLinked = useCallback<(provider: string) => boolean>(
        (p) => linkedAccounts?.includes(p.toLowerCase()) ?? false,
        [linkedAccounts],
    );

    return (
        <SettingsLayout title="Linked accounts">
            <div className="flex flex-col gap-2 px-3">
                <OAuthButton
                    friendlyName="Apple"
                    provider="apple"
                    imageUrl={`/assets/imgs/providers/apple.svg`}
                    isLoading={isLoading}
                    isUnlinking={isUnlinking}
                    checkIsLinked={isLinked}
                    handleUnlink={handleUnlink}
                />
                <OAuthButton
                    friendlyName="Google"
                    provider="google"
                    imageUrl={`/assets/imgs/providers/google.svg`}
                    isLoading={isLoading}
                    isUnlinking={isUnlinking}
                    checkIsLinked={isLinked}
                    handleUnlink={handleUnlink}
                />
                {/* <div className="flex justify-between items-center py-2">
                    <div className="flex gap-4 items-center dark:bg-white bg-transparent text-black font-semibold px-2 py-1 rounded-md">
                        <Image
                            width={20}
                            height={20}
                            alt="Apple Logo"
                            unoptimized={true}
                            src={`/assets/imgs/providers/apple.svg `}
                        />
                        <p>Apple</p>
                    </div>
                    {isLoading ? (
                        <button
                            key="apple-link-btn"
                            disabled={isLoading}
                            className="py-1 px-3 bg-neutral-600 dark:disabled:bg-neutral-400 transition-colors duration-300 text-white dark:text-black rounded-full"
                        >
                            Loading...
                        </button>
                    ) : !isLinked("apple") ? (
                        <button
                            key="apple-link-btn"
                            disabled={isLoading}
                            onClick={() => {
                                signIn("apple").catch(console.error);
                            }}
                            className="py-1 px-3 bg-black hover:bg-neutral-700 disabled:bg-neutral-600 dark:bg-white dark:hover:bg-neutral-300 dark:disabled:bg-neutral-400 transition-colors duration-300 text-white dark:text-black rounded-full"
                        >
                            Link Account
                        </button>
                    ) : (
                        <button
                            key="apple-link-btn"
                            disabled={isUnlinking}
                            onClick={() => handleUnlink("apple")}
                            className="py-1 px-3 bg-red-500 hover:bg-red-700 disabled:bg-red-900 transition-colors duration-300 text-white rounded-full"
                        >
                            Unlink Account
                        </button>
                    )}
                </div> */}
                {/* <div className="flex justify-between items-center py-2">
                    <div className="flex gap-4 items-center dark:bg-white bg-transparent text-black font-semibold px-2 py-1 rounded-md">
                        <Image
                            width={20}
                            height={20}
                            alt="Google Logo"
                            src="/assets/imgs/providers/google.svg"
                        />
                        <p>Google</p>
                    </div>

                    {isLoading ? (
                        <button
                            key="google-link-btn"
                            disabled={isLoading}
                            className="py-1 px-3 bg-neutral-600 dark:disabled:bg-neutral-400 transition-colors duration-300 text-white dark:text-black rounded-full"
                        >
                            Loading...
                        </button>
                    ) : !isLinked("google") ? (
                        <button
                            key="google-link-btn"
                            disabled={isLoading}
                            onClick={() => {
                                signIn("google").catch(console.error);
                            }}
                            className="py-1 px-3 bg-black hover:bg-neutral-700 disabled:bg-neutral-600 dark:bg-white dark:hover:bg-neutral-300 dark:disabled:bg-neutral-400 transition-colors duration-300 text-white dark:text-black rounded-full"
                        >
                            Link Account
                        </button>
                    ) : (
                        <button
                            key="google-link-btn"
                            disabled={isUnlinking}
                            onClick={() => handleUnlink("google")}
                            className="py-1 px-3 bg-red-500 hover:bg-red-700 disabled:bg-red-900 transition-colors duration-300 text-white rounded-full"
                        >
                            Unlink Account
                        </button>
                    )}
                </div> */}
                <p className="text-xs px-3 text-neutral-500">
                    Please tread with caution!
                    <br />
                    <br />
                    Removing a linked OAuth provider may lock you out of your
                    account, please make sure you have an email set!
                </p>
            </div>
        </SettingsLayout>
    );
}
