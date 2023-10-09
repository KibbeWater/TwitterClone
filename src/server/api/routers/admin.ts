import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const adminRouter = createTRPCRouter({
    setUserVerification: protectedProcedure
        .input(
            z.object({
                id: z.string(),
                shouldVerify: z.boolean(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const { id: userId, shouldVerify } = input;

            if (ctx.session.user.role !== "ADMIN") {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message:
                        "You don't have sufficient permissions to perform this action.",
                    cause: "User is not an admin.",
                });
            }

            return await ctx.prisma.user.update({
                where: {
                    id: userId,
                },
                data: {
                    verified: shouldVerify,
                },
            });
        }),
    setUserTagCooldown: protectedProcedure
        .input(
            z.object({
                id: z.string(),
                newDate: z.date(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const { id: userId, newDate } = input;

            if (ctx.session.user.role !== "ADMIN") {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message:
                        "You don't have sufficient permissions to perform this action.",
                    cause: "User is not an admin.",
                });
            }

            return await ctx.prisma.user.update({
                where: {
                    id: userId,
                },
                data: {
                    lastTagReset: newDate,
                },
            });
        }),

    getUser: protectedProcedure
        .input(
            z.object({
                id: z.string(),
            }),
        )
        .query(async ({ ctx, input }) => {
            const { id: userId } = input;

            if (ctx.session.user.role !== "ADMIN") {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message:
                        "You don't have sufficient permissions to perform this action.",
                    cause: "User is not an admin.",
                });
            }

            return await ctx.prisma.user.findUnique({
                where: {
                    id: userId,
                },
            });
        }),
});
