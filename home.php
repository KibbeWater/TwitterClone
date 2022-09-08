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
    <title>Twatter - Home</title>

    <link rel="favicon" href="/assets/favicons/favicon.ico">

    <link href="/styles/index.css" rel="stylesheet" />
    <link href="/styles/post.css" rel="stylesheet" />
    <link href="/styles/global.css" rel="stylesheet" />

    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>
</head>

<body>
    <div class="parent">
        <nav class="navigation">
            <div class="navigation__container">
                <div class="navigation__twatter">
                    <img src="/assets/favicons/android-chrome-512x512.png" style="width: 45px;" />
                </div>
                <div class="navigation__button">
                    <a href="/home">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" style="width:55%;height:55%;color:white;">
                            <path style="fill:black;" d="M575.8 255.5c0 18-15 32.1-32 32.1h-32l.7 160.2c0 2.7-.2 5.4-.5 8.1V472c0 22.1-17.9 40-40 40H456c-1.1 0-2.2 0-3.3-.1c-1.4 .1-2.8 .1-4.2 .1H416 392c-22.1 0-40-17.9-40-40V448 384c0-17.7-14.3-32-32-32H256c-17.7 0-32 14.3-32 32v64 24c0 22.1-17.9 40-40 40H160 128.1c-1.5 0-3-.1-4.5-.2c-1.2 .1-2.4 .2-3.6 .2H104c-22.1 0-40-17.9-40-40V360c0-.9 0-1.9 .1-2.8V287.6H32c-18 0-32-14-32-32.1c0-9 3-17 10-24L266.4 8c7-7 15-8 22-8s15 2 21 7L564.8 231.5c8 7 12 15 11 24z" />
                        </svg>
                    </a>
                </div>
                <div class="navigation__button">
                    <a href="/profile">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" style="width:55%;height:55%;color:white;">
                            <path d="M272 304h-96C78.8 304 0 382.8 0 480c0 17.67 14.33 32 32 32h384c17.67 0 32-14.33 32-32C448 382.8 369.2 304 272 304zM48.99 464C56.89 400.9 110.8 352 176 352h96c65.16 0 119.1 48.95 127 112H48.99zM224 256c70.69 0 128-57.31 128-128c0-70.69-57.31-128-128-128S96 57.31 96 128C96 198.7 153.3 256 224 256zM224 48c44.11 0 80 35.89 80 80c0 44.11-35.89 80-80 80S144 172.1 144 128C144 83.89 179.9 48 224 48z" />
                        </svg>
                    </a>
                </div>
                <!-- We'll have to add some JS to this later to be able to show a post prompt 
                like on Twitte.. I.. I mea.. I mean, theres no copying going on here, Twatter is 100% original -->
                <div class="navigation__post">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style="width:55%;height:55%;color:white;">
                        <path style="fill:white;" d="M467.1 241.1L351.1 288h94.34c-7.711 14.85-16.29 29.28-25.87 43.01l-132.5 52.99h85.65c-59.34 52.71-144.1 80.34-264.5 52.82l-68.13 68.13c-9.38 9.38-24.56 9.374-33.94 0c-9.375-9.375-9.375-24.56 0-33.94l253.4-253.4c4.846-6.275 4.643-15.19-1.113-20.95c-6.25-6.25-16.38-6.25-22.62 0l-168.6 168.6C24.56 58 366.9 8.118 478.9 .0846c18.87-1.354 34.41 14.19 33.05 33.05C508.7 78.53 498.5 161.8 467.1 241.1z" />
                    </svg>
                </div>
            </div>
        </nav>
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
        <div class="filters">
            <div class="filters__container">
                <div class="searchbar">
                    <div class="searchbar__search">
                        <i>
                            <svg xmlns="http://www.w3.org/2000/svg" height="55%" preserveAspectRatio="xMidYMid meet" viewBox="0 0 20 20">
                                <path fill="currentColor" d="m17.545 15.467l-3.779-3.779a6.15 6.15 0 0 0 .898-3.21c0-3.417-2.961-6.377-6.378-6.377A6.185 6.185 0 0 0 2.1 8.287c0 3.416 2.961 6.377 6.377 6.377a6.15 6.15 0 0 0 3.115-.844l3.799 3.801a.953.953 0 0 0 1.346 0l.943-.943c.371-.371.236-.84-.135-1.211zM4.004 8.287a4.282 4.282 0 0 1 4.282-4.283c2.366 0 4.474 2.107 4.474 4.474a4.284 4.284 0 0 1-4.283 4.283c-2.366-.001-4.473-2.109-4.473-4.474z" />
                            </svg>
                        </i>
                    </div>
                    <div style="width:100%;height:100%">
                        <input type="text" class="searchbar__input" placeholder="Search Twatter" />
                    </div>
                </div>
                <section class="trends">
                    <div class="trends__header"></div>
                </section>
            </div>
        </div>
    </div>
    <script src="/js/home.js"></script>
</body>

</html>