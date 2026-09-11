<?php
require 'config/Database.php';
$db = new Database();
$conn = $db->getConnection();
try {
    $conn->query("ALTER TABLE order_items ADD COLUMN cost_price DECIMAL(10,2) DEFAULT 0.00 AFTER price");
    echo "Column cost_price added successfully";
} catch(Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
