<?php
require_once './private/relationships.php';
require_once './private/users.php';

//error_reporting(0);

function Follow()
{
    $userId = intval($_POST['user']);
    $shouldFollow = $_POST['follow'] === 'true';

    $authedUser = User::authenticate();

    if (!isset($userId)) {
        http_response_code(400);
        die(json_encode(array('success' => false, 'error' => 'User ID is not set')));
    }

    if (!isset($shouldFollow)) {
        http_response_code(400);
        die(json_encode(array('success' => false, 'error' => 'Follow is not set')));
    }

    if ($authedUser === null) {
        http_response_code(401);
        die(json_encode(array('success' => false, 'error' => 'Not authenticated')));
    }

    $relationship = Relationship::fetchPair($authedUser->getId(), $userId);

    if ($shouldFollow) {
        if ($relationship === null) {
            $relationship = Relationship::create($authedUser->getId(), $userId, RelationshipType::FOLLOW);
            if ($relationship === null) {
                http_response_code(500);
                die(json_encode(array('success' => false, 'error' => 'Failed to create relationship')));
            }

            http_response_code(200);
            die(json_encode(array('success' => true)));
        } else {
            if ($relationship->type != RelationshipType::FOLLOW) {
                $relationship->setType(RelationshipType::FOLLOW);

                http_response_code(200);
                die(json_encode(array('success' => true)));
            } else {
                http_response_code(200);
                die(json_encode(array('success' => true)));
            }
        }
    } else {
        if ($relationship !== null) {
            $relationship->remove();

            http_response_code(200);
            die(json_encode(array('success' => true)));
        }
        http_response_code(200);
        die(json_encode(array('success' => true)));
    }
}

function isFollowing()
{
    $userId = $_GET['user'];

    $authedUser = User::authenticate();

    if (!isset($userId)) {
        http_response_code(400);
        die(json_encode(array('success' => false, 'error' => 'User ID is not set')));
    }

    if ($authedUser === null) {
        http_response_code(401);
        die(json_encode(array('success' => false, 'error' => 'Not authenticated')));
    }

    $relationship = Relationship::fetchPair($authedUser->getId(), $userId);

    if ($relationship !== null) {
        http_response_code(200);
        die(json_encode(array('success' => true, 'following' => $relationship->type == RelationshipType::FOLLOW)));
    }

    http_response_code(200);
    die(json_encode(array('success' => true, 'following' => false)));
}

if ($_SERVER['REQUEST_METHOD'] === 'POST')
    Follow();
else if ($_SERVER['REQUEST_METHOD'] === 'GET')
    isFollowing();
else {
    http_response_code(405);
    die(json_encode(array('success' => false, 'error' => 'Method not allowed')));
}
