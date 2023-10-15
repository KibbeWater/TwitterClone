import Layout from "~/components/Site/Layouts/Layout";
import PostSkeleton from "~/components/Skeletons/PostSkeleton";

export default function ProfileSkeleton() {
    return (
        <Layout title="Loading...">
            <div>
                <div className="border-b-[1px] border-gray-500 animate-pulse">
                    <div className="w-full pb-[33.3%] bg-neutral-700 relative flex justify-center">
                        <div
                            className={
                                "absolute h-full w-full p-[auto] top-0 bottom-0 right-0 left-0 bg-gray-500"
                            }
                        />
                    </div>
                    <div className="w-full flex justify-between relative">
                        <div className="relative h-16 mb-3">
                            <div className="w-32 h-32 absolute left-5 -top-16">
                                <div>
                                    <div className="object-cover w-32 h-32 rounded-full border-[4px] border-white dark:border-black bg-gray-500" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mx-3 pb-3">
                        <div className="flex items-center w-3/12 h-[1em] bg-gray-500 rounded-lg" />
                        <div className="mt-1 text-base leading-none  w-2/12 h-[1em] bg-gray-500 rounded-lg" />
                        <div className="my-1 mt-3 flex flex-col gap-2">
                            <div className="w-8/12 h-[1em] bg-gray-500 rounded-lg" />
                            <div className="w-4/12 h-[1em] bg-gray-500 rounded-lg" />
                            <div className="w-7/12 h-[1em] bg-gray-500 rounded-lg" />
                            <div className="w-9/12 h-[1em] bg-gray-500 rounded-lg" />
                        </div>
                    </div>
                </div>
                <div className="flex flex-col items-center">
                    {[...Array<number>(10)].map((_, i) => {
                        return <PostSkeleton key={`postskeleton-${i}`} />;
                    })}
                </div>
            </div>
        </Layout>
    );
}
