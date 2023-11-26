import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { postShape } from "~/server/api/shapes";

import { prisma } from "~/server/db";

async function get(req: NextApiRequest, res: NextApiResponse) {
    const querySchema = z.object({
        id: z.string().optional(),
        limit: z.string().optional(),
        cursor: z.string().nullish(),
        skip: z.string().optional(),
    });

    const validationResult = querySchema.safeParse(req.query);

    if (!validationResult.success)
        return res.status(400).json({
            success: false,
            message: "Invalid query",
            errors: validationResult.error,
        });

    const { limit: _limit, cursor, skip: _skip, id } = validationResult.data;

    if (id)
        return res.status(400).json({
            success: true,
            data: await prisma.post.findUnique({
                where: { id },
                select: postShape,
            }),
        });

    const limit = parseInt(_limit ?? "10") ?? 10;
    const skip = parseInt(_skip ?? "0") ?? 0;

    const posts = await prisma.post.findMany({
        take: limit,
        skip,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: "desc" },
        select: postShape,
    });

    return res.status(200).json({
        success: true,
        data: posts,
    });
}
export default function handle(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        case "GET":
            return get(req, res);
        default:
            res.status(405).json({
                success: false,
                message: "Method not allowed",
            });
            break;
    }
}
