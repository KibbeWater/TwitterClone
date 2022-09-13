<?php
include 'private/database.php';

if ($db->connect_error) {
    http_response_code(500);
    die(json_encode(array('success' => false, 'error' => 'Database connection failed')));
}

// Get the post info from the form encoded body
$post_message = $_POST['post'];
if (empty($post_message)) {
    http_response_code(400);
    die(json_encode(array('success' => false, 'message' => 'Post cannot be empty')));
}

// Get the authentication token from the header
