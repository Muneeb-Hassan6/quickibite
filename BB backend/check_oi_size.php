<?php
require 'config/Database.php';
$db = (new Database())->getConnection();
$stmt = $db->query('SELECT id, title, size, qty, cost_price FROM order_items WHERE id = 122');
print_r($stmt->fetch(PDO::FETCH_ASSOC));
?>
