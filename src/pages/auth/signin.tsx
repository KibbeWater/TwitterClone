/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type {
    GetServerSidePropsContext,
    InferGetServerSidePropsType,
} from "next";
import Image from "next/image";
import { useRef } from "react";
import { type ClientSafeProvider, getProviders, signIn } from "next-auth/react";

import { getServerAuthSession } from "~/server/auth";
import { useTheme } from "next-themes";

type ProviderOptions = Record<
    string,
    {
        hasLogo: boolean;
        hasDarkLogo: boolean;
        themeOverride?: {
            dark?: string;
            light?: string;
            textDark?: string;
            textLight?: string;
        };
    }
>;

/* const errors = {
    Signin: "Try signing in with a different account.",
    OAuthSignin: "Try signing in with a different account.",
    OAuthCallback: "Try signing in with a different account.",
    OAuthCreateAccount: "Try signing in with a different account.",
    EmailCreateAccount: "Try signing in with a different account.",
    Callback: "Try signing in with a different account.",
    OAuthAccountNotLinked:
        "To confirm your identity, sign in with the same account you used originally.",
    EmailSignin: "The e-mail could not be sent.",
    CredentialsSignin:
        "Sign in failed. Check the details you provided are correct.",
    SessionRequired: "Please sign in to access this page.",
    default: "Unable to sign in.",
}; */

const logos = "/assets/imgs/providers/";

function ProviderButton({
    provider,
    options,
}: {
    provider: ClientSafeProvider;
    options: ProviderOptions;
}) {
    const { theme } = useTheme();

    const providerOptions = options[provider.id];

    const emailRef = useRef<HTMLInputElement>(null);
    const usernameRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);

    return (
        <>
            {(provider.type === "email" || provider.type === "credentials") && (
                <>
                    <label className="flex flex-col w-full">
                        {provider.type === "email" ? "Email" : "New Email"}
                        <input
                            ref={emailRef}
                            type="email"
                            id="email"
                            name="email"
                            className="pl-3 py-1 rounded-md border-[1px] dark:border-gray-300 border-gray-600 bg-transparent"
                        />
                    </label>
                </>
            )}
            {provider.type === "credentials" && (
                <>
                    <label className="flex flex-col w-full">
                        Username
                        <input
                            ref={usernameRef}
                            type="text"
                            id="username"
                            name="username"
                            className="pl-3 py-1 rounded-md border-[1px] dark:border-gray-300 border-gray-600 bg-transparent"
                        />
                    </label>
                    <label className="flex flex-col w-full">
                        Password
                        <input
                            ref={passwordRef}
                            type="password"
                            id="password"
                            name="password"
                            className="pl-3 py-1 rounded-md border-[1px] dark:border-gray-300 border-gray-600 bg-transparent"
                        />
                    </label>
                </>
            )}
            <button
                key={provider.name}
                className="mx-4 py-4 px-3 bg-black flex w-full rounded-lg"
                style={{
                    backgroundColor:
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        providerOptions?.themeOverride?.[theme ?? "light"] ??
                        (theme === "dark" ? "#000000" : "#ffffff"),
                    color:
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        providerOptions?.themeOverride?.[
                            `text${
                                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                // @ts-ignore
                                theme?.charAt(0).toUpperCase() +
                                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                // @ts-ignore
                                theme?.slice(1)
                            }`
                        ] ?? (theme === "dark" ? "#ffffff" : "#000000"),
                }}
                onClick={() => {
                    switch (provider.type) {
                        case "email":
                            console.log(provider.id, {
                                email: emailRef.current?.value,
                            });
                            break;
                        case "credentials":
                            console.log(provider.id, {
                                newEmail: emailRef.current?.value,
                                username: usernameRef.current?.value,
                                password: passwordRef.current?.value,
                            });
                            break;
                        default:
                            console.log(provider.id);
                            break;
                    }

                    if (provider.type === "email")
                        signIn(provider.id, {
                            email: emailRef.current?.value,
                        }).catch(console.error);
                    else if (provider.type === "credentials")
                        signIn(provider.id, {
                            newEmail: emailRef.current?.value,
                            username: usernameRef.current?.value,
                            password: passwordRef.current?.value,
                        }).catch(console.error);
                    else signIn(provider.id).catch(console.error);
                }}
            >
                {providerOptions?.hasLogo && (
                    <Image
                        src={`${logos}${provider.id}${
                            providerOptions.hasDarkLogo && theme === "dark"
                                ? "-dark"
                                : ""
                        }.svg`}
                        width={24}
                        height={24}
                        alt={provider.name}
                        className="h-6 w-6 grow-0"
                    />
                )}
                <p className="grow text-center">Sign in with {provider.name}</p>
            </button>
        </>
    );
}

