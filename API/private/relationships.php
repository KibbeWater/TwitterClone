<?php

use function PHPSTORM_META\type;

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

    public static function create(int $userId, int $targetId, int $type)
    {
        // Check if the relationship already exists, if it does, set the type to the new type
        $relationship = Relationship::fetch($userId, $targetId);
        if ($relationship != null) {
            $relationship->setType($type);
            return $relationship;
        }

        global $db;

        $stmt = $db->prepare('INSERT INTO relationships (author_id, target_id, type) VALUES (?, ?, ?)');
        $stmt->bind_param('iii', $userId, $targetId, $type);
        $stmt->execute();

        return Relationship::fetchPair($userId, $targetId);
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

    public static function fetchPair(int $authorId, int $targetId)
    {
        global $db;

        $stmt = $db->prepare('SELECT * FROM relationships WHERE author_id = ? AND target_id = ?');
        $stmt->bind_param('ii', $authorId, $targetId);
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

    public static function fetchFollowers(int $userId)
    {
        global $db;

        $relationship_follow = RelationshipType::FOLLOW;

        $stmt = $db->prepare('SELECT * FROM relationships WHERE target_id = ? AND type = ?');
        $stmt->bind_param('ii', $userId, $relationship_follow);
        $stmt->execute();
        $result = $stmt->get_result();

        $relationships = array();
        while ($row = $result->fetch_assoc()) {
            $relationships[] = new Relationship($row['id'], $row['author_id'], $row['target_id'], $row['type'], $row['date']);
        }

        return $relationships;
    }

    public static function fetchFollowing(int $userId)
    {
        global $db;

        $relationship_follow = RelationshipType::FOLLOW;

        $stmt = $db->prepare('SELECT * FROM relationships WHERE author_id = ? AND type = ?');
        $stmt->bind_param('ii', $userId, $relationship_follow);
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

    public function toArray()
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

    // Setters
    public function setType(int $type)
    {
        global $db;

        $stmt = $db->prepare('UPDATE relationships SET type = ? WHERE id = ?');
        $stmt->bind_param('ii', $type, $this->_id);
        $stmt->execute();

        $this->type = $type;
    }

    public function remove()
    {
        global $db;

        $stmt = $db->prepare('DELETE FROM relationships WHERE id = ?');
        $stmt->bind_param('i', $this->_id);
        $stmt->execute();

        $this->_id = null;
    }
}
