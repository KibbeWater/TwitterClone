import type { Post } from "@prisma/client";

export default function PostContent({ post }: { post: Post }) {
    return (
        <div className="w-full max-w-full">
            {/* <PostContent post={post} onClick={routePost} /> */}
            <p className="text-black dark:text-white">{post.content}</p>
        </div>
    );
}
