<?php
require 'config/Database.php';
$db = (new Database())->getConnection();

print_r($db->query("SELECT id, name FROM menu_items WHERE name IN ('chicken', 'Salad', 'zinger')")->fetchAll(PDO::FETCH_ASSOC));
print_r($db->query("SELECT * FROM recipes WHERE menu_item_id IN (SELECT id FROM menu_items WHERE name IN ('chicken', 'Salad', 'zinger'))")->fetchAll(PDO::FETCH_ASSOC));
?>
