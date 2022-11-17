<?php
require_once 'API/private/posts.php';
require_once 'API/private/utils.php';

$posts = Post::getLast(10);
$session = Session::authenticate();

$loggedIn = !($session == null || $session->isExired());

if ($loggedIn)
    $user = $session->owner;

?>
<html>

<head>
    <title>Twatter - Home</title>

    <link rel="favicon" href="/assets/favicons/favicon.ico">

    <!-- Load required site styles -->
    <link href="/styles/index.css" rel="stylesheet" />
    <link href="/styles/post.css" rel="stylesheet" />
    <link href="/styles/global.css" rel="stylesheet" />

    <!-- Load component styles -->
    <link href="/styles/modals/post.css" rel="stylesheet" />
    <link href="/styles/modals/login.css" rel="stylesheet" />

    <!-- Load external dependencies -->
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>
    <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://kit.fontawesome.com/2822739062.js" crossorigin="anonymous"></script>

    <!-- Load ReactJS components -->
    <script src="/components/Post.js"></script>
    <script src="/components/PostModal.js"></script>
    <script src="/components/LoginModal.js"></script>
</head>

<body>
    <div id="modal_root"></div>
    <div class="parent">
        <nav class="navigation">
            <div class="navigation__container">
                <div class="navigation__twatter">
                    <a href="#">
                        <img src="/assets/favicons/android-chrome-512x512.png" style="width: 45px;" />
                    </a>
                </div>
                <div class="navigation__button">
                    <a href="/home">
                        <i class="fa-solid fa-house"></i>
                    </a>
                </div>
                <div class="navigation__button">
                    <a href="<?php echo $loggedIn ? "/@" . $user->tag : "/login" ?>">
                        <i class="fa-regular fa-user"></i>
                    </a>
                </div>
                <!-- We'll have to add some JS to this later to be able to show a post prompt 
                like on Twitte.. I.. I mea.. I mean, theres no copying going on here, Twatter is 100% original -->
                <div class="navigation__post" id="btnPost">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style="width:55%;height:55%;color:white;">
                        <path style="fill:white;" d="M467.1 241.1L351.1 288h94.34c-7.711 14.85-16.29 29.28-25.87 43.01l-132.5 52.99h85.65c-59.34 52.71-144.1 80.34-264.5 52.82l-68.13 68.13c-9.38 9.38-24.56 9.374-33.94 0c-9.375-9.375-9.375-24.56 0-33.94l253.4-253.4c4.846-6.275 4.643-15.19-1.113-20.95c-6.25-6.25-16.38-6.25-22.62 0l-168.6 168.6C24.56 58 366.9 8.118 478.9 .0846c18.87-1.354 34.41 14.19 33.05 33.05C508.7 78.53 498.5 161.8 467.1 241.1z" />
                    </svg>
                </div>
            </div>
        </nav>
        <main class="container">
            <div class="container__header">
                <h3 class="container__header_title">Home</h3>
            </div>
            <div class="container__content">
                <?php
                if ($loggedIn)
                    echo <<<HTML
                        <div class="post__form">
                            <div class="post__form_header">
                                <img src="{$user->avatar}" alt="{$user->username}'s avatar" class="post__form_avatar">
                            </div>
                            <div class="post__form_content">
                                <textarea type="text" rows="1" placeholder="What's happening?" class="post__form_input"></textarea>
                                <div class="separator"></div>
                                <div class="post__form_content_footer">
                                    <div>
                                        <p style="margin: 0;">There might be a button here</p>
                                    </div>
                                    <div>
                                        <button id="btn_post" class="post__form_submit">Post</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    HTML;
                ?>
                <div class="feed__unread" id="unread">
                    <p id="unread_txt">You have <span>0</span> new unread posts</p>
                </div>
                <div id="feed" class="feed">
                    <?php
                    foreach ($posts as $post) {
                        echo generatePost($post, false, $user);
                    }
                    ?>
                </div>
            </div>
        </main>
        <div class="filters">
            <div class="filters__container">
                <div class="searchbar">
                    <div class="searchbar__result">
                        <p class="searchbar__result_hint">Try searching for people, topics or keywords</p>
                    </div>
                    <div class="searchbar__search">
                        <i class="fa-solid fa-magnifying-glass"></i>
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

    <!-- Load dependency scripts -->
    <script src="/js/user.js"></script>
    <script src="/js/autosize.js"></script>
    <script src="/js/modals.js"></script>

    <!-- Load scripts -->
    <script src="/js/home.js"></script>
</body>

</html>