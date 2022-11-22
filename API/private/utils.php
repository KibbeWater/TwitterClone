<?php
require_once 'users.php';

function generatePost(Post $post, bool $isRef = false, User $usr = null)
{
    $refHtml = "";

    if ($post->reference != null && !$isRef)
        $refHtml = '<div class="post__reference">' . generatePost($post->reference, true) . '</div>';

    $isLiked = false;
    if ($usr != null)
        $isLiked = $post->hasLiked($usr);

    $likeBtn = "<button id=\"btnLike\" class=\"post__footer_button__like\" data=\"" . ($isLiked ? 'liked' : 'unliked') . "\">
        <i class=\"" . ($isLiked ? 'fas' : 'far') . " fa-heart fa-xl\"></i>
    </button>";

    $footerHtml = <<<HTML
        <div class="post__footer">
            <button id="btnRetwat" class="post__footer_button">
                <i class="fa-solid fa-repeat fa-xl"></i>
            </button>
            {$likeBtn}
        </div>
    HTML;

    if ($isRef)
        $footerHtml = "";

    if ($usr == false)
        $footerHtml = "";

    $postHtml = <<<HTML
    <div class="post" data-id="{$post->getId()}">
        <img src="{$post->author->avatar}" alt="{$post->author->username}'s avatar" class="post__author_avatar">
        <div class="post__content">
            <div class="post__header">
                <a class="post__author_username" href="/@{$post->author->tag}">{$post->author->username}</a>
                <a class="post__author_tag" href="/@{$post->author->tag}">@{$post->author->tag} ·</a>
                <span class="post__timestamp">{$post->timestamp}</span>
            </div>
            {$post->content}
            {$refHtml}
            {$footerHtml}
        </div>
    </div>
    HTML;

    return $postHtml;
}
