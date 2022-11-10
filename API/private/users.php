<?php
require_once 'database.php';
require_once 'posts.php';
require_once 'sessions.php';
require_once 'relationships.php';

//$DEFAULT_AVATAR = "/assets/imgs/default_avatar.png";

class User
{
    private $_id;
    private $_password;

    public $tag;
    public $username;
    public $group;
    public $avatar;
    public $banner;
    public $bio;

    public function __construct(int $id, string $password, string $tag, string $username, int $group, ?string $avatar, ?string $banner, string $bio)
    {
        $this->_id = $id;
        $this->_password = $password;
        $this->tag = $tag;
        $this->username = $username;
        $this->group = $group;
        $this->avatar = $avatar == null ? "/assets/imgs/default_avatar.png" : $avatar;
        $this->banner = $banner == null ? "/assets/imgs/default_banner.png" : $banner;
        $this->bio = $bio;
    }

    // We want to be able to fetch users with their ID/username
    public static function authenticate()
    {
        // We need to get the session token from the current auth headers and then get the session token from the database to check if it exists
        if (!isset($_COOKIE['token'])) return null;

        // Get token
        $token = $_COOKIE['token'];

        // Get session from database
        $session = Session::fetchByToken($token);
        if ($session === null) return null;

        // Return the user
        return $session->owner;
    }

    public static function fetch(int $id)
    {
        global $db;

        $stmt = $db->prepare('SELECT * FROM users WHERE id = ?');
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 0) {
            return null;
        }

