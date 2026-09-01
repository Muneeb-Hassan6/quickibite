<?php
require_once __DIR__ . '/../config/cors_headers.php';
require_once __DIR__ . '/../config/Database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        throw new Exception("Unable to connect to database.");
    }

    $queries = [
        // 1. addon_groups
        "CREATE TABLE IF NOT EXISTS `addon_groups` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `title` VARCHAR(100) NOT NULL,
            `subtitle` VARCHAR(255) NULL,
            `source_category_id` INT NULL,
            `source_category_name` VARCHAR(100) NULL,
            `icon_type` VARCHAR(50) DEFAULT 'drink',
            `is_active` TINYINT(1) DEFAULT 1,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;",

        // 2. category_addon_mappings
        "CREATE TABLE IF NOT EXISTS `category_addon_mappings` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `parent_category_id` INT NULL,
            `parent_category_name` VARCHAR(100) NOT NULL,
            `addon_group_id` INT NOT NULL,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_parent_cat (`parent_category_name`),
            INDEX idx_group_id (`addon_group_id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;",

        // 3. product_custom_addons
        "CREATE TABLE IF NOT EXISTS `product_custom_addons` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `menu_item_id` INT NOT NULL,
            `title` VARCHAR(100) NOT NULL,
            `price` DECIMAL(10,2) DEFAULT 0.00,
            `inventory_id` INT NULL,
            `qty_to_deduct` DECIMAL(10,2) NULL,
            `is_active` TINYINT(1) DEFAULT 1,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_menu_item (`menu_item_id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;"
    ];

    foreach ($queries as $q) {
        $db->exec($q);
    }

    // 4. Alter menu_items columns
    $menuCols = [
        "has_spice_option" => "TINYINT(1) DEFAULT 1",
        "calories" => "INT NULL DEFAULT NULL",
        "is_halal" => "TINYINT(1) DEFAULT 1"
    ];

    foreach ($menuCols as $col => $def) {
        $chk = $db->prepare("SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'menu_items' AND COLUMN_NAME = ?");
        $chk->execute([$col]);
        if ($chk->fetchColumn() == 0) {
            $db->exec("ALTER TABLE `menu_items` ADD COLUMN `$col` $def");
        }
    }

    // 5. Alter order_items columns
    $orderCols = [
        "spice_level" => "VARCHAR(50) NULL DEFAULT 'Medium Spicy'",
        "selected_addons_json" => "TEXT NULL"
    ];

    foreach ($orderCols as $col => $def) {
        $chk = $db->prepare("SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'order_items' AND COLUMN_NAME = ?");
        $chk->execute([$col]);
        if ($chk->fetchColumn() == 0) {
            $db->exec("ALTER TABLE `order_items` ADD COLUMN `$col` $def");
        }
    }

    // Seed default addon groups if empty
    $chkGroups = $db->query("SELECT COUNT(*) FROM addon_groups")->fetchColumn();
    if ($chkGroups == 0) {
        // Find category IDs for Drinks, Potato Corner / Sides, Sauces
        $cats = $db->query("SELECT id, name FROM categories")->fetchAll(PDO::FETCH_KEY_PAIR);
        $catFlip = array_change_key_case(array_flip($cats), CASE_LOWER);

        $drinksCatId = $catFlip['drinks'] ?? ($catFlip['beverages'] ?? null);
        $dipsCatId = $catFlip['sauses'] ?? ($catFlip['sauces'] ?? ($catFlip['dips'] ?? null));
        $sidesCatId = $catFlip['potato corner'] ?? ($catFlip['sides'] ?? ($catFlip['fries'] ?? null));

        $insGroup = $db->prepare("INSERT INTO addon_groups (title, subtitle, source_category_id, source_category_name, icon_type, is_active) VALUES (?, ?, ?, ?, ?, 1)");
        
        $insGroup->execute(["COMPLETE WITH A DRINK", "Refreshing cold beverages & drinks", $drinksCatId, "Drinks", "drink"]);
        $drinksGroupId = $db->lastInsertId();

        $insGroup->execute(["ADD SOME DIPS & SAUCES", "Signature garlic mayo, cheese & spicy dips", $dipsCatId, "sauses", "dip"]);
        $dipsGroupId = $db->lastInsertId();

        $insGroup->execute(["PAIR WITH SIDES & FRIES", "Crispy loaded fries & sides", $sidesCatId, "Potato Corner", "pairing"]);
        $sidesGroupId = $db->lastInsertId();

        // Seed default mappings for Burgers & Pizzas
        $insMap = $db->prepare("INSERT INTO category_addon_mappings (parent_category_name, addon_group_id) VALUES (?, ?)");
        if ($drinksGroupId) {
            $insMap->execute(["burger", $drinksGroupId]);
            $insMap->execute(["Pizza", $drinksGroupId]);
            $insMap->execute(["wraps", $drinksGroupId]);
            $insMap->execute(["shawarma", $drinksGroupId]);
            $insMap->execute(["broast", $drinksGroupId]);
            $insMap->execute(["fried chicken", $drinksGroupId]);
            $insMap->execute(["deals", $drinksGroupId]);
        }
        if ($dipsGroupId) {
            $insMap->execute(["burger", $dipsGroupId]);
            $insMap->execute(["Pizza", $dipsGroupId]);
            $insMap->execute(["broast", $dipsGroupId]);
            $insMap->execute(["fried chicken", $dipsGroupId]);
            $insMap->execute(["grilled wings", $dipsGroupId]);
        }
        if ($sidesGroupId) {
            $insMap->execute(["burger", $sidesGroupId]);
            $insMap->execute(["Pizza", $sidesGroupId]);
            $insMap->execute(["wraps", $sidesGroupId]);
            $insMap->execute(["broast", $sidesGroupId]);
        }
    }

    echo json_encode([
        "success" => true,
        "message" => "Addons & Customizer schema migration completed successfully."
    ]);
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "Migration failed: " . $e->getMessage()
    ]);
}
?>
