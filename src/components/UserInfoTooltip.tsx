import Image from "next/image";

import { useModal } from "~/components/Handlers/ModalHandler";
import PostContent from "~/components/Post/PostContent";
import FollowingModal from "./Modals/FollowingModal";
import VerifiedCheck from "./Verified";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useCallback, useState } from "react";
import { api } from "~/utils/api";

type User = {
    id: string;
    name: string | null;
    tag: string | null;
    bio: string | null;
    image: string | null;
    followerIds: string[];
    followingIds: string[];
};

function isUserFollowing(
    user: { id: string } | undefined,
    profile: { followerIds: string[] } | undefined,
) {
    if (!user || !profile) return false;
    return profile.followerIds.find((u) => u === user.id) !== undefined;
}

export default function UserInfoTooltip({ user }: { user: User }) {
    const { setModal } = useModal();
    const { data: session } = useSession();

    const [followingText, setFollowingText] = useState<
        "Unfollow" | "Following"
    >("Following");
    const [isFollowing, setIsFollowing] = useState(
        isUserFollowing(session?.user, user),
    );

    const { mutate: _setFollowing } = api.followers.setFollowing.useMutation();

    const setFollowing = useCallback(
        (shouldFollow: boolean) => {
            if (!user) return;

            const oldFollow = isFollowing;
            setIsFollowing(shouldFollow);

            _setFollowing(
                { id: user.id, shouldFollow },
                {
                    onSuccess: () => setIsFollowing(shouldFollow),
                    onError: () => setIsFollowing(oldFollow),
                },
            );
        },
        [user, _setFollowing, isFollowing],
    );

    const isMe =
        session?.user?.id === user?.id && session?.user?.id !== undefined;

    return (
        <div
            className="flex flex-col gap-2 rounded-xl bg-white dark:bg-black shadow-white min-w-[18rem] p-4 cursor-default"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="flex justify-between">
                <Image
                    src={user.image ?? "/assets/imgs/default-avatar.png"}
                    alt={`${user.name}'s avatar`}
                    className="rounded-full w-16 h-16 object-cover"
                    width={64}
                    height={64}
                />
                <div className="flex flex-col ">
                    {isMe ? (
                        <></>
                    ) : isFollowing ? (
                        <button
                            className={
                                "bg-black/0 px-[15px] py-2 font-semibold border-[1px] text-black dark:text-white border-gray-700 min-w-[36px] transition-all rounded-full " +
                                "hover:bg-red-500/10 hover:text-red-600 hover:border-red-300 hover:cursor-pointer"
                            }
                            onClick={() => {
                                setFollowing(false);
                            }}
                            onMouseEnter={() => setFollowingText("Unfollow")}
                            onMouseLeave={() => setFollowingText("Following")}
                        >
                            {followingText}
                        </button>
                    ) : (
                        <button
                            className={
                                "bg-black dark:bg-white text-white dark:text-black px-[15px] py-2 font-bold cursor-pointer rounded-full"
                            }
                            onClick={() => {
                                setFollowing(true);
                            }}
                        >
                            Follow
                        </button>
                    )}
                </div>
            </div>
            <Link href={`/@${user.tag}`} className="cursor-pointer w-min">
                <div className="flex items-center">
                    <p className="text-xl font-semibold hover:underline">
                        {user.name}
                    </p>
                    <VerifiedCheck className="ml-1 w-5 h-5" />
                </div>
                <p className="text-neutral-500">@{user.tag}</p>
            </Link>
            {user.bio !== "" && user.bio !== null && (
                <div className="text-black dark:text-white leading-snug text-sm cursor-text">
                    <PostContent post={{ content: user.bio }} />
                </div>
            )}
            <div className="flex gap-4">
                <p
                    className="text-neutral-500 cursor-pointer hover:underline"
                    onClick={() =>
                        setModal(
                            <FollowingModal
                                user={user}
                                followType={"following"}
                            />,
                        )
                    }
                >
                    <span className="text-white font-semibold">
                        {user.followingIds.length}
                    </span>{" "}
                    Following
                </p>
                <p
                    className="text-neutral-500 cursor-pointer hover:underline"
                    onClick={() =>
                        setModal(
                            <FollowingModal
                                user={user}
                                followType={"followers"}
                            />,
                        )
                    }
                >
                    <span className="text-white font-semibold">
                        {user.followerIds.length}
                    </span>{" "}
                    Followers
                </p>
            </div>
        </div>
    );
}
