import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

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
                    posts: {
                        include: {
                            quote: true,
                            parent: true,
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
});
