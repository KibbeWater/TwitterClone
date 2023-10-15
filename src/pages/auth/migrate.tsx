import { signIn } from "next-auth/react";
import { useState, useCallback } from "react";
import { z } from "zod";

import { api } from "~/utils/api";

export default function Migrate() {
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const {
        mutate: _migrateAccount,
        isLoading: isMigrating,
        error,
        isError,
    } = api.migrate.migrateUser.useMutation();

    const migrateAccount = useCallback(() => {
        _migrateAccount(
            {
                username,
                password,
                newEmail: email,
            },
            {
                onSuccess: () => {
                    signIn("email", { email, callbackUrl: "/" }).catch(
                        console.error,
                    );
                },
            },
        );
    }, [username, password, email, _migrateAccount]);

    return (
        <div className="w-screen h-screen overflow-hidden flex justify-center items-center">
            <div className="flex flex-col px-6 py-4 bg-neutral-800 shadow-xl rounded-lg gap-3">
                <h1 className="text-xl font-semibold w-full text-center">
                    Migrate Account
                </h1>
                <div className="flex flex-col">
                    <label className="flex flex-col">
                        New Email
                        <input
                            className="pl-2 py-[2px] rounded-md"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </label>
                    <label className="flex flex-col">
                        Username
                        <input
                            className="pl-2 py-[2px] rounded-md"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </label>
                    <label className="flex flex-col">
                        Password
                        <input
                            className="pl-2 py-[2px] rounded-md"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </label>
                </div>
                {isError && (
                    <p className="text-red-500 w-full">
                        Error: {error.message}
                    </p>
                )}
                <button
                    className="w-full py-1 bg-blue-600 hover:bg-blue-700 transition-colors disabled:bg-blue-900 rounded-md"
                    disabled={
                        isMigrating ||
                        !z.string().email().safeParse(email).success ||
                        !username ||
                        !password
                    }
                    onClick={() => migrateAccount()}
                >
                    Migrate Account
                </button>
            </div>
        </div>
    );
}
