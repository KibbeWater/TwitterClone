import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
    createTRPCRouter,
    publicProcedure,
    protectedProcedure,
} from "~/server/api/trpc";

// TODO: Check over literally this entire fucking file
export const userRouter = createTRPCRouter({
    getProfile: publicProcedure
        .input(
            z.object({ tag: z.string().optional(), id: z.string().optional() }),
        )
        .query(async ({ ctx, input }) => {
            const { tag, id } = input;

            if (!tag && !id)
                throw new TRPCError({
                    code: "PARSE_ERROR",
                    message: "Please select at least a tag or id",
                    cause: "Missing id or tag",
                });

            const user = await ctx.prisma.user.findUnique({
                where: {
                    tag,
                    id,
                },
                select: {
                    id: true,
                    name: true,
                    bio: true,
                    tag: true,
                    permissions: true,
                    verified: true,
                    image: true,
                    banner: true,
                    posts: {
                        orderBy: {
                            createdAt: "desc",
                        },
                        where: {
                            parent: null,
                        },
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    tag: true,
                                    image: true,
                                    followerIds: true,
                                    followingIds: true,
                                },
                            },
                            quote: {
                                include: {
                                    user: {
                                        select: {
                                            id: true,
                                            name: true,
                                            tag: true,
                                            permissions: true,
                                            verified: true,
                                            image: true,
                                            followerIds: true,
                                            followingIds: true,
                                        },
                                    },
                                },
                            },
                            parent: true,
                            comments: {
                                select: {
                                    id: true,
                                },
                            },
                            reposts: {
                                select: {
                                    id: true,
                                },
                            },
                        },
                    },
                    followers: {
                        select: {
                            id: true,
                            name: true,
                            tag: true,
                        },
                    },
                    following: {
                        select: {
                            id: true,
                            name: true,
                            tag: true,
                        },
                    },
                    followerIds: true,
                    followingIds: true,
                },
            });

            if (!user)
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message:
                        "User not found. Please check the tag and try again.",
                    cause: "User not found",
                });

            return user;
        }),
    findUsers: publicProcedure
        .input(z.object({ query: z.string() }))
        .query(async ({ ctx, input }) => {
            const users = await ctx.prisma.user.findMany({
                take: 10,
                where: {
                    OR: [
                        {
                            name: {
                                contains: input.query,
                                mode: "insensitive",
                            },
                        },
                        {
                            tag: {
                                contains: input.query,
                                mode: "insensitive",
                            },
                        },
                    ],
                },
                select: {
                    id: true,
                    name: true,
                    tag: true,
                    permissions: true,
                    verified: true,
                    image: true,
                },
            });

            return users;
        }),
    updateProfile: protectedProcedure
        .input(
            z.object({
                name: z.string().optional(),
                bio: z.string().optional(),
                image: z.string().optional(),
                banner: z.string().optional(),
                tag: z.string().optional(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const { id } = ctx.session.user;
            if (input.tag) {
                const tag = input.tag.toLowerCase();
                const tagExists = await ctx.prisma.user.findUnique({
                    where: { tag },
                });

                if (tagExists)
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Tag already exists.",
                        cause: "Tag already exists.",
                    });

                if (/^[a-zA-Z0-9_-]{3,16}$/.test(tag) === false)
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "The tag you provided is invalid.",
                        cause: "Invalid tag",
                    });

                const lastTagReset = new Date(ctx.session.user.lastTagReset);
                const now = new Date();
                const diff = now.getTime() - lastTagReset.getTime();

                if (diff > 2592000000) {
                    return await ctx.prisma.user.update({
                        where: { id },
                        data: { tag, lastTagReset: now.toISOString() },
                    });
                } else
                    throw new TRPCError({
                        code: "TOO_MANY_REQUESTS",
                        message: "You can only change your tag once a month.",
                        cause: "Tag change cooldown",
                    });
            }
            return await ctx.prisma.user.update({ where: { id }, data: input });
        }),

    getFollowing: publicProcedure
        .input(
            z.object({
                id: z.string(),
                followType: z.literal("followers").or(z.literal("following")),
            }),
        )
        .query(async ({ ctx, input }) => {
            const user = await ctx.prisma.user.findUnique({
                where: {
                    id: input.id,
                },
                select: {
                    [input.followType]: {
                        select: {
                            id: true,
                            name: true,
                            tag: true,
                            permissions: true,
                            verified: true,
                            image: true,
                            followerIds: true,
                            followingIds: true,
                        },
                    },
                },
            });

            if (!user)
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "User not found.",
                    cause: "User not found.",
                });

            return user[input.followType];
        }),

    updateEmail: protectedProcedure
        .input(z.object({ email: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const { id } = ctx.session.user;
            const emailExists = await ctx.prisma.user.findUnique({
                where: { email: input.email },
            });

            if (emailExists)
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Email already exists.",
                    cause: "Email already exists.",
                });

            // TODO: Alert the old email holder that their email was changed

            return await ctx.prisma.user.update({
                where: { id },
                data: { email: input.email },
            });
        }),

    getLinkedAccounts: protectedProcedure
        .input(z.object({}))
        .query(async ({ ctx }) => {
            const { id } = ctx.session.user;

            const accounts = await ctx.prisma.account.findMany({
                where: {
                    userId: id,
                },
            });

            return accounts.map((a) => a.provider);
        }),

    unlinkAccount: protectedProcedure
        .input(z.object({ provider: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const { id } = ctx.session.user;

            const account = await ctx.prisma.account.findFirst({
                where: {
                    userId: id,
                    provider: input.provider,
                },
            });

            if (!account)
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Account not found.",
                    cause: "Account not found.",
                });

            return await ctx.prisma.account.delete({
                where: {
                    id: account.id,
                },
            });
        }),

    getActiveSessions: protectedProcedure
        .input(z.object({}))
        .query(async ({ ctx }) => {
            const { id } = ctx.session.user;

            const sessions = await ctx.prisma.session.findMany({
                select: {
                    id: true,
                    userAgent: true,
                    expires: true,
                    lastAccessed: true,
                },
                where: {
                    userId: id,
                },
            });

            return sessions;
        }),

    logOutSessions: protectedProcedure
        .input(z.object({ sessions: z.array(z.string()) }))
        .mutation(async ({ ctx, input }) => {
            const { id } = ctx.session.user;
            const { sessions } = input;

            await ctx.prisma.session.deleteMany({
                where: {
                    userId: id,
                    id: {
                        in: sessions,
                    },
                },
            });

            return true;
        }),
});
