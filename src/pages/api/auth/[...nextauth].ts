import NextAuth from "next-auth";
import type { NextApiRequest, NextApiResponse } from "next";

import { authOptions } from "~/server/auth";
import { prisma } from "~/server/db";

export default async function auth(req: NextApiRequest, res: NextApiResponse) {
    const userAgent = req.headers["user-agent"] ?? null;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return await NextAuth(req, res, {
        ...authOptions,
        callbacks: {
            session: async (params) => {
                const { session, user } = params;

                // TODO: We probably should not do this, investigate later
                const [usr, sessions] = await prisma.$transaction([
                    prisma.user.findUnique({
                        where: { id: user.id },
                        select: { roles: true },
                    }),
                    prisma.session.findMany({
                        where: { expires: session.expires },
                    }),
                    prisma.session.updateMany({
                        where: { expires: session.expires },
                        data: { lastAccessed: new Date() },
                    }),
                ]);

                let updatedSession: { userAgent: string | null } | undefined;
                if (
                    sessions.length === 1 &&
                    userAgent != sessions[0]!.userAgent
                )
                    updatedSession = await prisma.session.update({
                        where: { id: sessions[0]!.id },
                        data: {
                            userAgent,
                        },
                        select: { userAgent: true },
                    });

                return {
                    ...session,
                    userAgent: updatedSession?.userAgent ?? userAgent,
                    user: {
                        ...session.user,
                        id: user.id,
                        tag: user.tag,
                        lastTagReset: user.lastTagReset,
                        roles: usr?.roles ?? [],
                        verified: user.verified,
                        permissions: user.permissions,
                    },
                };
            },
        },
    });
}
