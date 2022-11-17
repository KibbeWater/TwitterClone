<?php

class Like
{
    private $_id;
    private $_authorId;
    private $_postId;

    public User $author;
    public Post $post;

    public function __construct(int $id, int $authorId, int $postId)
    {
        $this->_id = $id;
        $this->_authorId = $authorId;
        $this->_postId = $postId;

        $this->author = User::fetch($authorId);
        $this->post = Post::fetch($postId);
    }

    public static function fetch(int $id)
    {
        global $db;

        $stmt = $db->prepare('SELECT * FROM likes WHERE id = ?');
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows == 0)
            return null;

        $row = $result->fetch_assoc();
        return new Like($row['id'], $row['author_id'], $row['post_id']);
    }

    public static function fetchByPost(int $postId)
    {
        global $db;

        $stmt = $db->prepare('SELECT * FROM likes WHERE post_id = ?');
        $stmt->bind_param('i', $postId);
        $stmt->execute();
        $result = $stmt->get_result();

        $likes = array();

        while ($row = $result->fetch_assoc()) {
            $likes[] = new Like($row['id'], $row['author_id'], $row['post_id']);
        }

        return $likes;
    }

    public static function fetchByUser(int $userId)
    {
        global $db;

        $stmt = $db->prepare('SELECT * FROM likes WHERE post_id = ?');
        $stmt->bind_param('i', $userId);
        $stmt->execute();
        $result = $stmt->get_result();

        $likes = array();

        while ($row = $result->fetch_assoc()) {
            $likes[] = new Like($row['id'], $row['author_id'], $row['post_id']);
        }

        return $likes;
    }

    public static function fetchPair(int $authorId, int $postId)
    {
        // Fetch a like by its author and post IDs
        global $db;

        $stmt = $db->prepare('SELECT * FROM likes WHERE author_id = ? AND post_id = ?');
        $stmt->bind_param('ii', $authorId, $postId);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows == 0)
            return null;

        $row = $result->fetch_assoc();
        return new Like($row['id'], $row['author_id'], $row['post_id']);
    }

    public static function postLikeCount(Post $post)
    {
        global $db;

        $stmt = $db->prepare('SELECT COUNT(*) FROM likes WHERE post_id = ?');
        $stmt->bind_param('i', $postId);
        $stmt->execute();
        $result = $stmt->get_result();

        $row = $result->fetch_assoc();
        return $row['COUNT(*)'];
    }

    public static function hasLiked(User $user, Post $post)
    {
        global $db;

        $userId = $user->getId();
        $postId = $post->getId();

        $stmt = $db->prepare('SELECT COUNT(*) FROM likes WHERE author_id = ? AND post_id = ?');
        $stmt->bind_param('ii', $userId, $postId);
        $stmt->execute();
        $result = $stmt->get_result();

        $row = $result->fetch_assoc();
        return $row['COUNT(*)'] > 0;
    }

    public static function create(int $authorId, int $postId)
    {
        global $db;

        $stmt = $db->prepare('INSERT INTO likes (author_id, post_id) VALUES (?, ?)');
        $stmt->bind_param('ii', $authorId, $postId);
        $stmt->execute();

        return new Like($db->insert_id, $authorId, $postId);
    }

    public function remove()
    {
        global $db;

        $stmt = $db->prepare('DELETE FROM likes WHERE id = ?');
        $stmt->bind_param('i', $this->_id);
        $stmt->execute();
    }

    public function getAuthorId()
    {
        return $this->_authorId;
    }

    public function getPostId()
    {
        return $this->_postId;
    }

    public function getId()
    {
        return $this->_id;
    }
}
