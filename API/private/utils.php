<?php

function generatePost(Post $post, bool $isRef = false)
{
    $refHtml = "";

    if ($post->reference != null && !$isRef)
        $refHtml = '<div class="post__reference">' . generatePost($post->reference, true) . '</div>';

    $footerHtml = <<<HTML
        <div class="post__footer">
            <button id="btnRetwat" class="post__footer_button">
                <svg>       
                    <image xlink:href="/assets/svg/repeat-solid.svg" height="100%"/>    
                </svg>
            </button>
        </div>
    HTML;

    if ($isRef)
        $footerHtml = "";

    $postHtml = <<<HTML
    <div class="post" data-id="{$post->getId()}">
        <img src="{$post->author->avatar}" alt="{$post->author->username}'s avatar" class="post__author_avatar">
        <div class="post__content">
            <div class="post__header">
                <span class="post__author_username">{$post->author->username}</span>
                <span class="post__author_tag">@{$post->author->tag} ·</span>
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
