<?php
include_once __DIR__ . '/config/Database.php';

$database = new Database();
$db = $database->getConnection();

try {
    // Check & add columns to deals
    $dealsCols = $db->query("SHOW COLUMNS FROM deals")->fetchAll(PDO::FETCH_COLUMN);
    if (!in_array('promo_banner_image', $dealsCols)) {
        $db->exec("ALTER TABLE deals ADD COLUMN promo_banner_image VARCHAR(255) NULL");
    }
    if (!in_array('is_featured_banner', $dealsCols)) {
        $db->exec("ALTER TABLE deals ADD COLUMN is_featured_banner TINYINT(1) DEFAULT 0");
    }
    if (!in_array('banner_order', $dealsCols)) {
        $db->exec("ALTER TABLE deals ADD COLUMN banner_order INT DEFAULT 0");
    }

    // Check & add columns to menu_items
    $menuCols = $db->query("SHOW COLUMNS FROM menu_items")->fetchAll(PDO::FETCH_COLUMN);
    if (!in_array('promo_banner_image', $menuCols)) {
        $db->exec("ALTER TABLE menu_items ADD COLUMN promo_banner_image VARCHAR(255) NULL");
    }
    if (!in_array('is_featured_banner', $menuCols)) {
        $db->exec("ALTER TABLE menu_items ADD COLUMN is_featured_banner TINYINT(1) DEFAULT 0");
    }
    if (!in_array('banner_order', $menuCols)) {
        $db->exec("ALTER TABLE menu_items ADD COLUMN banner_order INT DEFAULT 0");
    }

    echo "SCHEMA_MIGRATION_SUCCESSFUL\n";
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
?>
