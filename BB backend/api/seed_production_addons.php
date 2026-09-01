<?php
require_once __DIR__ . '/../config/cors_headers.php';
require_once __DIR__ . '/../config/Database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        throw new Exception("Unable to connect to database.");
    }

    // 1. Create Tables
    $queries = [
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

        "CREATE TABLE IF NOT EXISTS `category_addon_mappings` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `parent_category_id` INT NULL,
            `parent_category_name` VARCHAR(100) NOT NULL,
            `addon_group_id` INT NOT NULL,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_parent_cat (`parent_category_name`),
            INDEX idx_group_id (`addon_group_id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;",

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

    // 2. Fetch Category IDs
    $catStmt = $db->query("SELECT id, name FROM categories");
    $cats = $catStmt->fetchAll(PDO::FETCH_ASSOC);
    $catMap = [];
    foreach ($cats as $c) {
        $catMap[strtolower(trim($c['name']))] = intval($c['id']);
    }

    $drinksId = $catMap['drinks'] ?? ($catMap['beverages'] ?? null);
    $sidesId = $catMap['potato corner'] ?? ($catMap['sides'] ?? ($catMap['fries'] ?? null));
    $saucesId = $catMap['sauses'] ?? ($catMap['sauces'] ?? ($catMap['dips'] ?? null));

    // 3. Seed / Update Addon Groups
    $groups = [
        [
            'id' => 1,
            'title' => 'COMPLETE WITH A DRINK',
            'subtitle' => 'Refreshing beverages & chilled sodas',
            'source_category_id' => $drinksId,
            'source_category_name' => 'Drinks',
            'icon_type' => 'drink',
            'is_active' => 1
        ],
        [
            'id' => 2,
            'title' => 'PERFECT PAIRINGS',
            'subtitle' => 'Recommended sides, fries & hot snacks',
            'source_category_id' => $sidesId,
            'source_category_name' => 'Potato Corner',
            'icon_type' => 'pairing',
            'is_active' => 1
        ],
        [
            'id' => 3,
            'title' => 'ADD SOME DIPS & SAUCES',
            'subtitle' => 'Garlic mayo, gourmet dips & extra sauces',
            'source_category_id' => $saucesId,
            'source_category_name' => 'sauses',
            'icon_type' => 'dip',
            'is_active' => 1
        ]
    ];

    $insGroup = $db->prepare("
        INSERT INTO `addon_groups` (`id`, `title`, `subtitle`, `source_category_id`, `source_category_name`, `icon_type`, `is_active`) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
            `title` = VALUES(`title`),
            `subtitle` = VALUES(`subtitle`),
            `source_category_id` = VALUES(`source_category_id`),
            `source_category_name` = VALUES(`source_category_name`),
            `icon_type` = VALUES(`icon_type`),
            `is_active` = VALUES(`is_active`)
    ");

    foreach ($groups as $g) {
        $insGroup->execute([
            $g['id'],
            $g['title'],
            $g['subtitle'],
            $g['source_category_id'],
            $g['source_category_name'],
            $g['icon_type'],
            $g['is_active']
        ]);
    }

    // 4. Seed Category Mappings
    // Clear existing to avoid duplicate chaos, then insert clean production mappings
    $db->exec("DELETE FROM category_addon_mappings");

    $insMap = $db->prepare("
        INSERT INTO category_addon_mappings (parent_category_id, parent_category_name, addon_group_id)
        VALUES (?, ?, ?)
    ");

    foreach ($cats as $c) {
        $catNameLower = strtolower(trim($c['name']));
        $catId = intval($c['id']);

        // Burger category gets Drinks (1), Sides (2), Dips (3)
        if (strpos($catNameLower, 'burger') !== false) {
            $insMap->execute([$catId, $c['name'], 1]);
            $insMap->execute([$catId, $c['name'], 2]);
            $insMap->execute([$catId, $c['name'], 3]);
        }
        // Pizza category gets Drinks (1) and Dips (3)
        else if (strpos($catNameLower, 'pizza') !== false) {
            $insMap->execute([$catId, $c['name'], 1]);
            $insMap->execute([$catId, $c['name'], 3]);
        }
        // Broast and Fried Chicken get Drinks (1) and Sides (2)
        else if (strpos($catNameLower, 'broast') !== false || strpos($catNameLower, 'fried') !== false || strpos($catNameLower, 'chicken') !== false) {
            $insMap->execute([$catId, $c['name'], 1]);
            $insMap->execute([$catId, $c['name'], 2]);
            $insMap->execute([$catId, $c['name'], 3]);
        }
        // Wraps & Shawarma get Drinks (1) and Dips (3)
        else if (strpos($catNameLower, 'wrap') !== false || strpos($catNameLower, 'shawarma') !== false) {
            $insMap->execute([$catId, $c['name'], 1]);
            $insMap->execute([$catId, $c['name'], 3]);
        }
    }

    // Also map 'deals' category to Drinks (1) and Sides (2)
    $insMap->execute([null, 'deals', 1]);
    $insMap->execute([null, 'deals', 2]);

    // 5. Seed Real Product-Specific Custom Addons
    $menuItems = $db->query("SELECT id, name, category FROM menu_items")->fetchAll(PDO::FETCH_ASSOC);

    $insCustom = $db->prepare("
        INSERT INTO `product_custom_addons` (`menu_item_id`, `title`, `price`, `is_active`)
        VALUES (?, ?, ?, 1)
        ON DUPLICATE KEY UPDATE `price` = VALUES(`price`)
    ");

    $legacyIns = $db->prepare("
        INSERT INTO `menu_addons` (`menu_item_id`, `addon_name`, `addon_price`)
        VALUES (?, ?, ?)
    ");

    $customAddonCount = 0;
    foreach ($menuItems as $m) {
        $mNameLower = strtolower($m['name']);
        $mCatLower = strtolower($m['category']);
        $mId = intval($m['id']);

        if (strpos($mNameLower, 'burger') !== false || strpos($mCatLower, 'burger') !== false || strpos($mNameLower, 'steak') !== false || strpos($mNameLower, 'patty') !== false) {
            // Delete old custom addons for this item to ensure clean seeding
            $db->prepare("DELETE FROM product_custom_addons WHERE menu_item_id = ?")->execute([$mId]);
            $db->prepare("DELETE FROM menu_addons WHERE menu_item_id = ?")->execute([$mId]);

            // Add Extra Cheese Slice
            $insCustom->execute([$mId, 'Extra Cheddar Cheese Slice', 70.00]);
            $legacyIns->execute([$mId, 'Extra Cheddar Cheese Slice', 70.00]);

            // Add Garlic Mayo Dip Sauce
            $insCustom->execute([$mId, 'Garlic Mayo Dip Sauce', 60.00]);
            $legacyIns->execute([$mId, 'Garlic Mayo Dip Sauce', 60.00]);

            // Add Crispy Bacon Strips for steak/double items
            if (strpos($mNameLower, 'steak') !== false || strpos($mNameLower, 'double') !== false || strpos($mNameLower, 'thunder') !== false || strpos($mNameLower, 'fillet') !== false) {
                $insCustom->execute([$mId, 'Crispy Bacon Strips', 120.00]);
                $legacyIns->execute([$mId, 'Crispy Bacon Strips', 120.00]);
            }

            $customAddonCount++;
        }
        else if (strpos($mNameLower, 'pizza') !== false || strpos($mCatLower, 'pizza') !== false) {
            $db->prepare("DELETE FROM product_custom_addons WHERE menu_item_id = ?")->execute([$mId]);
            $db->prepare("DELETE FROM menu_addons WHERE menu_item_id = ?")->execute([$mId]);

            $insCustom->execute([$mId, 'Extra Mozzarella Cheese', 150.00]);
            $legacyIns->execute([$mId, 'Extra Mozzarella Cheese', 150.00]);

            $insCustom->execute([$mId, 'Stuffed Cheese Crust', 200.00]);
            $legacyIns->execute([$mId, 'Stuffed Cheese Crust', 200.00]);

            $customAddonCount++;
        }
    }

    echo json_encode([
        "success" => true,
        "message" => "Production database seeding completed successfully.",
        "addon_groups_seeded" => count($groups),
        "products_with_custom_addons" => $customAddonCount
    ]);
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "Seeding failed: " . $e->getMessage()
    ]);
}
?>
