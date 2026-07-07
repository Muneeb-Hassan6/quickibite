<?php
require 'config/Database.php';
$db = (new Database())->getConnection();
$stmt = $db->query('SELECT id, title, price, qty, cost_price FROM order_items ORDER BY id DESC LIMIT 10');
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
?>
