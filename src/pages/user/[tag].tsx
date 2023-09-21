/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/router";
import PostComponent from "~/components/Post/Post";
import Layout from "~/components/Site/Layout";
import VerifiedCheck from "~/components/Verified";

import { api } from "~/utils/api";

export default function Home() {
    const tag = useRouter().query.tag as string;

    const { data: session } = useSession();
    const user = session?.user;

    const { data: profile, isError } = api.user.getProfile.useQuery({ tag });

    /* return (
        <Layout title={user?.name ?? "Loading..."}>
            <h1>
                Your username is{" "}
                {user?.name ?? (isError ? "NOTFOUND" : "loading...")} (@
                {user?.tag ?? (isError ? "NOTFOUND" : "loading...")})
            </h1>
            <h1>Verified?: {user?.verified ? "✅" : "❌"}</h1>
        </Layout>
    ); */

    const isMe = user?.id === profile?.id && user?.id !== undefined;
    const bio = profile?.bio ?? "";

    return (
        <Layout title={profile?.name ?? "Loading..."}>
            <div>
                <div className="border-b-[1px] border-gray-500">
                    <div className="w-full pb-[33.3%] bg-neutral-700 relative flex justify-center">
                        <div ref={bannerRef}>
                            {bannerSrc ? (
                                <Image
                                    src={bannerSrc}
                                    className={
                                        "absolute h-full w-full p-[auto] top-0 bottom-0 right-0 left-0 object-cover"
                                    }
                                    sizes={"100vw"}
                                    fill
                                    priority
                                    alt={`${profile?.name}'s Banner`}
                                    onError={(e) =>
                                        bannerRef.current?.classList.add(
                                            "hidden",
                                        )
                                    }
                                />
                            ) : null}
                        </div>
                    </div>
                    <div className="w-full flex justify-between relative">
                        <div className="relative h-16 mb-3">
                            <div className="w-32 h-32 absolute left-5 -top-16">
                                <div>
                                    <Image
                                        className="object-cover rounded-full border-[4px] border-white dark:border-black bg-white"
                                        src={
                                            profile?.image ??
                                            "/default_avatar.png"
                                        }
                                        alt={`${profile?.name}'s Avatar`}
                                        sizes={"100vw"}
                                        quality={100}
                                        fill
                                        priority
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col justify-center absolute right-0 top-0">
                            <div className="mx-3 my-3">
                                {isMe ? (
                                    <button
                                        className="bg-black/0 px-[15px] py-2 font-semibold border-[1px] border-gray-400 text-black dark:text-white min-w-[36px] transition-all cursor-pointer rounded-full hover:bg-gray-700/10"
                                        onClick={() => {
                                            // if (setModal) setModal(<EditProfileModal mutate={mutate} />);
                                        }}
                                    >
                                        Edit profile
                                    </button>
                                ) : isFollowing ? (
                                    <button
                                        className={
                                            "bg-black/0 px-[15px] py-2 font-semibold border-[1px] text-black dark:text-white border-gray-700 min-w-[36px] transition-all rounded-full " +
                                            "hover:bg-red-500/10 hover:text-red-600 hover:border-red-300 hover:cursor-pointer"
                                        }
                                        onClick={() => {
                                            CreateRelationship(
                                                profile?._id,
                                                "remove",
                                            ).then((res) => {
                                                setIsFollowing((prev) => !prev);
                                            });
                                        }}
                                        onMouseEnter={() =>
                                            setFollowingText("Unfollow")
                                        }
                                        onMouseLeave={() =>
                                            setFollowingText("Following")
                                        }
                                    >
                                        {followingText}
                                    </button>
                                ) : (
                                    <button
                                        className={
                                            "bg-black dark:bg-white text-white dark:text-black px-[15px] py-2 font-bold cursor-pointer rounded-full"
                                        }
                                        onClick={() => {
                                            CreateRelationship(
                                                profile?._id,
                                                "follow",
                                            ).then((res) => {
                                                setIsFollowing((prev) => !prev);
                                            });
                                        }}
                                    >
                                        Follow
                                    </button>
                                )}
                            </div>
                            {user?.role === "ADMIN" ? (
                                <button
                                    className={
                                        "bg-black dark:bg-white text-white dark:text-black px-[15px] py-2 font-bold cursor-pointer rounded-full mx-3"
                                    }
                                    /* onClick={() => {
                                        if (setModal)
                                            setModal(
                                                <AdminModal user={profile} />,
                                            );
                                    }} */
                                >
                                    Admin
                                </button>
                            ) : null}
                        </div>
                    </div>
                    <div className="mx-3 pb-3">
                        <h3 className="font-bold leading-none text-lg text-black dark:text-white flex items-center">
                            {profile?.name}
                            {profile?.verified ? <VerifiedCheck /> : null}
                        </h3>
                        <p className="mt-1 text-base leading-none text-gray-500">{`@${profile?.tag}`}</p>
                        <p className="my-1 mt-3 text-black dark:text-white">
                            {bio.split("\n").map((line, i) => {
                                return (
                                    <>
                                        <span
                                            key={`bio-${i}`}
                                            className="block"
                                        >
                                            {line}
                                        </span>
                                        {line === "" ? <br /> : null}
                                    </>
                                );
                            })}
                        </p>
                        <div className="flex my-2">
                            <p className="m-0 mr-2 text-black dark:text-white">
                                <span className="font-bold">0</span> Following
                            </p>
                            <p className="m-0 mr-2 text-black dark:text-white">
                                <span className="font-bold">0</span> Followers
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col items-center">
                    {profile?.posts.length !== undefined
                        ? profile.posts
                              .map((post) => {
                                  return (
                                      <PostComponent
                                          key={post?.id}
                                          post={post}
                                      />
                                  );
                              })
                              .sort(
                                  (a, b) =>
                                      b.props.post.date - a.props.post.date,
                              )
                        : null}
                </div>
            </div>
        </Layout>
    );
}
