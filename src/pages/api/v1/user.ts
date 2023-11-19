import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { postShape, userShape } from "~/server/api/shapes";

import { prisma } from "~/server/db";

async function get(req: NextApiRequest, res: NextApiResponse) {
    const querySchema = z.object({
        id: z.string().optional(),
        tag: z.string().optional(),
    });

    const validationResult = querySchema.safeParse(req.query);

    if (!validationResult.success)
        return res.status(400).json({
            success: false,
            message: "Invalid query",
            errors: validationResult.error,
        });

    const { id, tag } = validationResult.data;

    if (!id && !tag)
        return res.status(400).json({
            success: false,
            message: "Invalid query",
        });

    const user = await prisma.user.findUnique({
        where: { id, tag },
        select: { ...userShape, posts: { select: postShape } },
    });

    if (!user)
        return res.status(404).json({
            success: false,
            message: "User not found",
        });

    return res.status(200).json({
        success: true,
        data: user,
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
