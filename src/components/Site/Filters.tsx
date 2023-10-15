import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/router";
import { useState } from "react";

import UserContext from "~/components/UserContext";

import { api } from "~/utils/api";

export default function Filters() {
    const { push } = useRouter();

    const [active, setActive] = useState(false);
    const [search, setSearch] = useState("");

    const { data: usrResults } = api.user.findUsers.useQuery({ query: search });

    const isActive = active || search.length > 0;
    const results = search.length !== 0 ? usrResults : [];

    return (
        <div
            className={
                "h-full w-[37%] border-l-[1px] border-gray-200 dark:border-gray-700 hidden lg:block bg-white dark:bg-black"
            }
        >
            <div className={"h-full w-[70%] ml-8 pt-1"}>
                <div
                    className={`w-full h-11 rounded-3xl mb-2 flex items-center ${
                        isActive
                            ? "bg-white dark:bg-black"
                            : "bg-[#eff3f4] dark:bg-neutral-800"
                    } ${
                        isActive ? "border-[#e26161]" : "border-transparent"
                    } border-[1px]`}
                >
                    <div
                        className={`${
                            isActive ? "flex" : "hidden"
                        } absolute top-12 w-80 ${
                            results?.length === 0
                                ? "h-24 justify-center "
                                : "flex-col "
                        } bg-white dark:bg-neutral-900 shadow-2xl rounded-2xl overflow-hidden`}
                    >
                        {results?.length !== 0 ? (
                            results?.map((user) => (
                                <UserContext
                                    user={user}
                                    key={`search-result-${user.id}`}
                                    className="cursor-pointer"
                                    onClick={() => {
                                        push(`/@${user.tag}`).catch(
                                            console.error,
                                        );
                                    }}
                                />
                            ))
                        ) : (
                            <p
                                className={
                                    "text-zinc-400 text-sm text-center mt-3"
                                }
                            >
                                Try searching for people, topics or keywords
                            </p>
                        )}
                    </div>
                    <div className={"mr-3 ml-4 w-4 h-4 flex justify-center"}>
                        <MagnifyingGlassIcon className="text-black dark:text-white" />
                    </div>
                    <div className={"w-full h-6"}>
                        <input
                            type="text"
                            onBlur={() => setActive(false)}
                            onFocus={() => setActive(true)}
                            onChange={(e) => setSearch(e.target.value)}
                            value={search}
                            className={`w-full h-full ${
                                isActive
                                    ? "bg-white dark:bg-black"
                                    : "bg-[#eff3f4] dark:bg-neutral-800"
                            } text-sm outline-none rounded-r-3xl text-black dark:text-white leading-none h-6`}
                            placeholder="Search Twatter"
                        />
                    </div>
                </div>
                <section className="trends">
                    <div className="trends__header"></div>
                </section>
            </div>
        </div>
    );
}
