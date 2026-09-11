<?php
$conn = new mysqli('127.0.0.1', 'root', '', 'restaurant_db');
if ($conn->connect_error) die("Connection failed");
$conn->query("ALTER TABLE category_addons ADD COLUMN custom_label VARCHAR(255) DEFAULT NULL");
echo "Done";
?>
