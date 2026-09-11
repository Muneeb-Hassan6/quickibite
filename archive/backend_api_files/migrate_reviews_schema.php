<?php
include_once __DIR__ . '/../config/cors_headers.php';
include_once __DIR__ . '/../config/Database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    echo "--- Starting Order Reviews Schema Migration ---\n";

    $db->exec("CREATE TABLE IF NOT EXISTS `order_reviews` (
      `id` INT AUTO_INCREMENT PRIMARY KEY,
      `order_id` INT NOT NULL UNIQUE,
      `customer_id` INT NULL,
      `customer_name` VARCHAR(150) NOT NULL,
      `rating` TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
      `review_text` TEXT NULL,
      `tags` VARCHAR(255) NULL,
      `item_ratings` JSON NULL,
      `status` ENUM('approved', 'pending', 'hidden') DEFAULT 'approved',
      `is_featured` TINYINT(1) DEFAULT 0,
      `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    echo "✔ order_reviews table verified/created successfully.\n";

    echo "--- Order Reviews Migration Completed ---\n";
} catch (Exception $e) {
    echo "Migration Error: " . $e->getMessage() . "\n";
}
