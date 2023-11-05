import { buffer } from "micro";
import type { NextApiRequest, NextApiResponse } from "next";
import type Stripe from "stripe";

import { env } from "~/env.mjs";
import { prisma } from "~/server/db";
import { stripe } from "~/server/stripe/client";

export const config = {
    api: {
        bodyParser: false,
    },
};

const webhookSecret = env.STRIPE_WEBHOOK_SECRET;

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    if (req.method === "POST") {
        const buf = await buffer(req);
        const sig = req.headers["stripe-signature"];

        let event: Stripe.Event;

        console.log("Received event:", sig);

        try {
            event = stripe.webhooks.constructEvent(
                buf,
                sig as string,
                webhookSecret,
            );

            console.log("Event constructed");
            console.log("Switching event type:", event.type);

            // Handle the event
            switch (event.type) {
                case "invoice.paid":
                    const invoice = event.data.object;
                    const subscriptionId = invoice.subscription;
                    const invoiceSub = await stripe.subscriptions.retrieve(
                        subscriptionId as string,
                    );

                    const invoiceCustomerId =
                        typeof invoiceSub.customer === "string"
                            ? invoiceSub.customer
                            : invoiceSub.customer.id;

                    try {
                        const newSub = await prisma.subscription.upsert({
                            where: {
                                stripeId: invoiceSub.id,
                            },
                            update: {
                                status: invoiceSub.status,
                                startDate: new Date(
                                    invoiceSub.start_date * 1000,
                                ),
                                endDate: new Date(
                                    invoiceSub.current_period_end * 1000,
                                ),
                            },
                            create: {
                                stripeId: invoiceSub.id,
                                status: invoiceSub.status,
                                startDate: new Date(
                                    invoiceSub.start_date * 1000,
                                ),
                                endDate: new Date(
                                    invoiceSub.current_period_end * 1000,
                                ),
                                customer: {
                                    connectOrCreate: {
                                        where: {
                                            stripeCustomerId: invoiceCustomerId,
                                        },
                                        create: {
                                            stripeCustomerId: invoiceCustomerId,
                                            user: {
                                                connect: {
                                                    id: invoiceSub.metadata
                                                        .userId,
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                            include: {
                                customer: true,
                            },
                        });

                        if (!env.PREMIUM_ROLE_ID) break;

                        const premiumRole = await prisma.role.findUnique({
                            where: {
                                id: env.PREMIUM_ROLE_ID,
                            },
                        });

                        const user = await prisma.user.findUnique({
                            where: {
                                id: newSub.customer.userId,
                            },
                            include: {
                                stripeCustomer: {
                                    include: {
                                        subscriptions: true,
                                    },
                                },
                            },
                        });

                        if (!premiumRole || !user) break;

                        const hasPremium =
                            user.stripeCustomer?.subscriptions.some(
                                (s) =>
                                    (s.status === "active" ||
                                        s.status === "trialing") &&
                                    s.endDate > new Date(),
                            );

                        await prisma.user.update({
                            where: {
                                id: user.id,
                            },
                            data: {
                                roles: {
                                    [hasPremium ? "connect" : "disconnect"]: {
                                        id: premiumRole.id,
                                    },
                                },
                            },
                        });
                    } catch (error) {
                        console.error(error);
                    }

                    break;
                case "customer.subscription.deleted":
                case "customer.subscription.updated":
                case "customer.subscription.created":
                    const subscription = event.data.object;

                    const customerId =
                        typeof subscription.customer === "string"
                            ? subscription.customer
                            : subscription.customer.id;

                    try {
                        const newSub = await prisma.subscription.upsert({
                            where: {
                                stripeId: subscription.id,
                            },
                            update: {
                                status: subscription.status,
                                startDate: new Date(
                                    subscription.start_date * 1000,
                                ),
                                endDate: new Date(
                                    subscription.current_period_end * 1000,
                                ),
                            },
                            create: {
                                stripeId: subscription.id,
                                status: subscription.status,
                                startDate: new Date(
                                    subscription.start_date * 1000,
                                ),
                                endDate: new Date(
                                    subscription.current_period_end * 1000,
                                ),
                                customer: {
                                    connectOrCreate: {
                                        where: {
                                            stripeCustomerId: customerId,
                                        },
                                        create: {
                                            stripeCustomerId: customerId,
                                            user: {
                                                connect: {
                                                    id: subscription.metadata
                                                        .userId,
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                            include: {
                                customer: true,
                            },
                        });

                        if (!env.PREMIUM_ROLE_ID) break;

                        const premiumRole = await prisma.role.findUnique({
                            where: {
                                id: env.PREMIUM_ROLE_ID,
                            },
                        });

                        const user = await prisma.user.findUnique({
                            where: {
                                id: newSub.customer.userId,
                            },
                            include: {
                                stripeCustomer: {
                                    include: {
                                        subscriptions: true,
                                    },
                                },
                            },
                        });

                        if (!premiumRole || !user) break;

                        const hasPremium =
                            user.stripeCustomer?.subscriptions.some(
                                (s) =>
                                    (s.status === "active" ||
                                        s.status === "trialing") &&
                                    s.endDate > new Date(),
                            );

                        await prisma.user.update({
                            where: {
                                id: user.id,
                            },
                            data: {
                                roles: {
                                    [hasPremium ? "connect" : "disconnect"]: {
                                        id: premiumRole.id,
                                    },
                                },
                            },
                        });
                    } catch (error) {
                        console.error(error);
                    }

                    break;
                case "invoice.payment_failed":
                    // If the payment fails or the customer does not have a valid payment method,
                    //  an invoice.payment_failed event is sent, the subscription becomes past_due.
                    // Use this webhook to notify your user that their payment has
                    // failed and to retrieve new card details.
                    // Can also have Stripe send an email to the customer notifying them of the failure. See settings: https://dashboard.stripe.com/settings/billing/automatic
                    break;
                default:
                // Unexpected event type
            }

            // record the event in the database
            await prisma.stripeEvent.create({
                data: {
                    stripeId: event.id,
                    type: event.type,
                    object: event.object,
                    api_version: event.api_version,
                    account: event.account,
                    created: new Date(event.created * 1000),
                    data: JSON.stringify({
                        object: event.data.object,
                        previous_attributes: event.data.previous_attributes,
                    }),
                    livemode: event.livemode,
                    pending_webhooks: event.pending_webhooks,
                    request: {
                        id: event.request?.id,
                        idempotency_key: event.request?.idempotency_key,
                    },
                },
            });

            res.json({ received: true });
        } catch (err) {
            res.status(400).send(err);
            console.log(err);
            return;
        }
    } else {
        res.setHeader("Allow", "POST");
        res.status(405).end("Method Not Allowed");
    }
}
