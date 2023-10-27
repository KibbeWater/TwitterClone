import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const chatRouter = createTRPCRouter({
    fetchChats: protectedProcedure
        .input(z.object({}))
        .query(async ({ ctx }) => {
            return await ctx.prisma.chat.findMany({
                select: {
                    id: true,
                    name: true,
                    participants: {
                        select: {
                            id: true,
                            name: true,
                            tag: true,
                            image: true,
                        },
                    },
                },
                where: {
                    participantIds: {
                        has: ctx.session.user.id,
                    },
                },
            });
        }),

    fetchMessages: protectedProcedure
        .input(z.object({ chatId: z.string() }))
        .query(async ({ ctx, input }) => {
            return await ctx.prisma.message.findMany({
                select: {
                    id: true,
                    message: true,
                    createdAt: true,
                    sender: {
                        select: {
                            id: true,
                            name: true,
                            tag: true,
                            image: true,
                        },
                    },
                },
                where: {
                    chatId: input.chatId,
                },
                orderBy: {
                    createdAt: "asc",
                },
            });
        }),
});
