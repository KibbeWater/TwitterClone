<?php

include_once 'private/database.php';
include_once 'private/users.php';

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
if (!isset($json->username))
    die(json_encode(array("success" => false, "error" => "Missing username")));
if (!isset($json->password))
    die(json_encode(array("success" => false, "error" => "Missing password")));

// Register the user
$user = User::register($json->username, $json->password);
if ($user == null)
    die(json_encode(array("success" => false, "error" => "Username already taken")));

// Create a session for the user
$session = $user->createSession();

// Return the user and the session token
die(json_encode(array(
    "success" => true,
    "user" => $user->toArray(),
    "token" => $session->token
)));
