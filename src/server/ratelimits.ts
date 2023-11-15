import { Ratelimit } from "@upstash/ratelimit";

import { env } from "~/env.mjs";
import { redis } from "~/server/db";

type RatelimitType = { regular: Ratelimit; premium?: Ratelimit };

const globalForRatelimits = globalThis as unknown as {
    ratelimits:
        | {
              AI: RatelimitType;
              post: { create: RatelimitType };
              chat: { send: RatelimitType; create: RatelimitType };
          }
        | undefined;
};

export const ratelimits = globalForRatelimits.ratelimits ?? {
    AI: {
        regular: new Ratelimit({
            redis,
            analytics: true,
            limiter: Ratelimit.slidingWindow(3, "1h"),
            prefix: "ratelimit:ai",
        }),
        premium: new Ratelimit({
            redis,
            analytics: true,
            limiter: Ratelimit.slidingWindow(10, "1h"),
            prefix: "ratelimit:ai:premium",
        }),
    },
    post: {
        create: {
            regular: new Ratelimit({
                redis,
                analytics: true,
                limiter: Ratelimit.slidingWindow(1, "10s"),
                prefix: "ratelimit:post:create",
            }),
        },
    },
    chat: {
        send: {
            regular: new Ratelimit({
                redis,
                analytics: true,
                limiter: Ratelimit.slidingWindow(5, "1s"),
                prefix: "ratelimit:chat:send",
            }),
        },
        create: {
            regular: new Ratelimit({
                redis,
                analytics: true,
                limiter: Ratelimit.slidingWindow(2, "30s"),
                prefix: "ratelimit:chat:create",
            }),
        },
    },
};

if (env.NODE_ENV !== "production") globalForRatelimits.ratelimits = ratelimits;
