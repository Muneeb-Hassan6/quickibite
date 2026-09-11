<?php
$conn = new mysqli('127.0.0.1', 'root', '', 'restaurant_db');
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$queries = [
    "CREATE TABLE IF NOT EXISTS addon_groups (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL DEFAULT 'multiple_choice',
        is_required BOOLEAN NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )",
    "CREATE TABLE IF NOT EXISTS addon_group_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        group_id INT NOT NULL,
        inventory_id INT NOT NULL,
        item_name VARCHAR(255) NOT NULL,
        price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        qty_to_deduct DECIMAL(10,2) NOT NULL DEFAULT 1.00,
        FOREIGN KEY (group_id) REFERENCES addon_groups(id) ON DELETE CASCADE
    )",
    "CREATE TABLE IF NOT EXISTS category_addon_mappings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_category VARCHAR(255) NOT NULL,
        group_id INT NOT NULL,
        FOREIGN KEY (group_id) REFERENCES addon_groups(id) ON DELETE CASCADE,
        UNIQUE KEY unique_mapping (product_category, group_id)
    )"
];

foreach ($queries as $query) {
    if ($conn->query($query) === TRUE) {
        echo "Query executed successfully.\n";
    } else {
        echo "Error creating table: " . $conn->error . "\n";
    }
}

$conn->close();
?>