export default function SignIn({
    providers,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
    const knownAuthProviders: ProviderOptions = {
        migration_login: {
            hasLogo: false,
            hasDarkLogo: false,
            themeOverride: {
                dark: "rgb(55 65 81)",
                light: "rgb(156 163 175)",
                textDark: "#ffffff",
                textLight: "#f1f1f1",
            },
        },
        email: {
            hasLogo: false,
            hasDarkLogo: false,
            themeOverride: {
                dark: "#c72e2e",
                light: "#c72e2e",
                textDark: "#ffffff",
                textLight: "#ffffff",
            },
        },
        apple: {
            hasLogo: true,
            hasDarkLogo: true,
        },
        google: {
            hasLogo: true,
            hasDarkLogo: false,
            themeOverride: {
                dark: "#ffffff",
                light: "#ffffff",
                textDark: "#000000",
                textLight: "#000000",
            },
        },
    };

    return (
        <>
            <style jsx global>{`
                .or {
                    width: 100%;
                    text-align: center;
                    border: 0;
                    border-top: 1px solid rgb(156 163 175);
                    display: block;
                    margin: 2rem auto 1rem;
                    overflow: visible;

                    margin-block-start: 0.5em;
                    margin-block-end: 0.5em;
                    margin-inline-start: auto;
                    margin-inline-end: auto;
                }
                .or:before {
                    background-color: rgb(209 213 219);
                    color: #888888;
                    content: "or";
                    padding: 0 0.4rem;
                    position: relative;
                    top: -0.85rem;
                }
                .dark .or {
                    border-top: 1px solid rgb(55 65 81);
                }
                .dark .or:before {
                    background-color: rgb(31 41 55);
                }
            `}</style>
            <div className="flex flex-col gap-4 w-screen h-screen justify-center items-center dark:bg-gray-900 bg-gray-50">
                <div className="bg-red-700 px-12 py-3 rounded-lg text-white">
                    <p className="text-xl">Returning user?</p>
                    <p>
                        Please read our{" "}
                        <a href="#" className="font-semibold">
                            Migration Guide
                        </a>
                    </p>
                </div>
                <div className="py-16 px-12 flex gap-2 flex-col justify-center items-center dark:bg-gray-800 bg-gray-300 shadow-xl rounded-lg">
                    {Object.entries(providers).map(
                        ([_, provider], idx, arr) => {
                            const prevProvider = arr[idx - 1]?.[1];

                            return (
                                <>
                                    {prevProvider?.type !== provider.type &&
                                        prevProvider && (
                                            <hr
                                                key={`${provider.name}-hr`}
                                                className="or"
                                            />
                                        )}
                                    <ProviderButton
                                        key={provider.name}
                                        provider={provider}
                                        options={knownAuthProviders}
                                    />
                                </>
                            );
                        },
                    )}
                </div>
            </div>
        </>
    );
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    const session = await getServerAuthSession(ctx);

    if (session) {
        return { redirect: { destination: "/" } };
    }

    const providers = await getProviders();

    return {
        props: { providers: providers ?? [] },
    };
}
