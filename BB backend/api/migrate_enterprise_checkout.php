<?php
require_once __DIR__ . '/../config/cors_headers.php';
require_once __DIR__ . '/../config/Database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    // 1. Create Coupons Table
    $db->exec("
        CREATE TABLE IF NOT EXISTS `coupons` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `code` VARCHAR(50) NOT NULL UNIQUE,
            `discount_type` ENUM('percentage', 'fixed') NOT NULL DEFAULT 'fixed',
            `discount_value` DECIMAL(10, 2) NOT NULL,
            `min_spend` DECIMAL(10, 2) DEFAULT 0.00,
            `max_discount` DECIMAL(10, 2) DEFAULT NULL,
            `usage_limit` INT DEFAULT NULL,
            `times_used` INT DEFAULT 0,
            `expiry_date` DATETIME NULL,
            `is_active` TINYINT(1) DEFAULT 1,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ");

    // Seed Sample Promo Codes
    $db->exec("
        INSERT INTO `coupons` (`code`, `discount_type`, `discount_value`, `min_spend`, `max_discount`, `usage_limit`, `is_active`) VALUES
        ('WELCOME50', 'percentage', 20.00, 500.00, 200.00, 500, 1),
        ('FLAT100', 'fixed', 100.00, 800.00, 100.00, 1000, 1),
        ('BIGBITE200', 'fixed', 200.00, 1500.00, 200.00, 200, 1)
        ON DUPLICATE KEY UPDATE `is_active`=1;
    ");

    // 2. Add Columns to Orders Table
    $colsToAdd = [
        'rider_tip' => "DECIMAL(10, 2) DEFAULT 0.00",
        'coupon_code' => "VARCHAR(50) NULL DEFAULT NULL",
        'discount_amount' => "DECIMAL(10, 2) DEFAULT 0.00",
        'order_mode' => "VARCHAR(50) DEFAULT 'delivery'",
        'delivery_fee' => "DECIMAL(10, 2) DEFAULT 0.00"
    ];

    foreach ($colsToAdd as $col => $type) {
        $checkCol = $db->query("SHOW COLUMNS FROM `orders` LIKE '$col'");
        if ($checkCol->rowCount() == 0) {
            $db->exec("ALTER TABLE `orders` ADD COLUMN `$col` $type");
        }
    }

    echo json_encode([
        "success" => true,
        "message" => "Enterprise checkout migrations applied successfully."
    ], JSON_PRETTY_PRINT);
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ], JSON_PRETTY_PRINT);
}
?>
