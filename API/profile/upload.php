<?php
require_once '../private/users.php';

error_reporting(0);

function UploadBanner()
{
    $banner = $_POST['banner'];

    if (!isset($banner)) {
        http_response_code(400);
        die(json_encode(array('success' => false, 'error' => 'Banner is not set')));
    }

    $authedUser = User::authenticate();

    if ($authedUser === null) {
        http_response_code(401);
        die(json_encode(array('success' => false, 'error' => 'Not authenticated')));
    }

    // Make sure the directory exists
    if (!file_exists('../../assets/imgs/banners')) {
        mkdir('../../assets/imgs/banners', 0777, true);
    }

    // Generate a random filename
    $filename = bin2hex(random_bytes(16)) . '.png';

    // Convert dataURL to image file and save it to ../../assets/imgs/${authedUser->getId()}/banner.png
    $data = explode(',', $banner);
    $data = base64_decode($data[1]);
    $file = fopen('../../assets/imgs/banners/' . $filename, 'w');
    fwrite($file, $data);
    fclose($file);

    $authedUser->setBanner('/assets/imgs/banners/' . $filename);

    http_response_code(200);
    die(json_encode(array('success' => true, 'url' => '/assets/imgs/banners/' . $filename)));
}

if ($_SERVER['REQUEST_METHOD'] === 'POST')
    UploadBanner();
else {
    http_response_code(405);
    die(json_encode(array('success' => false, 'error' => 'Method not allowed')));
}
