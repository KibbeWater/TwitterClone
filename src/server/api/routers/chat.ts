import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const chatRouter = createTRPCRouter({
    fetchChats: protectedProcedure
        .input(z.object({}))
        .query(async ({ ctx }) => {
            return await ctx.prisma.chat.findMany({
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
                where: {
                    participantIds: {
                        has: ctx.session.user.id,
                    },
                },
            });
        }),

    streamChats: protectedProcedure
    .input(z.object({}))
    .subscription()

    fetchChat: protectedProcedure
        .input(z.object({ chatId: z.string() }))
        .query(async ({ ctx, input }) => {
            return await ctx.prisma.chat.findUnique({
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
                where: {
                    id: input.chatId,
                },
            });
        }),

    fetchMessages: protectedProcedure
        .input(z.object({ chatId: z.string() }))
        .query(async ({ ctx, input }) => {
            return await ctx.prisma.message.findMany({
                select: {
                    id: true,
                    message: true,
                    createdAt: true,
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
                    chatId: input.chatId,
                },
                orderBy: {
                    createdAt: "asc",
                },
            });
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

            return await ctx.prisma.chat.create({
                data: {
                    name: filteredGroupName,
                    participants: {
                        connect: participantUsers.map((u) => ({ id: u.id })),
                    },
                },
            });
        }),

    sendChatMessage: protectedProcedure
        .input(
            z.object({
                chatId: z.string(),
                message: z.string(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const { chatId, message } = input;

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

            return await ctx.prisma.message.create({
                data: {
                    message,
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
            });
        }),
});
