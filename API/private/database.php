<?php
$servername = "localhost";
$username = "twitter";
$password = "twitter_pass123";
$database = "twitter";

// Create connection
$db = new mysqli($servername, $username, $password);

// Check connection
if ($db->connect_error)
    die(json_encode(array("success" => false, "error" => "Connection failed: " . $db->connect_error)));

// Start to create the database if it doesn't exist
try {
    $db->select_db($database);
} catch (Exception $e) {
    $sql = "CREATE DATABASE $database";
    if ($db->query($sql) !== TRUE) echo "Error creating database: " . $db->error;
    else {
        $db->select_db($database);

        $sql = "CREATE TABLE users (
            id INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            tag VARCHAR(255) NOT NULL,
            username VARCHAR(255) NOT NULL,
            password VARCHAR(255) NOT NULL,
            avatar VARCHAR(255) NOT NULL,
            `group` INT(11) NOT NULL
        )";

        if ($db->query($sql) !== TRUE) echo "Error creating table: " . $db->error;

        $sql = "CREATE TABLE sessions (
            id INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            userId INT(11) NOT NULL,
            token VARCHAR(50) NOT NULL,
            `date` BIGINT(20) NOT NULL
        )";

        if ($db->query($sql) !== TRUE) echo "Error creating table: " . $db->error;

        $sql = "CREATE TABLE posts (
            id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
            userId INT(11) NOT NULL,
            content TEXT NOT NULL,
            ref INT(11) NOT NULL DEFAULT -1,
            parent INT(11) NOT NULL DEFAULT -1,
            `date` BIGINT(20) DEFAULT 0
        )";

        if ($db->query($sql) !== TRUE) echo "Error creating table: " . $db->error;

        $sql = "CREATE TABLE relationships (
            id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
            author_id INT(11) NOT NULL,
            target_id INT(11) NOT NULL,
            `type` INT(11) NOT NULL,
            `date` BIGINT(20) DEFAULT 0
        )";

        if ($db->query($sql) !== TRUE) echo "Error creating table: " . $db->error;

        $sql = "CREATE TABLE likes (
            id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
            author_id INT(11) NOT NULL,
            post_id INT(11) NOT NULL
        )";

        if ($db->query($sql) !== TRUE) echo "Error creating table: " . $db->error;
    }
}
