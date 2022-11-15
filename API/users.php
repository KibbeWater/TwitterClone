<?php
require_once './private/users.php';

//error_reporting(0);

function GetUsername()
{
    $username = $_GET['username'];

    if (!isset($username)) {
        http_response_code(400);
        die(json_encode(array('success' => false, 'error' => 'Username is not set')));
    }

    $user = User::fetchByUsername($username);

    if ($user === null) {
        http_response_code(400);
        die(json_encode(array('success' => false, 'error' => 'Username does not exist')));
    }

    http_response_code(200);
    die(json_encode(array('success' => true, 'user' => $user->toArray())));
}

function GetID()
{
    $id = $_GET['id'];

    if (!isset($id)) {
        http_response_code(400);
        die(json_encode(array('success' => false, 'error' => 'ID is not set')));
    }

    $user = User::fetch($id);

    if ($user === null) {
        http_response_code(400);
        die(json_encode(array('success' => false, 'error' => 'ID does not exist')));
    }

    http_response_code(200);
    die(json_encode(array('success' => true, 'user' => $user->toArray())));
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_GET['username'])) {
        GetUsername();
    } else if (isset($_GET['id'])) {
        GetID();
    } else {
        http_response_code(400);
        die(json_encode(array('success' => false, 'error' => 'Invalid request')));
    }
} else {
    http_response_code(400);
    die(json_encode(array('success' => false, 'error' => 'Invalid request')));
}
