import { useRouter } from "next/router";

export default function LinkPage() {
    const { query, back } = useRouter();
    const link = query.l as string | undefined;
    const decodedLink = link ? decodeURIComponent(link) : undefined;

    if (!link)
        return (
            <div className="w-screen h-screen overflow-hidden flex justify-center items-center bg-neutral-100 dark:bg-neutral-800">
                <div className="w-1/2 p-12 bg-white dark:bg-neutral-900 shadow-xl rounded-lg text-center flex gap-2 flex-col">
                    <h2 className="text-xl font-semibold text-black dark:text-white">
                        The link is invalid.
                    </h2>
                    <p className="text-black dark:text-white">
                        The link you are trying to access is invalid. Please
                        return to the previous page and try again.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <button
                            className="px-3 py-1 bg-accent-primary-500 hover:bg-accent-primary-700 transition-all duration-300 hover:-translate-y-[2px] text-white rounded-lg"
                            tabIndex={0}
                            onClick={() => back()}
                        >
                            Return
                        </button>
                    </div>
                </div>
            </div>
        );

    const url = new URL(decodedLink!);

    return (
        <div className="w-screen h-screen overflow-hidden flex justify-center items-center bg-neutral-100 dark:bg-neutral-800">
            <div className="w-1/2 p-12 bg-white dark:bg-neutral-900 shadow-xl rounded-lg text-center flex gap-2 flex-col">
                <h2 className="text-xl font-semibold text-black dark:text-white">
                    Are you sure you want to continue?
                </h2>
                <p className="text-black dark:text-white">
                    You are about to be redirected to{" "}
                    <a
                        className="text-blue-500 dark:text-blue-400"
                        href={url.toString()}
                        tabIndex={-1}
                    >
                        {url.toString()}
                    </a>
                    .<br />
                    If you are sure you want to continue, click the continue
                    button below.
                </p>
                <div className="flex gap-4 justify-center">
                    <a
                        className="px-3 py-1 bg-accent-primary-500 hover:bg-accent-primary-700 transition-all duration-300 hover:-translate-y-[2px] text-white rounded-lg"
                        tabIndex={0}
                        href={url.toString()}
                    >
                        Continue
                    </a>
                    <button
                        className="px-3 py-1 dark:text-black dark:bg-white dark:hover:bg-neutral-200 bg-black hover:bg-neutral-800 transition-all duration-300 hover:-translate-y-[2px] text-white rounded-lg"
                        tabIndex={0}
                        onClick={() => window.close()}
                    >
                        Return
                    </button>
                </div>
            </div>
        </div>
    );
}
