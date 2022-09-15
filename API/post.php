<?php
require_once 'private/database.php';
require_once 'private/users.php';
require_once 'private/posts.php';

error_reporting(0);

// Is the request method POST?
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    die(json_encode(array("success" => false, "error" => "Invalid request method")));
}

// Get the request body
$body = file_get_contents('php://input');
$json = json_decode($body);
if ($json == null)
    die(json_encode(array("success" => false, "error" => "Invalid JSON")));

// Check if the request body has the required fields
if (!isset($json->post))
    die(json_encode(array("success" => false, "error" => "Missing message")));

// Check if the user is logged in
$user = User::authenticate();
if ($user == null)
    die(json_encode(array("success" => false, "error" => "Not logged in")));

// Create the post
$post = Post::make($user->getId(), $json->post);

// Return the post
die(json_encode(array(
    "success" => true,
    "post" => $post->toArray()
)));
