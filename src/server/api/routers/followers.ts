import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const followersRouter = createTRPCRouter({
    setFollowing: protectedProcedure
        .input(z.object({ id: z.string(), shouldFollow: z.boolean() }))
        .mutation(async ({ ctx, input }) => {
            const { id: targetId, shouldFollow } = input;
            const id = ctx.session.user.id;
            return await ctx.prisma.user.update({
                where: { id },
                data: {
                    following: {
                        [shouldFollow ? "connect" : "disconnect"]: {
                            id: targetId,
                        },
                    },
                },
            });
        }),

    getFollowing: protectedProcedure
        .input(z.object({}))
        .query(async ({ ctx }) => {
            return (
                await ctx.prisma.user.findUnique({
                    where: { id: ctx.session.user.id },
                    select: {
                        following: {
                            select: {
                                id: true,
                                name: true,
                                tag: true,
                                image: true,
                                verified: true,
                            },
                        },
                    },
                })
            )?.following;
        }),
});
