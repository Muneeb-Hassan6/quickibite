<?php
require 'config/Database.php';
$db = (new Database())->getConnection();

// Check Peri Peri in menu items
print_r($db->query("SELECT id, name FROM menu_items WHERE name LIKE '%Peri%'")->fetchAll(PDO::FETCH_ASSOC));

// Check if Peri Peri has a Medium recipe
print_r($db->query("SELECT id, variant_name, ingredient_name FROM recipes WHERE menu_item_id IN (SELECT id FROM menu_items WHERE name LIKE '%Peri%')")->fetchAll(PDO::FETCH_ASSOC));
?>
