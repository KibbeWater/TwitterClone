import { z } from "zod";

import { env } from "~/env.mjs";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { stripe } from "~/server/stripe/client";

export const stripeRouter = createTRPCRouter({
    openPremiumLink: protectedProcedure
        .input(z.object({}))
        .mutation(async ({ ctx }) => {
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
                success_url: `${env.NEXTAUTH_URL}/`,
                client_reference_id: user.id,
                subscription_data: {
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
