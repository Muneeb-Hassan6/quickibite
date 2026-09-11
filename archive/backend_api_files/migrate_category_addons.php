<?php
$conn = new mysqli('127.0.0.1', 'root', '', 'restaurant_db');
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$queries = [
    "CREATE TABLE IF NOT EXISTS category_addons (
        id INT AUTO_INCREMENT PRIMARY KEY,
        target_category VARCHAR(255) NOT NULL,
        addon_category VARCHAR(255) NOT NULL,
        selection_type VARCHAR(50) NOT NULL DEFAULT 'multiple_choice',
        is_required BOOLEAN NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_category_mapping (target_category, addon_category)
    )"
];

foreach ($queries as $query) {
    if ($conn->query($query) === TRUE) {
        echo "Table category_addons checked/created successfully.\n";
    } else {
        echo "Error creating table: " . $conn->error . "\n";
    }
}

$conn->close();
?>
