<?php
require_once './private/users.php';
require_once './private/sessions.php';

error_reporting(0);

function Login()
{
    $content_type = $_SERVER['CONTENT_TYPE'];

    if ($content_type == 'application/x-www-form-urlencoded') {
        $username = $_POST['username'];
        $password = $_POST['password'];
    } else if ($content_type == 'application/json') {
        $json = json_decode(file_get_contents('php://input'), true);
        $username = $json['username'];
        $password = $json['password'];
    } else {
        http_response_code(400);
        die(json_encode(array('success' => false, 'error' => 'Invalid content type')));
    }

    if (empty($username) || empty($password)) {
        http_response_code(400);
        die(json_encode(array('success' => false, 'error' => 'Username and password cannot be empty')));
    }

    $user = User::fetchByUsername($username);
    if ($user === null) {
        http_response_code(400);
        die(json_encode(array('success' => false, 'error' => 'Username does not exist')));
    }

    if ($user->comparePassword($password) === false) {
        http_response_code(400);
        die(json_encode(array('success' => false, 'error' => 'Password is incorrect')));
    }

    http_response_code(200);

    $session = $user->createSession();

    die(json_encode(
        array(
            'success' => true,
            'user' => $user->toArray(),
            'token' => $session->token
        )
    ));
}

function Auth()
{
    header('Content-Type: application/json; charset=utf-8');

    // Check if the token is set in the cookie
    $token = $_COOKIE['token'];
    if (!isset($_COOKIE['token'])) {
        http_response_code(401);
        die(json_encode(array('success' => false, 'error' => 'No token provided')));
    }

    $session = Session::fetchByToken($token);
    if ($session === null) {
        http_response_code(401);
        die(json_encode(array('success' => false, 'error' => 'Invalid authentication token')));
    }

    http_response_code(200);
    die(json_encode(array('success' => true, 'user' => $session->owner->toArray())));
}

// If post then Login, else, get Auth
if ($_SERVER['REQUEST_METHOD'] === 'POST')
    Login();
elseif ($_SERVER['REQUEST_METHOD'] === 'GET')
    Auth();
else {
    http_response_code(405);
    die(json_encode(array('success' => false, 'error' => 'Method not allowed')));
}
