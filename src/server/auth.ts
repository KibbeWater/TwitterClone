import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { type GetServerSidePropsContext } from "next";
import {
    getServerSession,
    type DefaultSession,
    type NextAuthOptions,
} from "next-auth";
import AppleProvider from "next-auth/providers/apple";
// import CredentialsProvider from "next-auth/providers/credentials";
import EmailProvider from "next-auth/providers/email";
import GoogleProvide from "next-auth/providers/google";

import { env } from "~/env.mjs";
import { prisma } from "~/server/db";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
    interface Session extends DefaultSession {
        user: DefaultSession["user"] & {
            id: number;
            tag: string;
            // ...other properties
            permissions: string;
            verified: boolean;
            lastTagReset: string;
        };
    }

    interface User {
        tag: string;
        permissions: string;
        verified: boolean;
        lastTagReset: string;
    }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
    callbacks: {
        signIn: async (user) => {
            const { name, image, id } = user.user;
            if (!name || !image)
                await prisma.user.update({
                    where: { id: id as unknown as number },
                    data: {
                        name: !name ? "User" : undefined,
                        image: !image
                            ? "/assets/imgs/default-avatar.png"
                            : undefined,
                    },
                });

            return true;
        },
        session: ({ session, user }) => ({
            ...session,
            user: {
                ...session.user,
                id: user.id,
                tag: user.tag,
                lastTagReset: user.lastTagReset,
                verified: user.verified,
                permissions: user.permissions,
            },
        }),
    },
    adapter: PrismaAdapter(prisma),
    providers: [
        /* CredentialsProvider({
            id: "migration_login",
            name: "Migrated Credentials",

            credentials: {
                newEmail: { label: "New Email", type: "email" },
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" },
            },

            // fuck you NextAuth, genuinely, fuck you
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            authorize: async (credentials, _) => {
                try {
                    const { newEmail, username, password } =
                        credentialsSchema.parse(credentials);

                    // Since cred logins will only be for migration, we can apply the migration function to do the same transformation done on migration
                    const fixTags = (tag: string) => {
                        tag = tag.replace(/ /g, "-");
                        if (tag.length < 4) tag = tag.padEnd(4, "0");
                        tag = tag.slice(0, 16);
                        tag = tag.toLowerCase();

                        return tag;
                    };

                    const user = await prisma.user.findUnique({
                        where: { tag: fixTags(username) },
                    });

                    if (!user?.password) return null;

                    const passwordValid = await compare(
                        password,
                        user.password,
                    );
                    if (passwordValid === false) return null;

                    await prisma.user.update({
                        where: { id: user.id },
                        data: { email: newEmail, password: null },
                    });

                    return user;
                } catch (error) {
                    console.error(error);
                    return null;
                }
            },

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            // eslint-disable-next-line @typescript-eslint/require-await
            session: async (ssss) => {
                console.log(ssss);
            },
        }), */
        EmailProvider({
            server: env.EMAIL_SERVER,
            from: env.EMAIL_FROM,
        }),
        AppleProvider({
            clientId: env.APPLE_ID,
            clientSecret: env.APPLE_SECRET,
        }),
        GoogleProvide({
            clientId: env.GOOGLE_ID,
            clientSecret: env.GOOGLE_SECRET,
        }),
        /* DiscordProvider({
            clientId: env.DISCORD_CLIENT_ID,
            clientSecret: env.DISCORD_CLIENT_SECRET,
        }), */
        /**
         * ...add more providers here.
         *
         * Most other providers require a bit more work than the Discord provider. For example, the
         * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
         * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
         *
         * @see https://next-auth.js.org/providers/github
         */
    ],
    cookies: {
        pkceCodeVerifier: {
            name: "next-auth.pkce.code_verifier",
            options: {
                httpOnly: true,
                sameSite: "none",
                path: "/",
                secure: true,
            },
        },
    },
    /* pages: {
        signIn: "/auth/signin",
    }, */
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
    req: GetServerSidePropsContext["req"];
    res: GetServerSidePropsContext["res"];
}) => {
    return getServerSession(ctx.req, ctx.res, authOptions);
};
