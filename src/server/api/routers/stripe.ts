import { z } from "zod";

import { env } from "~/env.mjs";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { stripe } from "~/server/stripe/client";

const getBaseUrl = () => {
    if (typeof window !== "undefined") return ""; // browser should use relative url
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url
    return `http://localhost:${process.env.PORT ?? 3000}`; // dev SSR should use localhost
};

export const stripeRouter = createTRPCRouter({
    openPremiumLink: protectedProcedure
        .input(z.object({ trial: z.boolean().optional() }))
        .mutation(async ({ ctx, input }) => {
            const { user } = ctx.session;

            const fullUser = await ctx.prisma.user.findUnique({
                where: { id: user.id },
                include: { stripeCustomer: true },
            });

            let customerId = fullUser?.stripeCustomer?.stripeCustomerId;
            if (!customerId) {
                const customer = await stripe.customers.create({
                    email: user.email ?? undefined,
                });

                customerId = customer.id;

                await ctx.prisma.customer.create({
                    data: {
                        stripeCustomerId: customerId,
                        user: {
                            connect: {
                                id: user.id,
                            },
                        },
                    },
                });
            }

            const link = await stripe.checkout.sessions.create({
                mode: "subscription",
                customer: customerId,
                success_url: `${getBaseUrl()}/`,
                client_reference_id: user.id,
                subscription_data: {
                    trial_period_days: input.trial ? 14 : undefined,
                    metadata: {
                        userId: user.id,
                    },
                },
                line_items: [
                    {
                        price: env.STRIPE_PREMIUM_PRICE_ID,
                        quantity: 1,
                    },
                ],
            });

            return link.url;
        }),
});
