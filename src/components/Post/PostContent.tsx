import Link from "next/link";

import { usernameRegex } from "~/utils/regexStandards";

export default function PostContent({ post }: { post: { content: string } }) {
    return (
        <div className="w-full max-w-full">
            <p className="text-black dark:text-white">
                {post.content.split("\n").map((line, idx, arr) => {
                    return (
                        <span key={idx}>
                            <>
                                {line.split(" ").map((word, idx, arr) => {
                                    // If we do @(username), make it a link
                                    if (
                                        word.startsWith("@") &&
                                        usernameRegex.test(word.substring(1))
                                    ) {
                                        const username = word.substring(1);
                                        return (
                                            <Link
                                                key={idx}
                                                href={`/user/${username}`}
                                                className="text-blue-500 dark:text-blue-400 cursor-pointer hover:underline"
                                                prefetch={false}
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                            >
                                                {word}
                                                {idx !== arr.length - 1 && " "}
                                            </Link>
                                        );
                                    }

                                    // If we do a valid http/https link, make it redirect through our /link proxy (only if it's a valid link verified with regex)
                                    const linkRegex =
                                        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
                                    if (linkRegex.test(word)) {
                                        return (
                                            <a
                                                key={idx}
                                                href={`/link?l=${encodeURIComponent(
                                                    word,
                                                )}`}
                                                className="text-blue-500 dark:text-blue-400 cursor-pointer hover:underline"
                                                target="_blank"
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                            >
                                                {word}
                                                {idx !== arr.length - 1 && " "}
                                            </a>
                                        );
                                    }

                                    return (
                                        <span key={idx}>
                                            {word}
                                            {idx !== arr.length - 1 && " "}
                                        </span>
                                    );
                                })}
                            </>
                            {idx !== arr.length - 1 && <br />}
                        </span>
                    );
                })}
            </p>
        </div>
    );
}
