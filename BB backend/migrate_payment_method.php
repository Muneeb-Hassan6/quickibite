<?php
/**
 * Migration: Add 'payment_method' and 'payment_status' columns to orders table.
 * Safe to run multiple times — checks for column existence before altering.
 *
 * Run once via browser:  http://localhost/quickibite/BB%20backend/migrate_payment_method.php
 */
header("Content-Type: application/json; charset=UTF-8");

include_once __DIR__ . '/config/Database.php';

$database = new Database();
$db = $database->getConnection();

$results = [];

try {
    // Check if 'payment_method' column exists
    $checkPM = $db->prepare("SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                              WHERE TABLE_SCHEMA = DATABASE() 
                              AND TABLE_NAME = 'orders' 
                              AND COLUMN_NAME = 'payment_method'");
    $checkPM->execute();
    $pmExists = $checkPM->fetchColumn() > 0;

    if (!$pmExists) {
        $db->exec("ALTER TABLE `orders` ADD COLUMN `payment_method` VARCHAR(50) NOT NULL DEFAULT 'cod' AFTER `status`");
        $results[] = "✅ Added 'payment_method' column to orders table.";
    } else {
        $results[] = "ℹ️ 'payment_method' column already exists — skipped.";
    }

    // Check if 'payment_status' column exists
    $checkPS = $db->prepare("SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                              WHERE TABLE_SCHEMA = DATABASE() 
                              AND TABLE_NAME = 'orders' 
                              AND COLUMN_NAME = 'payment_status'");
    $checkPS->execute();
    $psExists = $checkPS->fetchColumn() > 0;

    if (!$psExists) {
        $db->exec("ALTER TABLE `orders` ADD COLUMN `payment_status` VARCHAR(50) NOT NULL DEFAULT 'Pending' AFTER `payment_method`");
        $results[] = "✅ Added 'payment_status' column to orders table.";
    } else {
        $results[] = "ℹ️ 'payment_status' column already exists — skipped.";
    }

    // Check if 'customer_address' column exists (used by delivery orders)
    $checkAddr = $db->prepare("SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                                WHERE TABLE_SCHEMA = DATABASE() 
                                AND TABLE_NAME = 'orders' 
                                AND COLUMN_NAME = 'customer_address'");
    $checkAddr->execute();
    $addrExists = $checkAddr->fetchColumn() > 0;

    if (!$addrExists) {
        $db->exec("ALTER TABLE `orders` ADD COLUMN `customer_address` TEXT NULL AFTER `customer_mobile`");
        $results[] = "✅ Added 'customer_address' column to orders table.";
    } else {
        $results[] = "ℹ️ 'customer_address' column already exists — skipped.";
    }

    // Check if 'house_no', 'street', 'area' columns exist
    $addressFields = ['house_no', 'street', 'area'];
    foreach ($addressFields as $field) {
        $check = $db->prepare("SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                                WHERE TABLE_SCHEMA = DATABASE() 
                                AND TABLE_NAME = 'orders' 
                                AND COLUMN_NAME = :col");
        $check->execute([':col' => $field]);
        $exists = $check->fetchColumn() > 0;

        if (!$exists) {
            $db->exec("ALTER TABLE `orders` ADD COLUMN `$field` VARCHAR(255) NULL AFTER `customer_address`");
            $results[] = "✅ Added '$field' column to orders table.";
        } else {
            $results[] = "ℹ️ '$field' column already exists — skipped.";
        }
    }

    echo json_encode([
        "success" => true,
        "message" => "Migration completed successfully.",
        "details" => $results
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Migration failed: " . $e->getMessage(),
        "details" => $results
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
}
?>
