import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { z } from "zod";

import { env } from "~/env.mjs";
import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from "~/server/api/trpc";

const client = new S3Client({
    region: env.AWS_S3_REGION,
    credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    },
});

const maxSizes = {
    image: 20 * 1024 * 1024, // 20 MB
    banner: 10 * 1024 * 1024, // 10 MB
    avatar: 6 * 1024 * 1024, // 6 MB
};

const permittedImageTypes = ["image/jpeg", "image/png", "image/webp"];

export const s3Router = createTRPCRouter({
    startUploadImage: protectedProcedure
        .input(
            z.object({
                type: z.union([
                    z.literal("image"),
                    z.literal("banner"),
                    z.literal("avatar"),
                ]),
                filename: z.string(),
                filetype: z.string(),
                filesize: z.number(),
            }),
        )
        .output(
            z.object({ url: z.string(), key: z.string(), cdnURL: z.string() }),
        )
        .mutation(async ({ input, ctx }) => {
            const { type, filename, filetype, filesize } = input;
            const { user } = ctx.session;

            const maxSize = maxSizes[type];

            if (filesize > maxSize) {
                throw new Error(
                    `File too large. Max size is ${maxSize / 1024 / 1024} MB`,
                );
            }

            if (!permittedImageTypes.includes(filetype)) {
                throw new Error(
                    `Invalid file type. Must be one of ${permittedImageTypes.join(
                        ", ",
                    )}`,
                );
            }

            const key = `${user.id}/${type}/${filename}`;

            const command = new PutObjectCommand({
                Bucket: env.AWS_S3_BUCKET,
                Key: key,
                ContentType: filetype,
                ContentLength: filesize,
            });

            const url = await getSignedUrl(client, command, {
                expiresIn: 60 * 60, // 1 hour
            });

            return {
                url,
                key,
                cdnURL: `https://${env.CLOUDFRONT_DDN}.cloudfront.net/${key}`,
            };
        }),
    getUploadRules: publicProcedure
        .input(z.undefined())
        .output(
            z.object({
                sizes: z.object({
                    image: z.number(),
                    banner: z.number(),
                    avatar: z.number(),
                }),
                types: z.array(z.string()),
            }),
        )
        .query(() => {
            return {
                sizes: maxSizes,
                types: permittedImageTypes,
            };
        }),
});
