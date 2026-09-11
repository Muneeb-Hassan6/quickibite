<?php
require_once __DIR__ . '/../config/cors_headers.php';
require_once __DIR__ . '/../config/Database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        throw new Exception("Unable to connect to database.");
    }

    // Check if columns exist before dropping
    $cols = $db->query("SHOW COLUMNS FROM menu_items")->fetchAll(PDO::FETCH_COLUMN);

    if (in_array('calories', $cols)) {
        $db->exec("ALTER TABLE `menu_items` DROP COLUMN `calories`");
    }
    if (in_array('is_halal', $cols)) {
        $db->exec("ALTER TABLE `menu_items` DROP COLUMN `is_halal`");
    }

    echo json_encode([
        "success" => true,
        "message" => "Purged calories and is_halal columns from menu_items successfully."
    ]);
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
?>
