import { PrismaClient } from "@prisma/client";
import { Redis } from "@upstash/redis";

import { env } from "~/env.mjs";

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

const globalForRedis = globalThis as unknown as {
    redis: Redis | undefined;
};

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        log:
            env.NODE_ENV === "development"
                ? ["query", "error", "warn"]
                : ["error"],
    });

export const redis =
    globalForRedis.redis ??
    new Redis({
        url: env.UPSTASH_REDIS_REST_URL,
        token: env.UPSTASH_REDIS_REST_TOKEN,
    });

if (env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
    globalForRedis.redis = redis;
}
