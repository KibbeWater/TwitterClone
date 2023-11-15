import { TRPCError } from "@trpc/server";
import OpenAI from "openai";
import { z } from "zod";

import { env } from "~/env.mjs";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { isPremium } from "~/utils/user";

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
const model = "gpt-3.5-turbo";

export const aiRouter = createTRPCRouter({
    generateBio: protectedProcedure
        .input(
            z.object({
                draftBio: z.string(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const { draftBio: draft } = input;

            const rateLimiter = isPremium(ctx.session.user)
                ? ctx.ratelimits.AI.premium!
                : ctx.ratelimits.AI.regular;
            if (!(await rateLimiter.limit(ctx.session.user.id)).success)
                throw new TRPCError({
                    code: "TOO_MANY_REQUESTS",
                    message: "You are sending too many requests.",
                });

            const user = await ctx.prisma.user.findUnique({
                where: {
                    id: ctx.session.user.id,
                },
                select: {
                    name: true,
                    tag: true,
                    verified: true,
                },
            });

            const completions = await openai.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: [
                            "You will write a bio for a social media profile, similar to Twitter. You have a 160 character limit.",
                            "You will receive a draft bio and you will re-write it to make a more informative and interesting bio.",
                            "Avoid using unrelated #hashtags, you can use them to replace some text/topics, ex: I work with TypeScript. becomes: I work with #TypeScript.",
                            "Do not use hastags for like #coder, #CodeLife, #Programmer, etc...",
                            "Do not exceesively use #hashtags",
                            "",
                            "Additional user information:",
                            `${"```"}${JSON.stringify(user)}${"```"}`,
                        ].join("\n"),
                    },
                    {
                        role: "user",
                        content: draft,
                    },
                ],
                model: model,
                n: 10,
            });

            return completions.choices
                .map((choice) =>
                    choice.finish_reason === "stop"
                        ? choice.message.content?.substring(0, 160) ?? undefined
                        : undefined,
                )
                .filter((c) => c !== undefined) as string[];
        }),
});
