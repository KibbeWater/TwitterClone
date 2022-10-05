<?php
require_once 'private/database.php';
require_once 'private/users.php';
require_once 'private/posts.php';

error_reporting(1);

function GET()
{
    // Get the count and lastPost from the query and parse their GET values
    $count = isset($_GET['count']) ? intval($_GET['count']) : 10;
    $lastPost = isset($_GET['lastPost']) ? intval($_GET['lastPost']) : -1;

    if (isset($_GET['latestPost'])) {
        $latestPosts = Post::getLatest(PHP_INT_MAX, intval($_GET['latestPost']));

        // Remake the posts array to be an array of arrays
        $postsArray = array();
        foreach ($latestPosts as $post)
            $postsArray[] = $post->toArray();

        die(json_encode(array(
            'success' => true,
            'posts' => $postsArray
        )));
    }

    if (isset($_GET['id']))
        die(json_encode(
            array(
                "success" => true,
                "post" => Post::fetch(intval($_GET['id']))->toArray()
            )
        ));

    // Get the posts
    $posts = Post::getLast($count, $lastPost);

    // Remake the posts array to be an array of arrays
    $postsArray = array();
    foreach ($posts as $post)
        $postsArray[] = $post->toArray();

    // Return the posts
    die(json_encode(array(
        "success" => true,
        "posts" => $postsArray
    )));
}

function POST()
{
    // Get the request body
    $body = file_get_contents('php://input');
    $json = json_decode($body);
    if ($json == null)
        die(json_encode(array("success" => false, "error" => "Invalid JSON")));

    // Check if the user is logged in
    $user = User::authenticate();
    if ($user == null)
        die(json_encode(array("success" => false, "error" => "Not logged in")));

    $ref = isset($json->ref) ? intval($json->ref) : -1;
    $parent = isset($json->parent) ? intval($json->parent) : -1;
    $content = isset($json->post) ? $json->post : "";

    // Create the post
    $post = Post::make($user->getId(), $content, $ref, $parent);

    // Return the post
    die(json_encode(array(
        "success" => true,
        "post" => $post->toArray()
    )));
}

// Is the request method POST?
if ($_SERVER['REQUEST_METHOD'] === 'POST')
    POST();
else if ($_SERVER['REQUEST_METHOD'] === 'GET')
    GET();
else
    die(json_encode(array("success" => false, "error" => "Invalid request method")));
