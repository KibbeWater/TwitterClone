import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
    getProfile: publicProcedure
        .input(z.object({ tag: z.string() }))
        .query(async ({ ctx, input }) => {
            const user = await ctx.prisma.user.findUnique({
                where: {
                    tag: input.tag,
                },
                select: {
                    id: true,
                    name: true,
                    tag: true,
                    role: true,
                    verified: true,
                    image: true,
                },
            });

            if (!user) {
                throw new Error("User not found");
            }

            return user;
        }),
});
