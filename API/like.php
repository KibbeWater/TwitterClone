<?php
require_once './private/likes.php';
require_once './private/users.php';

//error_reporting(0);

function Like()
{
    $body = file_get_contents('php://input');
    $json = json_decode($body);
    if ($json == null)
        die(json_encode(array('success' => false, "error" => "Invalid JSON")));

    if (!isset($json->id)) {
        http_response_code(400);
        die(json_encode(array('success' => false, 'error' => 'Missing id')));
    }

    $id = intval($json->id);
    $user = User::authenticate();

    if ($user === null) {
        http_response_code(401);
        die(json_encode(array('success' => false, 'error' => 'Not logged in')));
    }

    $post = Post::fetch($id);
    if (!$post->hasLiked($user)) {
        $post->like($user);

        http_response_code(200);
        die(json_encode(array('success' => true, 'liked' => true)));
    } else {
        $post->unlike($user);

        http_response_code(200);
        die(json_encode(array('success' => true, 'liked' => false)));
    }
}

if ($_SERVER['REQUEST_METHOD'] == 'POST')
    Like();
else {
    http_response_code(405);
    die('Method not allowed');
}
