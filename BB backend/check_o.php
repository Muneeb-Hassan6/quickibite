<?php
require 'config/Database.php';
$db = (new Database())->getConnection();
$stmt = $db->query('SELECT id, status FROM orders ORDER BY id DESC LIMIT 5');
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
?>
