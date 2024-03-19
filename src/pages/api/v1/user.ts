import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { getServerAuthSession } from "~/server/auth";
import { prisma } from "~/server/db";
import { apiFullUserShape, apiPublicUserShape } from "./post";

async function getUser(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerAuthSession({ req, res });

    const bodyShape = z.union([
        z.object({}),
        z.object({
            tag: z.string(),
        }),
        z.object({
            id: z.string(),
        }),
    ]);

    const body = bodyShape.safeParse(req.query);
    if (!body.success)
        return res
            .status(400)
            .send({ success: false, message: body.error.message });

    const input = body.data;

    if ("id" in input)
        return res.status(200).send({
            success: true,
            data: await prisma.user.findMany({
                where: {
                    id: input.id,
                },
                select: apiPublicUserShape,
            }),
        });
    else if ("tag" in input)
        return res.status(200).send({
            success: true,
            data: await prisma.user.findMany({
                where: {
                    tag: input.tag,
                },
                select: apiPublicUserShape,
            }),
        });
    else if (session) {
        return res.status(200).send({
            success: true,
            data: await prisma.user.findFirst({
                where: {
                    id: session.user.id,
                },
                select: apiFullUserShape,
            }),
        });
    } else
        return res.status(400).send({
            success: false,
            message: "Invalid input",
        });
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    switch (req.method) {
        case "GET":
            return await getUser(req, res);
        default:
            return res.status(405).send({ message: "Method not allowed" });
    }
}
