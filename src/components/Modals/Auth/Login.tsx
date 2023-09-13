import { useState } from "react";

import { ExclamationCircleIcon } from "@heroicons/react/20/solid";
import { signIn } from "next-auth/react";

export default function Login() {
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState("");

    return (
        <div
            className="p-4 bg-white dark:bg-dark rounded-lg flex flex-col gap-6"
            onClick={(e) => e.stopPropagation()}
        >
            <h2 className="text-2xl text-center">Sign In</h2>
            <div className="flex flex-col gap-4">
                <div>
                    <label
                        htmlFor="email"
                        className="block text-sm font-medium leading-6 text-gray-900"
                    >
                        Email
                    </label>
                    <div className="relative mt-2 rounded-md shadow-sm">
                        <input
                            type="email"
                            name="email"
                            id="email"
                            className="block w-full rounded-md border-0 py-1.5 pr-10 text-red-900 ring-1 ring-inset ring-red-300 placeholder:text-red-300 focus:ring-2 focus:ring-inset focus:ring-red-500 sm:text-sm sm:leading-6"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            aria-invalid="true"
                            aria-describedby="email-error"
                        />
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                            <ExclamationCircleIcon
                                className="h-5 w-5 text-red-500"
                                aria-hidden="true"
                            />
                        </div>
                    </div>
                    <p className="mt-2 text-sm text-red-600" id="email-error">
                        Not a valid email address.
                    </p>
                </div>
            </div>
            <button
                onClick={() => {
                    signIn("email", { email })
                        .then((res) => {
                            console.log(res);
                        })
                        .catch((err) => {
                            console.log(err);
                        });
                }}
            >
                Sign In
            </button>
        </div>
    );
}
