import { z } from "zod";

import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from "~/server/api/trpc";

export const postRouter = createTRPCRouter({
    // DEPRECATED
    /* getPage: publicProcedure
        .input(
            z.object({ page: z.number().min(0), limit: z.number().optional() }),
        )
        .query(async ({ ctx, input }) => {
            const [posts, count] = await ctx.prisma.$transaction([
                ctx.prisma.post.findMany({
                    take: input.limit ?? 10,
                    skip: input.page * (input.limit ?? 10),
                    orderBy: { createdAt: "desc" },
                }),
                ctx.prisma.post.count(),
            ]);

            return {
                posts: posts,
                meta: {
                    totalPages: count,
                    page: input.page,
                    limit: input.limit ?? 10,
                },
            };
        }), */

    getPage: publicProcedure
        .input(
            z.object({
                limit: z.number().optional(),
                cursor: z.string().nullish(),
                skip: z.number().optional(),
            }),
        )
        .query(async ({ ctx, input }) => {
            const { limit, skip, cursor } = input;
            const items = await ctx.prisma.post.findMany({
                take: (limit ?? 10) + 1,
                skip: skip,
                cursor: cursor ? { id: cursor } : undefined,
                orderBy: {
                    createdAt: "desc",
                },
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
                    quote: true,
                },
            });
            let nextCursor: typeof cursor | undefined = undefined;
            if (items.length > (limit ?? 10)) {
                const nextItem = items.pop();
                nextCursor = nextItem?.id;
            }
            return {
                items,
                nextCursor,
            };
        }),

    create: protectedProcedure
        .input(z.object({ content: z.string().min(1) }))
        .mutation(async ({ ctx, input }) => {
            return ctx.prisma.post.create({
                data: {
                    content: input.content,
                    userId: ctx.session.user.id,
                },
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
                    quote: true,
                },
            });
        }),

    setLike: protectedProcedure
        .input(z.object({ postId: z.string(), shouldLike: z.boolean() }))
        .mutation(async ({ ctx, input }) => {
            const { postId: id, shouldLike } = input;
            return await ctx.prisma.post.update({
                where: { id },
                data: {
                    likes: {
                        connect: shouldLike
                            ? {
                                  id: ctx.session.user.id,
                              }
                            : undefined,
                        disconnect: !shouldLike
                            ? {
                                  id: ctx.session.user.id,
                              }
                            : undefined,
                    },
                },
            });
        }),
});
