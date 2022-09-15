<?php
require_once 'posts.php';

abstract class RelationshipType
{
    const FOLLOW = 0;
    const BLOCK = 1;
    const MUTE = 2;
}

class Relationship
{
    private $_id;
    private $_userId;
    private $_targetId;
    private $_date;

    public User $user;
    public User $target;
    public int $type;
    public $timestamp;

    public function __construct(int $id, int $userId, int $targetId, int $type, int $date)
    {
        $this->_id = $id;
        $this->_userId = $userId;
        $this->_targetId = $targetId;
        $this->_date = $date;

        $this->user = User::fetch($userId);
        $this->target = User::fetch($targetId);
        $this->type = $type;
        $this->timestamp = GenerateTimestamp($date); // Might need to fix this for JS compatibility later
    }

    // Fetch a relationship by its ID
    public static function fetch(int $id)
    {
        global $db;

        $stmt = $db->prepare('SELECT * FROM relationships WHERE id = ?');
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 0) {
            return null;
        }

        $row = $result->fetch_assoc();
        return new Relationship($row['id'], $row['author_id'], $row['target_id'], $row['type'], $row['date']);
    }

    // Fetch all relationships for a user
    public static function fetchAll(int $userId)
    {
        global $db;

        $stmt = $db->prepare('SELECT * FROM relationships WHERE author_id = ?');
        $stmt->bind_param('i', $userId);
        $stmt->execute();
        $result = $stmt->get_result();

        $relationships = array();
        while ($row = $result->fetch_assoc()) {
            $relationships[] = new Relationship($row['id'], $row['author_id'], $row['target_id'], $row['type'], $row['date']);
        }

        return $relationships;
    }

    // Fetch all targetted relationships for a user
    public static function fetchAllTargetted(int $userId)
    {
        global $db;

        $stmt = $db->prepare('SELECT * FROM relationships WHERE target_id = ?');
        $stmt->bind_param('i', $userId);
        $stmt->execute();
        $result = $stmt->get_result();

        $relationships = array();
        while ($row = $result->fetch_assoc()) {
            $relationships[] = new Relationship($row['id'], $row['author_id'], $row['target_id'], $row['type'], $row['date']);
        }

        return $relationships;
    }

    // make
    public static function make(int $userId, int $targetId)
    {
        global $db;

        $stmt = $db->prepare('INSERT INTO relationships (author_id, target_id, date) VALUES (?, ?, ?)');
        $stmt->bind_param('iii', $userId, $targetId, time());
        $stmt->execute();

        return Relationship::fetch($db->insert_id);
    }

    function toArray()
    {
        return array(
            'id' => $this->_id,
            'date' => $this->_date,
            'user' => $this->user->toArray(),
            'target' => $this->target->toArray(),
            'type' => $this->type,
            'timestamp' => $this->timestamp
        );
    }
}
