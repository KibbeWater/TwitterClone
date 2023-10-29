import { ArrowPathIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import { useRouter } from "next/router";
import { useCallback, useState } from "react";

import { useModal } from "~/components/Handlers/ModalHandler";
import UserContext from "~/components/UserContext";
import { api } from "~/utils/api";

export default function MessageModal() {
    const [query, setQuery] = useState("");
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

    const { closeModal } = useModal();
    const { push } = useRouter();

    const { data: following } = api.followers.getFollowing.useQuery({});
    const { data: search, isLoading: isLoadingSearch } =
        api.user.findUsers.useQuery({ query }, { keepPreviousData: true });

    const { mutate: _createChat, isLoading: isCreatingChat } =
        api.chat.createChat.useMutation();

    const createChat = useCallback(() => {
        _createChat(
            {
                participants: selectedUsers,
            },
            {
                onSuccess: (data) => {
                    closeModal();
                    push(`/message/${data.id}`).catch(console.error);
                },
            },
        );
    }, [selectedUsers, _createChat, closeModal, push]);

    const users = isLoadingSearch ? [] : search ?? following ?? [];

    const selectUser = useCallback<(user: { id: string }) => void>((user) => {
        setSelectedUsers((users) => [...users, user.id]);
    }, []);

    const unselectUser = useCallback<(user: { id: string }) => void>((user) => {
        setSelectedUsers((users) => users.filter((u) => u !== user.id));
    }, []);

    const selectedUsersList = users.filter((user) =>
        selectedUsers.includes(user.id),
    );

    return (
        <div className="flex-col bg-black rounded-lg lg:w-[35%] md:w-1/3 w-5/6 max-h-[90vh] h-[650px] overflow-hidden">
            <div className="flex justify-between items-center px-4 py-2 grow-0">
                <div className="flex items-center">
                    <button onClick={() => closeModal()}>
                        <XMarkIcon className="h-7 w-7 text-black dark:text-white" />
                    </button>
                    <h1 className="ml-5 text-xl leading-none font-semibold">
                        New message
                    </h1>
                </div>
                <div>
                    <button
                        onClick={createChat}
                        disabled={selectedUsers.length === 0 || isCreatingChat}
                        className="px-4 py-1 font-semibold rounded-full bg-black dark:bg-white disables:bg-neutral-500 hover:bg-neutral-700 dark:hover:bg-neutral-200 text-white dark:text-black disabled:!bg-neutral-500 transition-colors"
                    >
                        Next
                    </button>
                </div>
            </div>
            <div className="border-b-[1px] border-highlight-light dark:border-highlight-dark">
                <div className="py-2 px-4">
                    <label className="flex flex-row-reverse gap-1 items-center hover:outline-none">
                        <input
                            type="text"
                            placeholder="Search people"
                            className="grow dark:bg-black bg-white h-full outline-none peer"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <MagnifyingGlassIcon className="h-5 w-8 text-black dark:text-white mr-4 peer-focus:text-accent-primary-500" />
                    </label>
                </div>
                {selectedUsers.length > 0 && (
                    <div className="flex flex-wrap py-2 px-4 gap-2">
                        {selectedUsersList.map((user) => (
                            <div
                                className="flex p-[2px] gap-4 border-[1px] border-highlight-light dark:border-highlight-dark rounded-full items-center"
                                key={`sel-${user.id}`}
                            >
                                <div className="flex gap-2">
                                    <Image
                                        src={
                                            user.image ??
                                            "/assets/imgs/default-avatar.png"
                                        }
                                        className="h-5 w-5 rounded-full"
                                        alt="User profile picture"
                                        height={12}
                                        width={12}
                                    />
                                    <p className="leading-none">{user.name}</p>
                                </div>
                                <button onClick={() => unselectUser(user)}>
                                    <XMarkIcon className="h-5 w-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div className="flex flex-col grow">
                {users.map((user) => (
                    <UserContext
                        onClick={() => selectUser(user)}
                        key={`ctx-${user.id}`}
                        className="!py-4 cursor-pointer"
                        user={user}
                    />
                ))}
            </div>
            {isLoadingSearch && (
                <div className="grow-0 w-full flex justify-center py-2">
                    <ArrowPathIcon
                        className={
                            "animate-spin h-[1.5em] text-black dark:text-white"
                        }
                    />
                </div>
            )}
        </div>
    );
}
