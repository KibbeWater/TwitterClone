<?php
require_once 'users.php';

class Session
{
    private $_id;
    private $_userId;
    private $_date;

    public $token;
    public $owner;
    public $timestamp;

    public function __construct(int $id, int $userId, int $date, string $token)
    {
        $this->_id = $id;
        $this->_userId = $userId;
        $this->_date = $date;

        $this->token = $token;
        $this->owner = User::fetch($userId);
        $this->timestamp = date('Y-m-d H:i:s', $date);
    }

    // Automatically get the authoization token from the header and return the session
    public static function authenticate(): ?Session
    {
        // is the token cookie set?
        if (!isset($_COOKIE['token'])) return null;
        $token = $_COOKIE['token'];

        // Get session from database
        $session = Session::fetchByToken($token);
        if ($session === null) return null;

        // Return the session
        return $session;
    }

    // Fetch a session by its ID
    public static function fetch(int $id)
    {
        global $db;

        $stmt = $db->prepare('SELECT * FROM sessions WHERE id = ?');
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 0) {
            return null;
        }

        $row = $result->fetch_assoc();
        return new Session($row['id'], $row['userId'], $row['date'], $row['token']);
    }

    // Fetch a session by its token
    public static function fetchByToken(string $token)
    {
        global $db;

        $stmt = $db->prepare('SELECT * FROM sessions WHERE token = ?');
        $stmt->bind_param('s', $token);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 0) {
            return null;
        }

        $row = $result->fetch_assoc();
        return new Session($row['id'], $row['userId'], $row['date'], $row['token']);
    }

    // Getters
    public function getId()
    {
        return $this->_id;
    }

    public function getUserId()
    {
        return $this->_userId;
    }

    public function getDate()
    {
        return $this->_date;
    }

    public function isExired()
    {
        // is the session more than 1 day old?
        return $this->_date < time() - 86400;
    }

    // Static function to make a new session
    public static function make(User $user)
    {
        global $db;

        $token = bin2hex(random_bytes(50 / 2)); // 50/2 = 25 bytes * 2 (hex char length) = 50 hex chars

        $stmt = $db->prepare('INSERT INTO sessions (userId, token) VALUES (?, ?)');
        $stmt->bind_param('is', $user->getId(), $token);
        $stmt->execute();

        // Set the cookie when the session is created
        setcookie('token', $token, time() + 86400, '/', null, false, true);

        return Session::fetchByToken($token);
    }

    // Delete a session
    public function delete()
    {
        global $db;

        $stmt = $db->prepare('DELETE FROM sessions WHERE id = ?');
        $stmt->bind_param('i', $this->_id);
        $stmt->execute();
    }
}
