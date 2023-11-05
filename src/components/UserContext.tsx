import Image from "next/image";

import VerifiedCheck from "~/components/Verified";
import { PERMISSIONS, hasPermission } from "~/utils/permission";
import { isPremium } from "~/utils/user";

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
        roles: { id: string; permissions: string }[];
        permissions: string;
    };
    className?: string;
    onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}) {
    const isVerified =
        ((user.verified ?? false) || isPremium(user)) &&
        !hasPermission(user, PERMISSIONS.HIDE_VERIFICATION);

    return (
        <div
            className={[
                "w-full flex gap-3 px-4 py-2 transition-colors hover:bg-black/20 dark:hover:bg-white/5",
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
            <div className="flex flex-col pt-1">
                <div className="flex items-center">
                    <p className="font-bold text-black dark:text-white leading-tight truncate">
                        {user.name}
                    </p>
                    {isVerified ? <VerifiedCheck /> : null}
                </div>
                <p className="text-gray-500 leading-tight truncate">
                    @{user.tag}
                </p>
            </div>
        </div>
    );
}
