import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
    PERMISSIONS,
    administrativePermissions,
    hasPermission,
} from "~/utils/permission";

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

            if (
                !hasPermission(
                    ctx.session.user,
                    PERMISSIONS.MANAGE_USERS_EXTENDED,
                )
            ) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message:
                        "You don't have sufficient permissions to perform this action.",
                    cause: "User lacks the MANAGE_USERS_EXTENDED permission.",
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

            if (!hasPermission(ctx.session.user, PERMISSIONS.MANAGE_USERS)) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message:
                        "You don't have sufficient permissions to perform this action.",
                    cause: "User lacks the MANAGE_USERS permission.",
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

            if (!hasPermission(ctx.session.user, PERMISSIONS.MANAGE_USERS)) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message:
                        "You don't have sufficient permissions to perform this action.",
                    cause: "User lacks the MANAGE_USERS permission.",
                });
            }

            return await ctx.prisma.user.findUnique({
                where: {
                    id: userId,
                },
                include: {
                    roles: true,
                },
            });
        }),

    updateUserPermissions: protectedProcedure
        .input(
            z.object({
                id: z.string(),
                permissions: z.string(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const { id: userId, permissions: _permString } = input;

            const permissions = BigInt(_permString);

            if (
                !hasPermission(ctx.session.user, PERMISSIONS.MANAGE_USER_ROLES)
            ) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message:
                        "You don't have sufficient permissions to perform this action.",
                    cause: "User lacks the MANAGE_USER_ROLES permission.",
                });
            }

            const user = await ctx.prisma.user.findUnique({
                include: {
                    roles: true,
                },
                where: {
                    id: userId,
                },
            });

            if (!user) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "User not found.",
                    cause: "User with the specified ID does not exist.",
                });
            }

            // Make sure the user doesn't have the administrator permission
            if (
                hasPermission(user, PERMISSIONS.ADMINISTRATOR) &&
                user.id !== ctx.session.user.id
            )
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "You cannot change the permissions of this user.",
                    cause: "User has the ADMINISTRATOR permission.",
                });

            // Make sure we aren't changing the administrator permission
            if (
                hasPermission(
                    { permissions: permissions.toString(), roles: [] },
                    PERMISSIONS.ADMINISTRATOR,
                ) !== hasPermission(user, PERMISSIONS.ADMINISTRATOR)
            )
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "You cannot change the ADMINISTRATOR permission.",
                    cause: "You cannot change the ADMINISTRATOR permission.",
                });

            return await ctx.prisma.user.update({
                include: {
                    roles: true,
                },
                where: {
                    id: userId,
                },
                data: {
                    permissions: permissions.toString(),
                },
            });
        }),

    getAdministrators: protectedProcedure
        .input(z.object({}))
        .query(async ({ ctx }) => {
            if (
                !hasPermission(ctx.session.user, PERMISSIONS.MANAGE_USER_ROLES)
            ) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message:
                        "You don't have sufficient permissions to perform this action.",
                    cause: "User lacks the MANAGE_USER_ROLES permission.",
                });
            }

            const users = await ctx.prisma.user.findMany({
                select: {
                    id: true,
                    tag: true,
                    name: true,
                    image: true,
                    verified: true,
                    permissions: true,
                    roles: true,
                },
                where: {
                    NOT: {
                        permissions: "0",
                    },
                },
            });

            const administrativeUsers = users.filter((u) =>
                hasPermission(u, administrativePermissions, true),
            );

            return administrativeUsers;
        }),

    updateUserRoles: protectedProcedure
        .input(z.object({ id: z.string(), roles: z.array(z.string()) }))
        .mutation(async ({ ctx, input }) => {
            const { id: userId, roles: roleIds } = input;

            if (!hasPermission(ctx.session.user, PERMISSIONS.MANAGE_USER_ROLES))
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message:
                        "You don't have sufficient permissions to perform this action.",
                    cause: "User lacks the MANAGE_USER_ROLES permission.",
                });

            if (userId === ctx.session.user.id)
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message:
                        "You cannot change your own roles. Please contact another administrator.",
                    cause: "User is trying to change their own roles.",
                });

            const [user, newRoles] = await ctx.prisma.$transaction([
                ctx.prisma.user.findUnique({
                    where: {
                        id: userId,
                    },
                    include: {
                        roles: true,
                    },
                }),
                ctx.prisma.role.findMany({
                    where: {
                        id: {
                            in: roleIds,
                        },
                    },
                }),
            ]);

            if (!user)
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "User not found.",
                    cause: "User with the specified ID does not exist.",
                });

            const userRoles = user.roles;

            const newRolesIds = newRoles.map((r) => r.id);
            const missingRoles = roleIds.filter(
                (id) => !newRolesIds.includes(id),
            );
            if (missingRoles.length > 0)
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Role not found.",
                    cause: "Role with the specified ID does not exist.",
                });

            if (
                hasPermission(
                    {
                        permissions: "0",
                        roles: newRoles,
                    },
                    PERMISSIONS.ADMINISTRATOR,
                ) !==
                hasPermission(
                    {
                        permissions: "0",
                        roles: userRoles,
                    },
                    PERMISSIONS.ADMINISTRATOR,
                )
            )
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message:
                        "You cannot manage a role with the administrator permission.",
                    cause: "You cannot manage a role with the administrator permission.",
                });

            return await ctx.prisma.user.update({
                include: {
                    roles: true,
                },
                where: {
                    id: userId,
                },
                data: {
                    roles: {
                        connect: newRoles.map((r) => ({ id: r.id })),
                        disconnect: userRoles
                            .filter((r) => !newRolesIds.includes(r.id))
                            .map((r) => ({ id: r.id })),
                    },
                },
            });
        }),

    updateProfile: protectedProcedure
        .input(
            z.object({
                id: z.string(),
                name: z.string().optional(),
                tag: z.string().optional(),
                email: z.string().optional(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const { id: userId, name, tag, email } = input;

            if (
                !hasPermission(
                    ctx.session.user,
                    PERMISSIONS.MANAGE_USERS_EXTENDED,
                )
            )
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message:
                        "You don't have sufficient permissions to perform this action.",
                    cause: "User lacks the MANAGE_USERS_EXTENDED permission.",
                });

            return await ctx.prisma.user.update({
                where: {
                    id: userId,
                },
                data: {
                    name,
                    tag,
                    email,
                },
            });
        }),
});
