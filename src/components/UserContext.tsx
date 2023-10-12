import Image from "next/image";

import VerifiedCheck from "~/components/Verified";

export default function UserContext({
    user,
    className,
    onClick,
}: {
    user: {
        name: string | null;
        id: string;
        tag: string | null;
        image: string | null;
        verified: boolean | null;
    };
    className?: string;
    onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}) {
    return (
        <div
            className={[
                "w-full h-16 flex gap-3 px-4 py-2 transition-colors hover:bg-black/20 dark:hover:bg-white/5",
                className,
            ].join(" ")}
            onClick={onClick}
        >
            <div className="h-full aspect-square rounded-full overflow-hidden flex-none">
                <Image
                    src={user.image ?? "/assets/imgs/default-avatar.png"}
                    alt={`${user.name}'s avatar`}
                    height={40}
                    width={40}
                    className={"object-cover h-full w-full"}
                />
            </div>
            <div className="flex flex-col py-1">
                <div className="flex items-center">
                    <p className="font-bold text-black dark:text-white leading-none truncate">
                        {user.name}
                    </p>
                    {user.verified ? <VerifiedCheck /> : null}
                </div>
                <p className="text-gray-500 leading-none mt-px truncate">
                    @{user.tag}
                </p>
            </div>
        </div>
    );
}
