<?php
require_once 'database.php';
require_once 'users.php';

function GenerateTimestamp($date)
{
    $now = time();
    $diff = $now - $date;

    if ($diff < 60) {
        return $diff . 's';
    } else if ($diff < 3600) {
        return floor($diff / 60) . 'm';
    } else if ($diff < 86400) {
        return floor($diff / 3600) . 'h';
    } else if ($diff < 31536000) {
        return date('M j', $date);
    } else {
        return date('M j, Y', $date);
    }
}

class Post
{
    private $_id;
    private $_userId;
    private $_date;
    private $_ref;
    private $_parent;

    public User $author;
    public string $content;
    public ?Post $reference;
    public ?Post $parent;
    public $timestamp;

    public function __construct(int $id, int $userId, string $content, int $date, int $ref = -1, int $parent = -1)
    {
        $this->_id = $id;
        $this->_userId = $userId;
        $this->_date = $date;
        $this->_ref = $ref;
        $this->_parent = $parent;

        $this->author = User::fetch($userId);
        $this->content = $content;
        $this->reference = $this->_ref == -1 ? null : Post::fetch($this->_ref);
        $this->parent = $this->_parent == -1 ? null : Post::fetch($this->_parent);
        $this->timestamp = GenerateTimestamp($date); // Might need to fix this for JS compatibility later
    }

    // Fetch a post by its ID
    public static function fetch(int $id)
    {
        global $db;

        $stmt = $db->prepare('SELECT * FROM posts WHERE id = ?');
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 0) {
            return null;
        }

        $row = $result->fetch_assoc();
        return new Post($row['id'], $row['userId'], $row['content'], $row['date'], $row['ref'], $row['parent']);
    }

    // Setters
    public function setUserId(int $userId)
    {
        $this->_userId = $userId;
        $this->author = User::fetch($userId);

        // Send new author to database
        global $db;

        $stmt = $db->prepare('UPDATE posts SET userId = ? WHERE id = ?');
        $stmt->bind_param('ii', $userId, $this->_id);
        $stmt->execute();
    }

    public function setDate(int $date)
    {
        $this->_date = $date;
        $this->timestamp = date('Y-m-d H:i:s', $date);
    }

    public function setContent(string $content)
    {
        $this->content = $content;
    }

    // Getters
    public function getId()
    {
        return $this->_id;
    }

    public function getDate()
    {
        return $this->_date;
    }

    // Static function to make a new post
    public static function make(int $userId, string $content, int $reference = -1, int $parent = -1)
    {
        global $db;

        $stmt = $db->prepare('INSERT INTO posts (userId, content, date, parent, ref) VALUES (?, ?, ?, ?, ?)');
        $stmt->bind_param('isiii', $userId, htmlspecialchars($content), time(), $parent, $reference);
        $stmt->execute();

        return Post::fetch($db->insert_id);
    }

    // Static function to get all posts
    // Drastic measures require drastic JSDoc comments
    /**
     * @return Post[]
     */
    public static function getAll(): array
    {
        global $db;

        $stmt = $db->prepare('SELECT * FROM posts WHERE parent = -1');
        $stmt->execute();
        $result = $stmt->get_result();

        $posts = [];
        while ($row = $result->fetch_assoc()) {
            $posts[] = new Post($row['id'], $row['userId'], $row['content'], $row['date'], $row['ref'], $row['parent']);
        }

        return $posts;
    }

    // Get last x posts in a static function
    /**
     * @return Post[]
     */
    public static function getLast(int $count, int $postsAfter = -1): array
    {
        global $db;

        // if $postsAfter is -1, get the last $count posts, otherwise get the last $count posts with an id lower than $postsAfter
        $stmt = $db->prepare('SELECT * FROM posts WHERE parent = -1' . ($postsAfter == -1 ? '' : ' AND id < ?') . ' ORDER BY id DESC LIMIT ?');
        if ($postsAfter != -1) $stmt->bind_param('ii', $postsAfter, $count);
        else $stmt->bind_param('i', $count);

        $stmt->execute();
        $result = $stmt->get_result();

        $posts = [];
        while ($row = $result->fetch_assoc()) {
            $posts[] = new Post($row['id'], $row['userId'], $row['content'], $row['date'], $row['ref'], $row['parent']);
        }

        return $posts;
    }

    public function toArray()
    {
        return array(
            'id' => $this->_id,
            'userId' => $this->_userId,
            'content' => $this->content,
            'date' => $this->_date,
            'timestamp' => $this->timestamp,
            'author' => $this->author->toArray(),
            'reference' => $this->reference == null ? null : $this->reference->toArray()
        );
    }
}
