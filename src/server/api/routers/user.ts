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
                    role: true,
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
                                },
                            },
                            quote: {
                                include: {
                                    user: {
                                        select: {
                                            id: true,
                                            name: true,
                                            tag: true,
                                            role: true,
                                            verified: true,
                                            image: true,
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
                    role: true,
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
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const { id } = ctx.session.user;
            return await ctx.prisma.user.update({
                where: { id },
                data: input,
            });
        }),
});
