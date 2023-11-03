import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { PERMISSIONS, hasPermission } from "~/utils/permission";
import { isPremium } from "~/utils/user";

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
            const user = await ctx.prisma.user.findUnique({
                where: { id: ctx.session.user.id },
                select: {
                    permissions: true,
                    roles: true,
                    following: {
                        select: {
                            id: true,
                            name: true,
                            tag: true,
                            image: true,
                            verified: true,
                            permissions: true,
                            roles: {
                                select: {
                                    id: true,
                                    permissions: true,
                                },
                            },
                        },
                    },
                },
            });

            if (!user)
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "User not found",
                    cause: "User not found",
                });

            if (
                hasPermission(user, PERMISSIONS.HIDE_FOLLOWINGS) &&
                isPremium(
                    user as unknown as {
                        permissions: string;
                        roles: { id: string }[];
                    },
                )
            )
                return [];

            return user?.following;
        }),
});
