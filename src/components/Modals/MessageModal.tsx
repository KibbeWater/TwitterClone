import { XMarkIcon } from "@heroicons/react/20/solid";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { useState } from "react";

import { useModal } from "~/components/Handlers/ModalHandler";
import UserContext from "~/components/UserContext";
import { api } from "~/utils/api";

export default function MessageModal() {
    const [query, setQuery] = useState("");

    const { closeModal } = useModal();

    const { data: following } = api.followers.getFollowing.useQuery({});
    const { data: search } = api.user.findUsers.useQuery({ query });

    const users = search ?? following ?? [];

    return (
        <div className="flex-col bg-black rounded-lg lg:w-[35%] md:w-1/3 w-5/6 max-h-[90vh] h-[650px]">
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
                    <button className="px-4 py-1 font-semibold rounded-full bg-black dark:bg-white disables:bg-neutral-500 hover:bg-neutral-700 dark:hover:bg-neutral-200 text-white dark:text-black">
                        Next
                    </button>
                </div>
            </div>
            <div className="py-2 px-2">
                <label className="flex gap-1 items-center hover:outline-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-black dark:text-white mr-4 peer-hover/search:text-accent-primary-500" />
                    <input
                        type="text"
                        placeholder="Search people"
                        className="grow dark:bg-black bg-white h-full outline-none peer/search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </label>
            </div>
            <div className="flex flex-col grow">
                {users.map((user) => (
                    <UserContext
                        key={`ctx-${user.id}`}
                        className="!py-4"
                        user={user}
                    />
                ))}
                di
            </div>
        </div>
    );
}
