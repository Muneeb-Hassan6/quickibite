<?php
require_once __DIR__ . '/../config/cors_headers.php';
require_once __DIR__ . '/../config/Database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        throw new Exception("Unable to connect to database.");
    }

    // 1. Create inventory_wastage audit log table
    $sqlWastage = "
    CREATE TABLE IF NOT EXISTS `inventory_wastage` (
      `id` INT AUTO_INCREMENT PRIMARY KEY,
      `order_id` INT NULL,
      `inventory_id` INT NOT NULL,
      `quantity` DECIMAL(10,2) NOT NULL,
      `unit` VARCHAR(20) DEFAULT 'pcs',
      `cost_lost` DECIMAL(10,2) DEFAULT 0.00,
      `stage` ENUM('kitchen', 'cashier', 'rider', 'inventory_audit') NOT NULL,
      `reported_by` VARCHAR(100) NOT NULL DEFAULT 'Staff',
      `reason` VARCHAR(255) NOT NULL,
      `is_verified` TINYINT(1) DEFAULT 0,
      `verified_by` VARCHAR(100) NULL,
      `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (`inventory_id`) REFERENCES `inventory`(`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ";
    $db->exec($sqlWastage);

    // 2. Create staff_notifications table for real-time Admin alerts
    $sqlNotifications = "
    CREATE TABLE IF NOT EXISTS `staff_notifications` (
      `id` INT AUTO_INCREMENT PRIMARY KEY,
      `type` ENUM('wastage', 'remake', 'delivery_failed', 'cancellation') NOT NULL,
      `title` VARCHAR(150) NOT NULL,
      `message` TEXT NOT NULL,
      `order_id` INT NULL,
      `is_read` TINYINT(1) DEFAULT 0,
      `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ";
    $db->exec($sqlNotifications);

    echo json_encode([
        "success" => true,
        "message" => "Database tables inventory_wastage and staff_notifications created successfully."
    ]);
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
?>
