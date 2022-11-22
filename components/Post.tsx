import Image from "next/image";

type PostObject = {
    id: number;
    userId: number;
    content: string;
    ref: number;
    parent: number;
    data: number;
}

type Props = {
    post: PostObject;
}

export default function Post({post}: Props) {
    <div className="post">
        <Image src="{$post->author->avatar}" alt="{$post->author->username}'s avatar" class="post__author_avatar">
        <div class="post__content">
            <div class="post__header">
                <a class="post__author_username" href="/@{$post->author->tag}">{$post->author->username}</a>
                <a class="post__author_tag" href="/@{$post->author->tag}">@{$post->author->tag} ·</a>
                <span class="post__timestamp">{$post->timestamp}</span>
            </div>
            {$post->content}
            {$refHtml}
            <div class="post__footer">
            <button id="btnRetwat" class="post__footer_button">
                <i class="fa-solid fa-repeat fa-xl"></i>
            </button>
            <button id="btnLike" class="post__footer_button__like" data="" . ($isLiked ? 'liked' : 'unliked') . "\">
        <i class=\"" . ($isLiked ? 'fas' : 'far') . " fa-heart fa-xl\"></i>
    </button>
        </div>
        </div>
    </div>
}