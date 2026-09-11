<?php
include_once __DIR__ . '/../config/cors_headers.php';
include_once __DIR__ . '/../config/Database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    echo "--- Starting Customer Auth Migration ---\n";

    // 1. Create customer_users table
    $db->exec("CREATE TABLE IF NOT EXISTS `customer_users` (
      `id` INT AUTO_INCREMENT PRIMARY KEY,
      `full_name` VARCHAR(100) NOT NULL,
      `phone` VARCHAR(20) NOT NULL UNIQUE,
      `email` VARCHAR(100) NULL UNIQUE,
      `password_hash` VARCHAR(255) NOT NULL,
      `is_active` TINYINT(1) DEFAULT 1,
      `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    echo "✔ customer_users table verified/created.\n";

    // 2. Create customer_addresses table
    $db->exec("CREATE TABLE IF NOT EXISTS `customer_addresses` (
      `id` INT AUTO_INCREMENT PRIMARY KEY,
      `customer_id` INT NOT NULL,
      `label` ENUM('Home', 'Work', 'Hostel', 'Other') NOT NULL DEFAULT 'Home',
      `address_line` TEXT NOT NULL,
      `area` VARCHAR(100) NULL,
      `landmark` VARCHAR(150) NULL,
      `latitude` DECIMAL(10, 8) NULL,
      `longitude` DECIMAL(11, 8) NULL,
      `is_default` TINYINT(1) DEFAULT 0,
      `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (`customer_id`) REFERENCES `customer_users`(`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    // 3. Add customer_id column to orders table if not exists
    $checkCol = $db->prepare("SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                               WHERE TABLE_SCHEMA = DATABASE() 
                               AND TABLE_NAME = 'orders' 
                               AND COLUMN_NAME = 'customer_id'");
    $checkCol->execute();
    if ($checkCol->fetchColumn() == 0) {
        $db->exec("ALTER TABLE `orders` ADD COLUMN `customer_id` INT NULL AFTER `id`");
        echo "✔ Added customer_id column to orders table.\n";
        
        try {
            $db->exec("ALTER TABLE `orders` ADD CONSTRAINT `fk_orders_customer` FOREIGN KEY (`customer_id`) REFERENCES `customer_users`(`id`) ON DELETE SET NULL");
            echo "✔ Added fk_orders_customer foreign key.\n";
        } catch (Exception $fkEx) {
            echo "Notice on FK: " . $fkEx->getMessage() . "\n";
        }
    } else {
        echo "✔ customer_id already exists in orders table.\n";
    }

    // 4. Add google_id, avatar_url, reset_token, reset_expires to customer_users if not exists
    $cols = [
        'google_id' => "VARCHAR(150) NULL AFTER `password_hash`",
        'avatar_url' => "VARCHAR(255) NULL AFTER `google_id`",
        'reset_token' => "VARCHAR(100) NULL AFTER `avatar_url`",
        'reset_expires' => "DATETIME NULL AFTER `reset_token`"
    ];

    foreach ($cols as $colName => $colDef) {
        $cCheck = $db->prepare("SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                                 WHERE TABLE_SCHEMA = DATABASE() 
                                 AND TABLE_NAME = 'customer_users' 
                                 AND COLUMN_NAME = :cname");
        $cCheck->execute([':cname' => $colName]);
        if ($cCheck->fetchColumn() == 0) {
            $db->exec("ALTER TABLE `customer_users` ADD COLUMN `$colName` $colDef");
            echo "✔ Added $colName column to customer_users.\n";
        } else {
            echo "✔ $colName already exists in customer_users.\n";
        }
    }

    // Ensure phone allows NULL for OAuth users
    try {
        $db->exec("ALTER TABLE `customer_users` MODIFY `phone` VARCHAR(20) NULL DEFAULT NULL");
        echo "✔ Modified phone column to allow NULL for OAuth accounts.\n";
    } catch (Exception $pEx) {
        echo "Notice on phone alter: " . $pEx->getMessage() . "\n";
    }

    echo "--- Customer Auth Migration Completed Successfully ---\n";
} catch (Exception $e) {
    echo "Migration Error: " . $e->getMessage() . "\n";
}
