<?php
require_once 'API/private/posts.php';

function generatePost(Post $post)
{
    $postHtml = <<<HTML
    <div class="post">
        <img src="{$post->author->avatar}" alt="{$post->author->username}'s avatar" class="post__author_avatar">
        <div class="post__content">
            <div class="post__header">
                <span class="post__author_username">{$post->author->username}</span>
                <span class="post__author_tag">@{$post->author->tag} ·</span>
                <span class="post__timestamp">{$post->timestamp}</span>
            </div>
            {$post->content}
        </div>
    </div>
    HTML;

    return $postHtml;
}

$posts = Post::getLast(10);

?>
<html>

<head>
    <link href="/styles/index.css" rel="stylesheet" />
    <link href="/styles/post.css" rel="stylesheet" />
    <link href="/styles/global.css" rel="stylesheet" />
</head>

<body>
    <div class="parent">
        <div class="navigation">
            <div style="margin-right:5px;height:100%">
                <div class="navigation__post">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style="width:55%;height:55%;color:white;">
                        <!--! Font Awesome Pro 6.1.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. -->
                        <path style="fill:white;" d="M467.1 241.1L351.1 288h94.34c-7.711 14.85-16.29 29.28-25.87 43.01l-132.5 52.99h85.65c-59.34 52.71-144.1 80.34-264.5 52.82l-68.13 68.13c-9.38 9.38-24.56 9.374-33.94 0c-9.375-9.375-9.375-24.56 0-33.94l253.4-253.4c4.846-6.275 4.643-15.19-1.113-20.95c-6.25-6.25-16.38-6.25-22.62 0l-168.6 168.6C24.56 58 366.9 8.118 478.9 .0846c18.87-1.354 34.41 14.19 33.05 33.05C508.7 78.53 498.5 161.8 467.1 241.1z" />
                    </svg>
                </div>
            </div>
        </div>
        <main class="container">
            <div class="container__header">
                <h1 class="container__header_title">Home</h1>
            </div>
            <form action="/index.php" method="post">
                <textarea name="post" class="container__post__textarea" placeholder="What's on your mind?"></textarea>
                <input type="submit" class="container__post__button" value="Post" />
            </form>
            <div class="container__post">
                <?php
                foreach ($posts as $post) {
                    echo generatePost($post);
                }
                ?>
            </div>
        </main>
        <div class="filters" />
    </div>

</body>

</html>