import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
    /**
     * Specify your server-side environment variables schema here. This way you can ensure the app
     * isn't built with invalid env vars.
     */
    server: {
        DATABASE_URL: z.string().url(),
        NODE_ENV: z.enum(["development", "test", "production"]),
        NEXTAUTH_SECRET:
            process.env.NODE_ENV === "production"
                ? z.string().min(1)
                : z.string().min(1).optional(),
        NEXTAUTH_URL: z.preprocess(
            // This makes Vercel deployments not fail if you don't set NEXTAUTH_URL
            // Since NextAuth.js automatically uses the VERCEL_URL if present.
            (str) => process.env.VERCEL_URL ?? str,
            // VERCEL_URL doesn't include `https` so it cant be validated as a URL
            process.env.VERCEL ? z.string().min(1) : z.string().url(),
        ),

        EMAIL_SERVER: z.string().min(1),
        EMAIL_FROM: z.string().email().min(1),

        SALT_ROUNDS: z.string().default("10"),
        // Add `.min(1) on ID and SECRET if you want to make sure they're not empty
        APPLE_ID: z.string().min(1),
        APPLE_APP_ID: z.string().optional(),
        APPLE_SECRET: z.string().min(1),

        GOOGLE_ID: z.string().min(1),
        GOOGLE_SECRET: z.string().min(1),

        STRIPE_SK: z.string().min(1),
        STRIPE_PK: z.string().min(1),
        STRIPE_WEBHOOK_SECRET: z.string().min(1),

        STRIPE_PREMIUM_PRICE_ID: z.string().min(1),
        PREMIUM_ROLE_ID: z.string().optional(),

        AWS_S3_REGION: z.string().min(1),
        AWS_S3_BUCKET: z.string().min(1),
        AWS_ACCESS_KEY_ID: z.string().min(1),
        AWS_SECRET_ACCESS_KEY: z.string().min(1),

        CLOUDFRONT_DDN: z.string().min(1),

        OPENAI_API_KEY: z.string().min(1),

        PUSHER_APP_ID: z.string().min(1),
        PUSHER_APP_KEY: z.string().min(1),
        PUSHER_APP_SECRET: z.string().min(1),
        PUSHER_APP_CLUSTER: z.string().min(1),

        UPSTASH_REDIS_REST_TOKEN: z.string().min(1),
        UPSTASH_REDIS_REST_URL: z.string().min(1),
        REDIS_URL: z.string().min(1),
    },

    /**
     * Specify your client-side environment variables schema here. This way you can ensure the app
     * isn't built with invalid env vars. To expose them to the client, prefix them with
     * `NEXT_PUBLIC_`.
     */
    client: {
        NEXT_PUBLIC_PUSHER_KEY: z.string().min(1),
        NEXT_PUBLIC_PUSHER_CLUSTER: z.string().min(1),

        NEXT_PUBLIC_PREMIUM_ROLE: z.string().optional(),
    },

    /**
     * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
     * middlewares) or client-side so we need to destruct manually.
     */
    runtimeEnv: {
        DATABASE_URL: process.env.DATABASE_URL,
        NODE_ENV: process.env.NODE_ENV,

        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,

        EMAIL_SERVER: process.env.EMAIL_SERVER,
        EMAIL_FROM: process.env.EMAIL_FROM,

        SALT_ROUNDS: process.env.SALT_ROUNDS,

        APPLE_ID: process.env.APPLE_ID,
        APPLE_APP_ID: process.env.APPLE_APP_ID,
        APPLE_SECRET: process.env.APPLE_SECRET,

        GOOGLE_ID: process.env.GOOGLE_ID,
        GOOGLE_SECRET: process.env.GOOGLE_SECRET,

        STRIPE_SK: process.env.STRIPE_SK,
        STRIPE_PK: process.env.STRIPE_PK,
        STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
        STRIPE_PREMIUM_PRICE_ID: process.env.STRIPE_PREMIUM_PRICE_ID,
        PREMIUM_ROLE_ID: process.env.PREMIUM_ROLE_ID,

        AWS_S3_REGION: process.env.AWS_S3_REGION,
        AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,
        AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
        AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,

        CLOUDFRONT_DDN: process.env.CLOUDFRONT_DDN,

        OPENAI_API_KEY: process.env.OPENAI_API_KEY,

        PUSHER_APP_ID: process.env.PUSHER_APP_ID,
        PUSHER_APP_KEY: process.env.PUSHER_APP_KEY,
        PUSHER_APP_SECRET: process.env.PUSHER_APP_SECRET,
        PUSHER_APP_CLUSTER: process.env.PUSHER_APP_CLUSTER,

        UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
        UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
        REDIS_URL: process.env.REDIS_URL,

        NEXT_PUBLIC_PUSHER_KEY: process.env.NEXT_PUBLIC_PUSHER_KEY,
        NEXT_PUBLIC_PUSHER_CLUSTER: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,

        NEXT_PUBLIC_PREMIUM_ROLE: process.env.NEXT_PUBLIC_PREMIUM_ROLE,
    },
    /**
     * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
     * This is especially useful for Docker builds.
     */
    skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
