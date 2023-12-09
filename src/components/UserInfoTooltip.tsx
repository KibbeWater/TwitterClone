import Image from "next/image";

type User = {
    id: string;
    name: string | null;
    tag: string | null;
    bio: string | null;
    image: string | null;
};

export default function UserInfoTooltip({ user }: { user: User }) {
    return (
        <div className="flex flex-col rounded-xl bg-white dark:bg-black shadow-xl p-2">
            <div className="flex">
                <Image
                    src={user.image}
                    alt={`${user.name}'s avatar`}
                    className="rounded-full w-16 h-16 object-cover"
                    width={64}
                    height={64}
                />
            </div>
        </div>
    );
}
