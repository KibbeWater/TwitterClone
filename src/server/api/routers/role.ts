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
        async ({ ctx }) =>
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

            const permissions = BigInt(input.permissions);

            if (
                hasPermission(
                    { permissions: permissions.toString(), roles: [] },
                    PERMISSIONS.ADMINISTRATOR,
                )
            )
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message:
                        "You cannot create a role with the ADMINISTRATOR permission.",
                    cause: "You cannot create a role with the ADMINISTRATOR permission.",
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

            const role = await ctx.prisma.role.findUnique({
                where: {
                    name: input.name,
                },
            });

            if (!role)
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Role not found.",
                    cause: "Role not found.",
                });

            const permissions = BigInt(input.permissions);

            if (
                hasPermission(
                    { permissions: permissions.toString(), roles: [] },
                    PERMISSIONS.ADMINISTRATOR,
                ) !==
                hasPermission({ ...role, roles: [] }, PERMISSIONS.ADMINISTRATOR)
            )
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "You cannot update the ADMINISTRATOR permission.",
                    cause: "You cannot update the ADMINISTRATOR permission.",
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

    deleteRole: protectedProcedure
        .input(z.object({ name: z.string() }))
        .mutation(async ({ ctx, input }) => {
            if (!hasPermission(ctx.session.user, PERMISSIONS.MANAGE_ROLES))
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message:
                        "You don't have sufficient permissions to perform this action.",
                    cause: "User lacks the MANAGE_ROLES permission.",
                });

            const role = await ctx.prisma.role.findUnique({
                where: {
                    name: input.name,
                },
            });

            if (!role)
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Role not found.",
                    cause: "Role not found.",
                });

            if (
                hasPermission({ ...role, roles: [] }, PERMISSIONS.ADMINISTRATOR)
            )
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "You cannot update the ADMINISTRATOR permission.",
                    cause: "You cannot update the ADMINISTRATOR permission.",
                });

            return await ctx.prisma.role.delete({
                where: {
                    name: input.name,
                },
            });
        }),
});
