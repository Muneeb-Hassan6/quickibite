<?php
include_once 'BB backend/config/Database.php';
$db = (new Database())->getConnection();
try {
    $db->query("ALTER TABLE orders ADD COLUMN payment_method VARCHAR(50) DEFAULT 'Cash on Delivery'");
    echo "Success";
} catch(Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
