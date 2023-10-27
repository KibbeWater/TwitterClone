import { z } from "zod";

import { env } from "~/env.mjs";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const chatRouter = createTRPCRouter({
    fetchChats: protectedProcedure
        .input(z.object({}))
        .mutation(async ({ ctx, input }) => {
            return await ctx.prisma.chat.findMany({
                where: {
                    userId: ctx.session.user.id,
                },
            });
        }),
});
