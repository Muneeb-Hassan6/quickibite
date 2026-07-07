<?php
require 'config/Database.php';
$db = (new Database())->getConnection();

// 1. Get menu item
$stmt = $db->query("SELECT * FROM menu_items WHERE name LIKE '%Malai Boti%'");
$item = $stmt->fetch(PDO::FETCH_ASSOC);
print_r($item);

if ($item) {
    // 2. Get recipes for this item
    $stmt = $db->prepare("SELECT r.*, i.name as inv_name, i.price as inv_price, i.unit as inv_unit FROM recipes r JOIN inventory i ON r.inventory_id = i.id WHERE r.menu_item_id = ?");
    $stmt->execute([$item['id']]);
    print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
}
?>
