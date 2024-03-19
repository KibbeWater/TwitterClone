import type { NextApiRequest, NextApiResponse } from "next";
import verifyAppleToken from "verify-apple-id-token";
import { z } from "zod";
import { env } from "~/env.mjs";
import { prisma } from "~/server/db";

async function authenticate(req: NextApiRequest, res: NextApiResponse) {
    const bodyShape = z.object({
        idToken: z.string().min(1),
    });

    const body = bodyShape.safeParse(req.body);
    if (!body.success)
        return res
            .status(400)
            .send({ success: false, message: body.error.message });

    const appleAccount = await verifyAppleToken({
        idToken: body.data.idToken,
        // Supports a secondary ID for a companion app
        clientId: [env.APPLE_ID, env.APPLE_APP_ID ?? undefined].filter(
            Boolean,
        ) as string[],
    });

    const userIdentification = appleAccount.sub;

    const user = await prisma.user.findFirst({
        where: {
            accounts: {
                some: {
                    type: "oauth",
                    provider: "apple",
                    providerAccountId: userIdentification,
                },
            },
        },
    });

    if (!user)
        return res.status(404).send({
            success: false,
            message: "User not found",
        });

    const sessionToken = crypto.randomUUID();
    const newSession = await prisma.session.create({
        data: {
            user: {
                connect: {
                    id: user.id,
                },
            },
            sessionToken,
            expires: new Date(Date.now() + 2592000), // 30 days
            userAgent: req.headers["user-agent"],
        },
        select: {
            user: {
                select: {
                    name: true,
                    email: true,
                    image: true,
                    id: true,
                    tag: true,
                    lastTagReset: true,
                    roles: {
                        select: {
                            id: true,
                            name: true,
                            permissions: true,
                        },
                    },
                    verified: true,
                    permissions: true,
                },
            },
            expires: true,
            userAgent: true,
        },
    });

    return res.status(200).send({
        success: true,
        data: {
            userIdentification,
            sessionToken,
            session: newSession,
        },
    });
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    switch (req.method) {
        case "POST":
            return await authenticate(req, res);
        default:
            return res.status(405).send({ message: "Method not allowed" });
    }
}
