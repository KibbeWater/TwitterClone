import { createTRPCRouter } from "~/server/api/trpc";
import { postRouter } from "./routers/post";
import { userRouter } from "./routers/user";
import { followersRouter } from "./routers/followers";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
    post: postRouter,
    user: userRouter,
    followers: followersRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
