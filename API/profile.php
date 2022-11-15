<?php
require_once './private/users.php';

error_reporting(0);

function UpdateInfo()
{
    $name = $_POST['username'];
    $bio = $_POST['bio'];
    $banner = $_POST['banner'];

    $authedUser = User::authenticate();

    if ($authedUser === null) {
        http_response_code(401);
        die(json_encode(array('success' => false, 'error' => 'Not authenticated')));
    }

    if (isset($name)) $authedUser->setName($name);
    if (isset($bio)) $authedUser->setBio($bio);
    if (isset($banner)) $authedUser->setBanner($banner);

    http_response_code(200);
    die(json_encode(array('success' => true)));
}

if ($_SERVER['REQUEST_METHOD'] === 'POST')
    UpdateInfo();
else {
    http_response_code(405);
    die(json_encode(array('success' => false, 'error' => 'Method not allowed')));
}
