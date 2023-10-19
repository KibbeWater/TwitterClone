import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from "~/server/api/trpc";
import { PERMISSIONS, hasPermission } from "~/utils/permission";

export const roleRouter = createTRPCRouter({
    getRoles: publicProcedure.input(z.object({})).query(
        async ({ ctx, input }) =>
            await ctx.prisma.role.findMany({
                select: {
                    id: true,
                    name: true,
                    permissions: true,
                    createdAt: true,
                    updatedAt: true,
                },
            }),
    ),

    createRole: protectedProcedure
        .input(
            z.object({
                name: z.string(),
                permissions: z.string(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            if (!hasPermission(ctx.session.user, PERMISSIONS.MANAGE_ROLES))
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message:
                        "You don't have sufficient permissions to perform this action.",
                    cause: "User lacks the MANAGE_ROLES permission.",
                });

            return await ctx.prisma.role.create({
                data: {
                    name: input.name,
                    permissions: input.permissions,
                },
            });
        }),

    updateRole: protectedProcedure
        .input(z.object({ name: z.string(), permissions: z.string() }))
        .mutation(async ({ ctx, input }) => {
            if (!hasPermission(ctx.session.user, PERMISSIONS.MANAGE_ROLES))
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message:
                        "You don't have sufficient permissions to perform this action.",
                    cause: "User lacks the MANAGE_ROLES permission.",
                });

            return await ctx.prisma.role.update({
                where: {
                    name: input.name,
                },
                data: {
                    permissions: input.permissions,
                },
            });
        }),
});
