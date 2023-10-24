import { TRPCError } from "@trpc/server";
import { compare } from "bcrypt";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const migrateRouter = createTRPCRouter({
    migrateUser: publicProcedure
        .input(
            z.object({
                username: z.string(),
                password: z.string(),
                newEmail: z.string().email(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const { username, password, newEmail } = input;

            // Since cred logins will only be for migration, we can apply the migration function to do the same transformation done on migration
            const fixTags = (tag: string) => {
                tag = tag.replace(/ /g, "-");
                if (tag.length < 4) tag = tag.padEnd(4, "0");
                tag = tag.slice(0, 16);
                tag = tag.toLowerCase();

                return tag;
            };

            const user = await ctx.prisma.user.findUnique({
                where: { tag: fixTags(username) },
            });

            if (!user)
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "User not found",
                    cause: "Username or password is incorrect",
                });

            if (!user.password)
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "User already migrated",
                    cause: "Password does not exist",
                });

            const passwordValid = await compare(password, user.password);
            if (passwordValid === false)
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "User not found",
                    cause: "Username or password is incorrect",
                });

            await ctx.prisma.user.update({
                where: { id: user.id },
                data: { email: newEmail, password: null },
            });

            return user;
        }),
});
