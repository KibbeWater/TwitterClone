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
                const res = await authOptions.callbacks?.session?.(params);
                const { session } = params;

                // TODO: We probably should not do this, investigate later
                const sessions = await prisma.session.findMany({
                    where: { expires: session.expires },
                });

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
                    ...res!,
                    userAgent: updatedSession?.userAgent ?? userAgent,
                };
            },
        },
    });
}
