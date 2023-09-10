import { z } from "zod";

import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from "~/server/api/trpc";

export const postRouter = createTRPCRouter({
    getPage: publicProcedure
        .input(
            z.object({ page: z.number().min(1), limit: z.number().optional() }),
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
        }),

    create: protectedProcedure
        .input(z.object({ content: z.string().min(1) }))
        .mutation(async ({ ctx, input }) => {
            return ctx.prisma.post.create({
                data: {
                    content: input.content,
                    userId: ctx.session.user.id,
                },
            });
        }),
    /* .query(async ({ ctx, input }) => {
            return ctx.prisma.post.create({
                data: {
                    content: input.content,
                    userId: ctx.session.user.id,
                },
            });
        }), */
});
