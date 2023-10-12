import { z } from "zod";

import {
    createTRPCRouter,
    publicProcedure,
    protectedProcedure,
} from "~/server/api/trpc";

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

            if (!user) {
                throw new Error("User not found");
            }

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

                if (tagExists) throw new Error("Tag already exists");
                if (/^[a-zA-Z0-9_-]{3,16}$/.test(tag) === false)
                    throw new Error("Invalid tag");

                const lastTagReset = new Date(ctx.session.user.lastTagReset);
                const now = new Date();
                const diff = now.getTime() - lastTagReset.getTime();

                if (diff > 2592000000) {
                    return await ctx.prisma.user.update({
                        where: { id },
                        data: { tag, lastTagReset: now.toISOString() },
                    });
                } else {
                    throw new Error("Tag change cooldown not met");
                }
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

            if (!user) {
                throw new Error("User not found");
            }

            return user[input.followType];
        }),
});
