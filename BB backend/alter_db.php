<?php
require 'config/Database.php';
$db = new Database();
$conn = $db->getConnection();
try {
    $conn->query("ALTER TABLE homepage_sections ADD COLUMN slider_type VARCHAR(50) DEFAULT 'regular'");
    echo "Column added successfully";
} catch(Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
