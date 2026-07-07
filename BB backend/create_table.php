<?php
include_once 'c:/xampp/htdocs/BB backend/config/Database.php';
$db = (new Database())->getConnection();
$db->exec('CREATE TABLE IF NOT EXISTS restaurant_tables (id INT AUTO_INCREMENT PRIMARY KEY, table_name VARCHAR(255) NOT NULL, status TINYINT DEFAULT 1, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)');
echo 'Table created successfully!';
?>
