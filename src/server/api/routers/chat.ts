import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { pusherServer } from "~/server/pusher";

export const chatRouter = createTRPCRouter({
    fetchChats: protectedProcedure
        .input(z.object({}))
        .query(async ({ ctx }) => {
            const _chats = await ctx.prisma.chat.findMany({
                select: {
                    id: true,
                    name: true,
                    image: true,
                    participants: {
                        select: {
                            id: true,
                            name: true,
                            tag: true,
                            image: true,
                        },
                    },
                },
                where: {
                    participantIds: {
                        has: ctx.session.user.id,
                    },
                },
            });

            const chatLatestMessages = await ctx.prisma.message.findMany({
                select: {
                    id: true,
                    message: true,
                    image: true,
                    createdAt: true,
                    userId: true,
                    chatId: true,
                    sender: {
                        select: {
                            id: true,
                            name: true,
                            tag: true,
                            image: true,
                        },
                    },
                },
                where: {
                    OR: _chats.map((c) => ({ chatId: c.id })),
                },
                orderBy: {
                    createdAt: "desc",
                },
            });

            return _chats.map((c) => ({
                ...c,
                latestMessage: chatLatestMessages.find(
                    (m) => m.chatId === c.id,
                ),
            }));
        }),

    fetchChat: protectedProcedure
        .input(z.object({ chatId: z.string() }))
        .query(async ({ ctx, input }) => {
            return await ctx.prisma.chat.findUnique({
                select: {
                    id: true,
                    name: true,
                    image: true,
                    participants: {
                        select: {
                            id: true,
                            name: true,
                            tag: true,
                            image: true,
                            verified: true,
                            followerIds: true,
                            permissions: true,
                            roles: {
                                select: {
                                    id: true,
                                    permissions: true,
                                },
                            },
                        },
                    },
                },
                where: {
                    id: input.chatId,
                },
            });
        }),

    fetchMessages: protectedProcedure
        .input(
            z.object({
                chatId: z.string(),
                limit: z.number().optional(),
                cursor: z.string().nullish(),
                skip: z.number().optional(),
            }),
        )
        .query(async ({ ctx, input }) => {
            const { limit, cursor, skip, chatId } = input;

            const [chat, items] = await ctx.prisma.$transaction([
                ctx.prisma.chat.findUnique({
                    where: {
                        id: chatId,
                        participantIds: {
                            has: ctx.session.user.id,
                        },
                    },
                }),
                ctx.prisma.message.findMany({
                    take: (limit ?? 15) + 1,
                    skip: skip,
                    cursor: cursor ? { id: cursor } : undefined,
                    orderBy: {
                        createdAt: "desc",
                    },
                    where: {
                        chatId,
                    },
                    select: {
                        id: true,
                        message: true,
                        image: true,
                        createdAt: true,
                        userId: true,
                        sender: {
                            select: {
                                id: true,
                                name: true,
                                tag: true,
                                image: true,
                            },
                        },
                    },
                }),
            ]);

            if (!chat)
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "You are not a member of any chats by that ID.",
                    cause: "The chat ID is invalid or you are not a member of the chat.",
                });

            if (!skip)
                await ctx.prisma.chat.update({
                    where: {
                        id: chatId,
                    },
                    data: {
                        Read: {
                            connect: {
                                id: ctx.session.user.id,
                            },
                        },
                    },
                });

            let nextCursor: typeof cursor | undefined = undefined;
            if (items.length > (limit ?? 15)) {
                const nextItem = items.pop();
                nextCursor = nextItem?.id;
            }
            return {
                items,
                nextCursor,
            };
        }),

    createChat: protectedProcedure
        .input(z.object({ participants: z.array(z.string()) }))
        .mutation(async ({ ctx, input }) => {
            const { participants: _participants } = input;

            const participants = [
                ..._participants.filter((p) => p !== ctx.session.user.id),
                ctx.session.user.id,
            ];

            const participantUsers = await ctx.prisma.user.findMany({
                where: {
                    id: {
                        in: participants,
                    },
                },
            });

            const groupName = participantUsers.map((u) => u.name).join(", ");
            const filteredGroupName = /* groupName.length > 20
                    ? groupName.slice(0, 17) + "..."
                    :  */ groupName;

            const newChat = await ctx.prisma.chat.create({
                data: {
                    name: filteredGroupName,
                    participants: {
                        connect: participantUsers.map((u) => ({ id: u.id })),
                    },
                },
            });

            try {
                await pusherServer.trigger(
                    participantUsers.map((u) => u.id),
                    "new-chat",
                    null,
                );
            } catch (err) {
                console.error(err);
            }

            return newChat;
        }),

    sendChatMessage: protectedProcedure
        .input(
            z.object({
                chatId: z.string(),
                message: z.string(),
                image: z.string().optional(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const { chatId, message, image } = input;

            const chat = await ctx.prisma.chat.findUnique({
                where: {
                    id: chatId,
                    participantIds: {
                        has: ctx.session.user.id,
                    },
                },
            });

            if (!chat)
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "You are not a member of any chats by that ID.",
                    cause: "The chat ID is invalid or you are not a member of the chat.",
                });

            const [newMessage] = await ctx.prisma.$transaction([
                ctx.prisma.message.create({
                    data: {
                        message,
                        image,
                        sender: {
                            connect: {
                                id: ctx.session.user.id,
                            },
                        },
                        chat: {
                            connect: {
                                id: chatId,
                            },
                        },
                    },
                    select: {
                        id: true,
                        message: true,
                        image: true,
                        createdAt: true,
                        userId: true,
                        chatId: true,
                        sender: {
                            select: {
                                id: true,
                                name: true,
                                tag: true,
                                image: true,
                            },
                        },
                    },
                }),
                ctx.prisma.chat.update({
                    where: {
                        id: chatId,
                    },
                    data: {
                        Read: {
                            set: [],
                            connect: {
                                id: ctx.session.user.id,
                            },
                        },
                    },
                }),
            ]);

            try {
                await pusherServer.trigger(
                    [`chat-${newMessage.chatId}`, ...chat.participantIds],
                    "new-message",
                    null,
                );
            } catch (err) {
                console.error(err);
            }

            return newMessage;
        }),

    hasUnreadMessages: protectedProcedure
        .input(
            z.object({
                chatId: z.union([z.string(), z.array(z.string())]).optional(),
            }),
        )
        .output(
            z.union([
                z.boolean(),
                z.array(
                    z.object({
                        id: z.string(),
                        hasUnreadMessages: z.boolean(),
                    }),
                ),
            ]),
        )
        .query(async ({ ctx, input }) => {
            const { chatId } = input;

            if (typeof chatId === "object" && chatId !== undefined)
                return (
                    await ctx.prisma.chat.findMany({
                        where: {
                            participantIds: {
                                has: ctx.session.user.id,
                            },
                            Read: {
                                none: {
                                    id: ctx.session.user.id,
                                },
                            },
                            id: {
                                in: chatId,
                            },
                        },
                    })
                ).map((c) => ({
                    id: c.id,
                    hasUnreadMessages: true,
                }));

            return (
                (await ctx.prisma.chat.count({
                    where: {
                        participantIds: {
                            has: ctx.session.user.id,
                        },
                        Read: {
                            none: {
                                id: ctx.session.user.id,
                            },
                        },
                        id: chatId,
                    },
                })) > 0
            );
        }),

    leaveChat: protectedProcedure
        .input(z.object({ chatId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const { chatId } = input;

            const chat = await ctx.prisma.chat.findUnique({
                where: {
                    id: chatId,
                    participantIds: {
                        has: ctx.session.user.id,
                    },
                },
            });

            if (!chat)
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "You are not a member of any chats by that ID.",
                    cause: "The chat ID is invalid or you are not a member of the chat.",
                });

            const updatedChat = await ctx.prisma.chat.update({
                where: {
                    id: chatId,
                },
                data: {
                    participants: {
                        disconnect: {
                            id: ctx.session.user.id,
                        },
                    },
                },
                select: {
                    id: true,
                    name: true,
                    participants: {
                        select: {
                            id: true,
                            name: true,
                            tag: true,
                            image: true,
                        },
                    },
                },
            });

            try {
                await pusherServer.trigger(
                    updatedChat.participants.map((u) => u.id),
                    "new-chat",
                    null,
                );
            } catch (err) {
                console.error(err);
            }

            return updatedChat;
        }),

    updateChat: protectedProcedure
        .input(
            z.object({
                chatId: z.string(),
                name: z.string().optional(),
                image: z.string().optional(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const { chatId, name, image } = input;

            const chat = await ctx.prisma.chat.findUnique({
                where: {
                    id: chatId,
                    participantIds: {
                        has: ctx.session.user.id,
                    },
                },
            });

            if (!chat)
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "You are not a member of any chats by that ID.",
                    cause: "The chat ID is invalid or you are not a member of the chat.",
                });

            const newChat = await ctx.prisma.chat.update({
                where: {
                    id: chatId,
                },
                data: {
                    name,
                    image,
                },
                select: {
                    id: true,
                    name: true,
                    participants: {
                        select: {
                            id: true,
                            name: true,
                            tag: true,
                            image: true,
                        },
                    },
                },
            });

            try {
                await pusherServer.trigger(
                    newChat.participants.map((u) => u.id),
                    "new-chat",
                    null,
                );
            } catch (err) {
                console.error(err);
            }

            return newChat;
        }),
});
