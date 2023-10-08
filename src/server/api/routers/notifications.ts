import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const notificationsRouter = createTRPCRouter({
    getNotifications: protectedProcedure
        .input(
            z.object({
                limit: z.number().optional(),
                cursor: z.string().nullish(),
                skip: z.number().optional(),
                filers: z
                    .object({
                        read: z.boolean().optional(),
                    })
                    .optional(),
            }),
        )
        .query(async ({ ctx, input }) => {
            const { limit, skip, cursor } = input;
            const { id } = ctx.session.user;

            const items = await ctx.prisma.notification.findMany({
                take: (limit ?? 10) + 1,
                skip: skip,
                cursor: cursor ? { id: cursor } : undefined,
                orderBy: {
                    createdAt: "desc",
                },
                where: {
                    userId: id,
                    /* read: input.filers?.read ?? undefined, */
                },
                include: {
                    targets: {
                        select: {
                            id: true,
                            name: true,
                            tag: true,
                            image: true,
                        },
                    },
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
});
