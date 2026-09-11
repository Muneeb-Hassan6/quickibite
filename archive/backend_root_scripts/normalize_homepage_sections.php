<?php
include_once __DIR__ . '/config/Database.php';

$database = new Database();
$db = $database->getConnection();

try {
    // 1. Check/Add is_active column to homepage_sections if not exists
    $columns = $db->query("SHOW COLUMNS FROM homepage_sections LIKE 'is_active'")->fetchAll();
    if (empty($columns)) {
        $db->exec("ALTER TABLE homepage_sections ADD COLUMN is_active TINYINT(1) DEFAULT 1 AFTER sort_order");
        echo "<p>Added is_active column to homepage_sections.</p>";
    } else {
        echo "<p>is_active column already exists in homepage_sections.</p>";
    }

    // 2. Check/Add is_active column to hero_sliders if not exists
    $hero_columns = $db->query("SHOW COLUMNS FROM hero_sliders LIKE 'is_active'")->fetchAll();
    if (empty($hero_columns)) {
        $db->exec("ALTER TABLE hero_sliders ADD COLUMN is_active TINYINT(1) DEFAULT 1 AFTER sort_order");
        echo "<p>Added is_active column to hero_sliders.</p>";
    } else {
        echo "<p>is_active column already exists in hero_sliders.</p>";
    }

    // 3. Ensure any null is_active is set to 1
    $db->exec("UPDATE homepage_sections SET is_active = 1 WHERE is_active IS NULL");
    $db->exec("UPDATE hero_sliders SET is_active = 1 WHERE is_active IS NULL");

    echo "<h3>Database Schema Verified & Ready!</h3>";
} catch (Exception $e) {
    echo "<h3>Error:</h3>";
    echo "<p>" . $e->getMessage() . "</p>";
}
?>
