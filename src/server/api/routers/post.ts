import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from "~/server/api/trpc";
import { PERMISSIONS, hasPermission } from "~/utils/permission";
import { isPremium } from "~/utils/user";

const userSelect = {
    select: {
        id: true,
        name: true,
        tag: true,
        bio: true,
        permissions: true,
        roles: {
            select: {
                id: true,
                permissions: true,
            },
        },
        verified: true,
        image: true,
        followerIds: true,
        followingIds: true,
    },
};

export const postShape = {
    user: userSelect,
    quote: {
        include: {
            user: userSelect,
            comments: {
                select: {
                    id: true,
                },
            },
            reposts: {
                select: {
                    id: true,
                    user: userSelect,
                },
            },
        },
    },
    comments: {
        select: {
            id: true,
        },
    },
    reposts: {
        select: {
            id: true,
            user: userSelect,
        },
    },
};

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
                where: {
                    parent: null,
                },
                include: postShape,
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

    getPost: publicProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            const post = await ctx.prisma.post.findUnique({
                where: { id: input.id },
                include: {
                    ...postShape,
                    parent: {
                        include: postShape,
                    },
                },
            });

            if (!post) return null;

            return post;
        }),

    getCommentPage: publicProcedure
        .input(
            z.object({
                id: z.string(),
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
                where: {
                    parentId: input.id,
                },
                include: postShape,
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
        .input(
            z.object({
                content: z.string().min(1),
                parent: z.string().optional(),
                quote: z.string().optional(),
                images: z.array(z.string()).optional(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            if (
                !(
                    await ctx.ratelimits.post.create.regular.limit(
                        ctx.session.user.id,
                    )
                ).success
            )
                throw new TRPCError({
                    code: "TOO_MANY_REQUESTS",
                    message: "You are sending too many requests.",
                });

            if (!isPremium(ctx.session.user) && input.content.length > 300)
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message:
                        "Posts are limited to 300 characters for free users",
                    cause: "Posts are limited to 300 characters for free users",
                });

            if (isPremium(ctx.session.user) && input.content.length > 1000)
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Posts are limited to 1000 characters",
                    cause: "Posts are limited to 1000 characters",
                });

            const newPost = await ctx.prisma.post.create({
                data: {
                    content: input.content,
                    userId: ctx.session.user.id,
                    parentId: input.parent,
                    quoteId: input.quote,
                    images: input.images,
                },
                include: postShape,
            });

            try {
                await ctx.prisma.$transaction(async (tx) => {
                    if (input.parent) {
                        const parent = await tx.post.findUnique({
                            where: { id: input.parent },
                        });

                        if (parent && parent.userId !== ctx.session.user.id)
                            await tx.notification.create({
                                data: {
                                    userId: parent.userId,
                                    targets: {
                                        connect: {
                                            id: ctx.session.user.id,
                                        },
                                    },
                                    type: "reply",
                                    value: newPost.id,
                                },
                            });
                    }
                });
            } catch (error) {
                console.error("Failed to deliver notification", error);
            }

            return newPost;
        }),

    delete: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            if (!hasPermission(ctx.session.user, PERMISSIONS.MANAGE_POSTS))
                return new Error("You are not an admin");

            return await ctx.prisma.post.delete({
                where: { id: input.id },
            });
        }),

    setLike: protectedProcedure
        .input(z.object({ postId: z.string(), shouldLike: z.boolean() }))
        .mutation(async ({ ctx, input }) => {
            const { postId: id, shouldLike } = input;

            const updatedPost = await ctx.prisma.post.update({
                where: { id },
                data: {
                    likes: {
                        [shouldLike ? "connect" : "disconnect"]: {
                            id: ctx.session.user.id,
                        },
                    },
                },
            });

            if (shouldLike && updatedPost.userId !== ctx.session.user.id)
                try {
                    await ctx.prisma.$transaction(async (tx) => {
                        const existingNotif = await tx.notification.findFirst({
                            where: {
                                userId: updatedPost.userId,
                                type: "like",
                                value: id,
                                targets: {
                                    none: {
                                        id: ctx.session.user.id,
                                    },
                                },
                            },
                            select: {
                                id: true,
                            },
                        });

                        if (existingNotif)
                            await tx.notification.update({
                                where: {
                                    id: existingNotif.id,
                                },
                                data: {
                                    targets: {
                                        connect: {
                                            id: ctx.session.user.id,
                                        },
                                    },
                                    read: false,
                                    createdAt: new Date(),
                                },
                            });
                        else
                            await tx.notification.create({
                                data: {
                                    userId: updatedPost.userId,
                                    targets: {
                                        connect: {
                                            id: ctx.session.user.id,
                                        },
                                    },
                                    type: "like",
                                    value: id,
                                },
                            });
                    });
                } catch (error) {
                    console.error("Failed to deliver notification", error);
                }

            return updatedPost;
        }),
});
