<?php
require_once 'API/private/users.php';
require_once 'API/private/utils.php';

if (!isset($_GET['tag'])) {
    header('Location: /');
    exit();
}

$tag = $_GET['tag'];
$tag = substr($tag, 0, -4);

$profile = User::fetchByTag($tag);
if ($profile == null) {
    header('Location: /');
    exit();
}

$user = User::authenticate();
$posts = $profile->getPosts();
$posts = array_reverse($posts);

?>
<html>

<head>
    <title>Twatter - Home</title>

    <link rel="favicon" href="/assets/favicons/favicon.ico">

    <link href="/styles/profile.css" rel="stylesheet" />
    <link href="/styles/post.css" rel="stylesheet" />
    <link href="/styles/global.css" rel="stylesheet" />

    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>
    <script src="https://kit.fontawesome.com/2822739062.js" crossorigin="anonymous"></script>
</head>

<body>
    <div class="parent">
        <nav class="navigation">
            <div class="navigation__container">
                <div class="navigation__twatter">
                    <a href="/home">
                        <img src="/assets/favicons/android-chrome-512x512.png" style="width: 45px;" />
                    </a>
                </div>
                <div class="navigation__button">
                    <a href="/home">
                        <i class="fa-regular fa-house"></i>
                    </a>
                </div>
                <div class="navigation__button">
                    <a href="<?php echo "/@" . $user->tag ?>">
                        <i class="fa-solid fa-user"></i>
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
                <h3 class="container__header_title"><?php echo $profile->username ?></h3>
            </div>
            <div class="container__content">
                <div class="profile">
                    <div class="profile__header">
                        <div class="profile__header__banner">
                            <img src="<?php echo $profile->banner ?>" />
                        </div>
                        <div class="profile__header__avatar">
                            <div>
                                <img src="<?php echo $profile->avatar ?>" />
                            </div>
                        </div>
                        <div class="profile__header__info">
                            <h3 class="profile__header__info__name"><?php echo $profile->username ?></h3>
                            <h4 class="profile__header__info__tag">@<?php echo $profile->tag ?></h4>
                            <p class="profile__header__info__bio"><?php echo $profile->bio ?></p>
                            <div class="profile__header__info__following">
                                <p><span><?php echo $profile->getFollowing() ?></span> Following</p>
                                <p><span><?php echo $profile->getFollowers() ?></span> Followers</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div id="feed" class="feed">
                    <?php
                    foreach ($posts as $post) {
                        echo generatePost($post);
                    }
                    ?>
                </div>
            </div>
        </main>
        <div class="filters">
            <div class="filters__container">
                <div class="searchbar">
                    <div class="searchbar__search">
                        <i>
                            <svg xmlns="http://www.w3.org/2000/svg" style="height: 75%;width:75%;" viewBox="0 0 20 20">
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
    <script src="/js/autosize.js"></script>
    <script src="/js/home.js"></script>
</body>

</html>