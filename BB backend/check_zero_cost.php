<?php
require 'config/Database.php';
$db = (new Database())->getConnection();

$stmt = $db->query("SELECT id, order_id, title, size, qty, price, cost_price FROM order_items WHERE cost_price = 0.00");
$items = $stmt->fetchAll(PDO::FETCH_ASSOC);

print_r($items);
?>
