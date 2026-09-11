<?php
require 'config/Database.php';
$db = new Database();
$conn = $db->getConnection();

echo "=== 1. RECIPES TABLE (All) ===\n";
$stmt = $conn->query("SELECT * FROM recipes");
$recipes = $stmt->fetchAll(PDO::FETCH_ASSOC);
print_r($recipes);

echo "=== 2. LATEST ORDERS (Last 2) ===\n";
$stmt2 = $conn->query("SELECT id, total, status FROM orders ORDER BY id DESC LIMIT 2");
$orders = $stmt2->fetchAll(PDO::FETCH_ASSOC);
foreach($orders as $o) {
    echo "Order #{$o['id']}\n";
    $stmt3 = $conn->prepare("SELECT * FROM order_items WHERE order_id = :oid");
    $stmt3->execute([':oid' => $o['id']]);
    $items = $stmt3->fetchAll(PDO::FETCH_ASSOC);
    print_r($items);
}
?>
