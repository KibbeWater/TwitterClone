import { XMarkIcon, CheckIcon } from "@heroicons/react/20/solid";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

import { useModal } from "~/components/Handlers/ModalHandler";

import { isPremium as _isPremium } from "~/utils/user";
import { api } from "~/utils/api";
import { useCallback } from "react";

export default function PremiumModal() {
    const { closeModal } = useModal();
    const router = useRouter();

    const { data: session } = useSession();

    const {
        mutate: _generatePaymentSession,
        isLoading: isGeneratingPaymentSession,
    } = api.stripe.openPremiumLink.useMutation();

    const isPremium = _isPremium(session?.user);

    const generatePaymentSession = useCallback(
        ({ trial }: { trial?: boolean }) => {
            _generatePaymentSession(
                { trial },
                {
                    onSuccess: (link: string | null) => {
                        if (link) router.push(link).catch(console.error);
                    },
                },
            );
        },
        [_generatePaymentSession, router],
    );

    return (
        <div className="bg-white dark:bg-black shadow-xl rounded-2xl relative flex flex-col overflow-hidden max-w-[600px] max-h-[80vh] w-full">
            <div className="flex items-center p-2 gap-8 absolute right-5 top-0 left-0 bg-white/30 dark:bg-black/30 backdrop-blur-xl">
                <div
                    className="w-8 h-8 rounded-full cursor-pointer bg-black/0 hover:bg-neutral-500/10"
                    onClick={() => closeModal()}
                >
                    <XMarkIcon className={"text-black dark:text-white"} />
                </div>
                <p className="text-2xl font-semibold">Subscribe</p>
            </div>
            {isPremium ? (
                <div className="w-full h-full flex items-center justify-center pb-8 pt-4 mt-12">
                    <CheckIcon className="w-8 h-8 text-green-500" />
                    <p>Hey! You are already a Twatter RED subscriber.</p>
                </div>
            ) : (
                <div className="flex flex-col items-center overflow-hidden">
                    <div className="grow w-full overflow-y-auto px-8 py-8 flex flex-col gap-4 pt-12">
                        <div className="rounded-lg bg-neutral-200 dark:bg-zinc-800 px-4 py-2 w-full gap-[6px] flex flex-col">
                            <h3 className="font-semibold text-xl">
                                Enhanced Experience
                            </h3>
                            {[
                                "Edit post",
                                "Longer posts",
                                "Undo post",
                                "Upload videos (PLANNED)",
                            ].map((item, idx) => (
                                <div
                                    key={`enhc-ftr-${idx}`}
                                    className="flex justify-between items-center gap-8 w-full"
                                >
                                    <p>{item}</p>
                                    <CheckIcon className="w-5 h-5 text-green-500" />
                                </div>
                            ))}
                        </div>
                        <div className="rounded-lg bg-neutral-200 dark:bg-zinc-800 px-4 py-2 w-full gap-[6px] flex flex-col">
                            <h3 className="font-semibold text-xl">
                                Customization
                            </h3>
                            {[
                                "Shorter tag resets",
                                "Checkmark",
                                "Hide posts",
                                "Hide followings",
                            ].map((item, idx) => (
                                <div
                                    key={`enhc-ftr-${idx}`}
                                    className="flex justify-between items-center gap-8 w-full"
                                >
                                    <p>{item}</p>
                                    <CheckIcon className="w-5 h-5 text-green-500" />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex-none flex gap-4 grow-0 py-4 px-8 w-full shadow-[0_-35px_60px_-15px_rgba(0,0,0,0.35)] dark:shadow-[0_-35px_60px_-15px_rgba(255,255,255,0.1)] border-t-[1px] border-highlight-light dark:border-highlight-dark">
                        <button
                            onClick={() => generatePaymentSession({})}
                            disabled={isGeneratingPaymentSession}
                            className="w-full rounded-full bg-black dark:bg-white dark:hover:bg-white/80 hover:bg-black/80 transition-colors text-white dark:text-black disabled:!bg-neutral-500 font-semibold py-1"
                        >
                            Subscribe & Pay
                        </button>
                        <button
                            onClick={() =>
                                generatePaymentSession({ trial: true })
                            }
                            disabled={isGeneratingPaymentSession}
                            className="w-full rounded-full border-black dark:border-white hover:bg-black/10 dark:hover:bg-white/10 transition-colors border-[2px] dark:text-white text-black font-semibold py-1"
                        >
                            Try out for 14 days
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