        $row = $result->fetch_assoc();
        return new User($row['id'], $row['password'], $row['tag'], $row['username'], $row['group'], $row['avatar'], $row['banner'], $row['bio']);
    }

    public static function register(string $username, string $password)
    {
        global $db;

        // Check if the username is already taken
        $stmt = $db->prepare('SELECT * FROM users WHERE tag = ?');
        $stmt->bind_param('s', $username);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows !== 0) return null;

        // Create the user
        $stmt = $db->prepare('INSERT INTO users (tag, username, password) VALUES (?, ?, ?)');
        $stmt->bind_param('sss', $username, $username, password_hash($password, PASSWORD_DEFAULT));
        $stmt->execute();

        // Return the user
        return self::fetch($db->insert_id);
    }

    public static function fetchByUsername(string $username)
    {
        global $db;

        $stmt = $db->prepare('SELECT * FROM users WHERE tag = ?');
        $stmt->bind_param('s', $username);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 0) return null;

        $row = $result->fetch_assoc();
        return new User($row['id'], $row['password'], $row['tag'], $row['username'], $row['group'], $row['avatar'], $row['banner'], $row['bio']);
    }

    public static function fetchByTag(string $tag)
    {
        global $db;

        $stmt = $db->prepare('SELECT * FROM users WHERE tag = ?');
        $stmt->bind_param('s', $tag);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 0) return null;

        $row = $result->fetch_assoc();
        return new User($row['id'], $row['password'], $row['tag'], $row['username'], $row['group'], $row['avatar'], $row['banner'], $row['bio']);
    }

    // Getters
    public function getId()
    {
        return $this->_id;
    }

    public function getFollowers(): int
    {
        return count(Relationship::fetchFollowers($this->getId()));
    }

    public function getFollowing(): int
    {
        return count(Relationship::fetchFollowing($this->getId()));
    }

    public function isFollowing(User $usr): bool
    {
        return Relationship::fetchPair($usr->getId(), $this->getId()) !== null;
    }

    // Setters
    public function follow(User $usr)
    {
        Relationship::create($this->getId(), $usr->getId(), RelationshipType::FOLLOW);
    }

    public function setBio(string $newBio)
    {
        global $db;

        $stmt = $db->prepare('UPDATE users SET bio = ? WHERE id = ?');
        $stmt->bind_param('si', $newBio, $this->getId());
        $stmt->execute();

        $this->bio = $newBio;
    }

    public function setAvatar(string $newAvatar)
    {
        global $db;

        $stmt = $db->prepare('UPDATE users SET avatar = ? WHERE id = ?');
        $stmt->bind_param('si', $newAvatar, $this->getId());
        $stmt->execute();

        $this->avatar = $newAvatar;
    }

    public function setBanner(string $newBanner)
    {
        global $db;

        $stmt = $db->prepare('UPDATE users SET banner = ? WHERE id = ?');
        $stmt->bind_param('si', $newBanner, $this->getId());
        $stmt->execute();

        $this->banner = $newBanner;
    }

    // Get all posts made by user from posts -> userId in database
    /**
     * @return Post[]
     */
    public function getPosts(): array
    {
        global $db;

        $stmt = $db->prepare('SELECT * FROM posts WHERE userId = ?');
        $stmt->bind_param('i', $this->_id);
        $stmt->execute();
        $result = $stmt->get_result();

        $posts = array();
        while ($row = $result->fetch_assoc()) {
            $posts[] = new Post($row['id'], $row['userId'], $row['content'], $row['date'], $row['ref'], $row['parent']);
        }

        return $posts;
    }

    // Function to compare passwords
    public function comparePassword($password)
    {
        return password_verify($password, $this->_password);
    }

    // Update tag
    public function updateTag($tag)
    {
        global $db;

        $stmt = $db->prepare('UPDATE users SET tag = ? WHERE id = ?');
        $stmt->bind_param('si', $tag, $this->_id);
        $stmt->execute();

        $this->tag = $tag;
        return $this;
    }

    // Update password
    public function updatePassword($password)
    {
        global $db;

        $hashedPass = password_hash($password, PASSWORD_DEFAULT);

        $stmt = $db->prepare('UPDATE users SET password = ? WHERE id = ?');
        $stmt->bind_param('si', $hashedPass, $this->_id);
        $stmt->execute();
        $this->_password = $hashedPass;
        return $this;
    }

    // Post function to post a message
    public function post($content)
    {
        global $db;

        $stmt = $db->prepare('INSERT INTO posts (userId, content, timestamp) VALUES (?, ?, ?)');
        $stmt->bind_param('isi', $this->_id, $content, time());
        $stmt->execute();

        return new Post($db->insert_id, $this->_id, $content, time());
    }

    // Get newest session
    public function getSession()
    {
        global $db;

        $stmt = $db->prepare('SELECT * FROM sessions WHERE userId = ? ORDER BY id DESC LIMIT 1');
        $stmt->bind_param('i', $this->_id);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 0) {
            return null;
        }

        $row = $result->fetch_assoc();
        return new Session($row['id'], $row['userId'], $row['date'], $row['token']);
    }

    public function verifySession($token)
    {
        $session = $this->getSession();
        if ($session == null) {
            return false;
        }

        return $session->token === $token;
    }

    public function deleteSessions()
    {
        global $db;

        $stmt = $db->prepare('DELETE FROM sessions WHERE userId = ?');
        $stmt->bind_param('i', $this->_id);
        $stmt->execute();
    }

    public function createSession()
    {
        global $db;

        $token = bin2hex(random_bytes(50 / 2)); // 50 Characters
        $stmt = $db->prepare('INSERT INTO sessions (userId, date, token) VALUES (?, ?, ?)');
        $stmt->bind_param('iis', $this->_id, time(), $token);
        $stmt->execute();

        // Set the cookie when the session is created
        setcookie('token', $token, time() + 86400, '/', null, false, true);

        return new Session($db->insert_id, $this->_id, time(), $token);
    }

    // Return a JSON representation of the user with only safe fields (username, tag, group)
    public function toJson()
    {
        return json_encode(array(
            'id' => $this->_id,
            'username' => $this->username,
            'tag' => $this->tag,
            'group' => $this->group
        ));
    }

    public function toArray()
    {
        return array(
            'id' => $this->_id,
            'username' => $this->username,
            'tag' => $this->tag,
            'avatar' => $this->avatar,
            'group' => $this->group,
            'bio' => $this->bio
        );
    }
}
