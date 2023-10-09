import { XMarkIcon } from "@heroicons/react/20/solid";
import type { User } from "@prisma/client";
import { useMemo, useCallback, useState } from "react";

import { useModal } from "~/components/Handlers/ModalHandler";

import { api } from "~/utils/api";

export default function AdminModal({
    userId,
    onMutate,
}: {
    userId: string;
    onMutate?: (user: User) => void;
}) {
    const { closeModal } = useModal();

    const [activeTab, setActiveTab] = useState(0);

    const { data: user, refetch: _refetchUser } = api.admin.getUser.useQuery({
        id: userId,
    });

    const refetchUser = useCallback(() => {
        _refetchUser().catch(console.error);
    }, [_refetchUser]);

    const { mutate: _verifyUser, isLoading: isVerifying } =
        api.admin.setUserVerification.useMutation({
            onSuccess: (data) => {
                onMutate?.(data);
                refetchUser();
            },
        });

    const { mutate: _setTagCooldown, isLoading: isResetting } =
        api.admin.setUserTagCooldown.useMutation({
            onSuccess: (data) => {
                onMutate?.(data);
                refetchUser();
            },
        });

    const verifyUser = useCallback<(shouldVerify: boolean) => void>(() => {
        _verifyUser({ id: user!.id, shouldVerify: !user?.verified });
    }, [_verifyUser, user]);

    const resetTagCooldown = useCallback<(newDate?: Date) => void>(
        (newDate) => {
            _setTagCooldown({ id: user!.id, newDate: newDate ?? new Date(0) });
        },
        [_setTagCooldown, user],
    );

    const menuOptions = useMemo<
        { name: string; element: (user: User) => JSX.Element }[]
    >(
        () => [
            {
                name: "Overview",
                element: (_user) => (
                    <div className="w-full h-full flex flex-col gap-4 p-4">
                        <div>
                            <p className="text-black dark:text-white">
                                Verified:{" "}
                                <span
                                    className={`${
                                        _user.verified
                                            ? "text-green-500"
                                            : "text-red-500"
                                    }`}
                                >
                                    {_user.verified ? "Yes" : "No"}
                                </span>
                            </p>
                            <button
                                className="py-1 px-2 bg-black dark:bg-white dark:text-black text-white rounded-lg w-min whitespace-nowrap disabled:bg-black/20 dark:disabled:bg-white/80"
                                onClick={() => verifyUser(!_user?.verified)}
                                disabled={isVerifying}
                            >
                                {"Verify User"}
                            </button>
                        </div>
                        <div className="flex flex-col gap-2">
                            <p className="text-black dark:text-white">
                                Latest Tag Reset:{" "}
                                <span
                                    className={
                                        new Date(
                                            new Date(
                                                _user.lastTagReset,
                                            ).getTime() +
                                                30 * 24 * 60 * 60 * 1000,
                                        ) < new Date()
                                            ? "text-green-500"
                                            : "text-red-500"
                                    }
                                >
                                    {new Date(
                                        new Date(_user.lastTagReset).getTime() +
                                            30 * 24 * 60 * 60 * 1000,
                                    ).toLocaleString() ?? "N/A"}
                                </span>
                            </p>
                            <button
                                className="py-1 px-2 bg-black dark:bg-white dark:text-black text-white rounded-lg w-min whitespace-nowrap disabled:bg-black/20 dark:disabled:bg-white/80"
                                onClick={() => resetTagCooldown()}
                                disabled={isResetting}
                            >
                                Reset Cooldown
                            </button>
                            <button
                                className="py-1 px-2 bg-black dark:bg-white dark:text-black text-white rounded-lg w-min whitespace-nowrap disabled:bg-black/20 dark:disabled:bg-white/80"
                                onClick={() => resetTagCooldown(new Date())}
                                disabled={isResetting}
                            >
                                Set Cooldown
                            </button>
                        </div>
                    </div>
                ),
            },
            {
                name: "Info",
                element: () => <></>,
            },
        ],
        [isVerifying, verifyUser, isResetting, resetTagCooldown],
    );

    return (
        <div className="w-6/12 md:w-9/12 h-4/6 bg-white dark:bg-neutral-900 shadow-xl rounded-lg flex relative overflow-hidden">
            <div
                className={
                    "w-8 h-8 rounded-full cursor-pointer flex items-center justify-center bg-black/0 hover:bg-black/10 absolute top-2 right-2"
                }
                onClick={() => closeModal()}
            >
                <XMarkIcon className={"text-black dark:text-white"} />
            </div>
            <div className="flex grow-0 w-min h-full py-4 border-gray-200 dark:border-gray-700 border-r-[1px] overflow-x-hidden overflow-y-auto">
                <div className="h-full w-full min-w-[8rem] flex flex-col gap-1 whitespace-nowrap">
                    {menuOptions.map((option, idx) => (
                        <a
                            onClick={() => setActiveTab(idx)}
                            key={`admMenu-nav-${option.name}`}
                            className={`text-xl text-black dark:text-white cursor-pointer grow-0 py-1 pl-4 w-full hover:bg-white/10 ${
                                activeTab === idx ? "font-semibold" : ""
                            }`}
                        >
                            {option.name}
                        </a>
                    ))}
                </div>
            </div>
            {user ? (
                <div className="grow">
                    {menuOptions[activeTab]!.element(user)}
                </div>
            ) : (
                <div className="w-full h-full flex justify-center items-center">
                    <p className="text-black dark:text-white">Loading...</p>
                </div>
            )}
        </div>
    );
}
