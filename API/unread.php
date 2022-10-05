<?php
require_once 'private/posts.php';

function GET()
{
    // We want to get the amount of posts that has been posted since latestPost (GET)
    if (!isset($_GET['latestPost'])) {
        die(json_encode(array(
            'success' => false,
            'error' => 'Missing latestPost'
        )));
    }

    // Get the latest post
    $latestPost = intval($_GET['latestPost']);

    $posts = Post::getSince($latestPost);

    die(json_encode(array(
        'success' => true,
        'posts' => $posts
    )));
}

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    GET();
} else {
    die(json_encode(array(
        'success' => false,
        'error' => 'Method not allowed'
    )));
}
