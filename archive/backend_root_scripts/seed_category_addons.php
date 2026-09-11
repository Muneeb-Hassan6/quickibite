<?php
require_once __DIR__ . '/config/Database.php';

try {
    $db = (new Database())->getConnection();
    if (!$db) {
        throw new Exception("Database connection failed.");
    }

    echo "=== 1. ENSURING TABLES EXIST ===\n";
    $db->exec("CREATE TABLE IF NOT EXISTS category_addons (
        id INT AUTO_INCREMENT PRIMARY KEY,
        target_category VARCHAR(255) NOT NULL,
        addon_category VARCHAR(255) NOT NULL,
        custom_label VARCHAR(255) NULL,
        selection_type VARCHAR(50) NOT NULL DEFAULT 'multiple_choice',
        is_required TINYINT(1) NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_category_mapping (target_category, addon_category)
    )");

    echo "=== 2. SEEDING / UPDATING REALISTIC MENU ITEMS & PAIRINGS ===\n";
    $itemsToSeed = [
        [
            'name' => 'Cheesy Garlic Bread (2 Pcs)',
            'category' => 'Sides',
            'description' => 'Crispy French bread toasted with garlic butter and melted mozzarella cheese.',
            'img' => 'deals-hero-pizza.png',
            'price' => 180.00,
            'isAvailable' => 1
        ],
        [
            'name' => 'Garlic Bread (2 Pcs)',
            'category' => 'Sides',
            'description' => 'Toasted French baguette slices with aromatic garlic herb butter.',
            'img' => 'deals-hero-pizza.png',
            'price' => 120.00,
            'isAvailable' => 1
        ],
        [
            'name' => 'Warm Dinner Roll',
            'category' => 'Sides',
            'description' => 'Soft, freshly baked warm dinner roll.',
            'img' => 'broast.jpg',
            'price' => 40.00,
            'isAvailable' => 1
        ],
        [
            'name' => 'Fresh Coleslaw Cup',
            'category' => 'Sides',
            'description' => 'Crisp shredded cabbage and carrots in sweet creamy dressing.',
            'img' => 'broast.jpg',
            'price' => 70.00,
            'isAvailable' => 1
        ],
        [
            'name' => 'Chicken Nuggets (4 Pcs)',
            'category' => 'Sides',
            'description' => 'Crisp golden chicken breast nuggets with signature dipping sauce.',
            'img' => 'friedchicken1-removebg-preview.png',
            'price' => 160.00,
            'isAvailable' => 1
        ],
        [
            'name' => 'Mozzarella Cheese Sticks (4 Pcs)',
            'category' => 'Sides',
            'description' => 'Golden fried mozzarella cheese sticks served with marinara dip.',
            'img' => 'deals-hero-pizza.png',
            'price' => 240.00,
            'isAvailable' => 1
        ],
        [
            'name' => 'Pickled Fries Cup',
            'category' => 'Potato Corner',
            'description' => 'Tangy seasoned French fry bites with pickled cucumber.',
            'img' => 'potatocorner.jpg',
            'price' => 120.00,
            'isAvailable' => 1
        ],
        [
            'name' => 'Extra Cheese Slice',
            'category' => 'Sauses',
            'description' => 'Rich melted cheddar cheese slice.',
            'img' => 'creamymayo.png',
            'price' => 60.00,
            'isAvailable' => 1
        ],
        [
            'name' => 'Extra Tahini Dip',
            'category' => 'Sauses',
            'description' => 'Authentic rich sesame tahini sauce.',
            'img' => 'garlicmayo-removebg-preview.png',
            'price' => 50.00,
            'isAvailable' => 1
        ],
        [
            'name' => 'Honey Mustard Dip',
            'category' => 'Sauses',
            'description' => 'Sweet and tangy Dijon honey mustard dip.',
            'img' => 'mayo-removebg-preview.png',
            'price' => 60.00,
            'isAvailable' => 1
        ],
        [
            'name' => 'Potato Wedges',
            'category' => 'Potato Corner',
            'description' => 'Crispy skin-on seasoned potato wedges.',
            'img' => 'potatocorner.jpg',
            'price' => 220.00,
            'isAvailable' => 1
        ]
    ];

    foreach ($itemsToSeed as $item) {
        $chk = $db->prepare("SELECT id FROM menu_items WHERE name = ?");
        $chk->execute([$item['name']]);
        $existing = $chk->fetch(PDO::FETCH_ASSOC);

        if (!$existing) {
            $ins = $db->prepare("INSERT INTO menu_items (name, category, description, img, isAvailable) VALUES (?, ?, ?, ?, ?)");
            $ins->execute([$item['name'], $item['category'], $item['description'], $item['img'], $item['isAvailable']]);
            $menuId = $db->lastInsertId();

            $vIns = $db->prepare("INSERT INTO menu_variants (menu_id, size_name, price, in_stock) VALUES (?, 'Regular', ?, 1)");
            $vIns->execute([$menuId, $item['price']]);
            echo "Added new product: {$item['name']} (ID: $menuId) under {$item['category']}\n";
        } else {
            // Update price in menu_variants if needed
            $upd = $db->prepare("UPDATE menu_variants SET price = ? WHERE menu_id = ?");
            $upd->execute([$item['price'], $existing['id']]);
            echo "Updated product: {$item['name']} (Rs. {$item['price']})\n";
        }
    }

    echo "\n=== 3. SEEDING CATEGORY ADDON & PERFECT PAIRING MAPPINGS ===\n";
    // Clear old mappings to refresh cleanly
    $db->exec("TRUNCATE TABLE category_addons");

    $mappings = [
        // 1. BURGER CATEGORY
        [
            'target_category' => 'burger',
            'addon_category' => 'drinks',
            'custom_label' => 'Complete With a Cold Drink',
            'selection_type' => 'single_choice',
            'is_required' => 0
        ],
        [
            'target_category' => 'burger',
            'addon_category' => 'Potato Corner',
            'custom_label' => 'Perfect Pairings: Crispy Fries & Wedges',
            'selection_type' => 'multiple_choice',
            'is_required' => 0
        ],
        [
            'target_category' => 'burger',
            'addon_category' => 'Grilled Wings',
            'custom_label' => 'Perfect Pairings: Wings & Nuggets',
            'selection_type' => 'multiple_choice',
            'is_required' => 0
        ],
        [
            'target_category' => 'burger',
            'addon_category' => 'Sauses',
            'custom_label' => 'Extra Dips & Sauces',
            'selection_type' => 'multiple_choice',
            'is_required' => 0
        ],

        // 2. PIZZA CATEGORY
        [
            'target_category' => 'Pizza',
            'addon_category' => 'drinks',
            'custom_label' => 'Add 1.5L / 500ml Cold Drink',
            'selection_type' => 'single_choice',
            'is_required' => 0
        ],
        [
            'target_category' => 'Pizza',
            'addon_category' => 'Sides',
            'custom_label' => 'Perfect Pairings: Cheesy Garlic Bread & Appetizers',
            'selection_type' => 'multiple_choice',
            'is_required' => 0
        ],
        [
            'target_category' => 'Pizza',
            'addon_category' => 'Grilled Wings',
            'custom_label' => 'Perfect Pairings: Peri Peri Wings',
            'selection_type' => 'multiple_choice',
            'is_required' => 0
        ],
        [
            'target_category' => 'Pizza',
            'addon_category' => 'Sauses',
            'custom_label' => 'Dips for Pizza Crust',
            'selection_type' => 'multiple_choice',
            'is_required' => 0
        ],

        // 3. FRIES / POTATO CORNER CATEGORY
        [
            'target_category' => 'Potato Corner',
            'addon_category' => 'drinks',
            'custom_label' => 'Add a Chilled Cold Drink',
            'selection_type' => 'single_choice',
            'is_required' => 0
        ],
        [
            'target_category' => 'Potato Corner',
            'addon_category' => 'Sauses',
            'custom_label' => 'Garlic Mayo, Honey Mustard & Dip Cups',
            'selection_type' => 'multiple_choice',
            'is_required' => 0
        ],
        [
            'target_category' => 'Potato Corner',
            'addon_category' => 'Sides',
            'custom_label' => 'Perfect Pairings: Nuggets & Sides',
            'selection_type' => 'multiple_choice',
            'is_required' => 0
        ],

        // 4. SHAWARMA CATEGORY
        [
            'target_category' => 'Shawarma',
            'addon_category' => 'drinks',
            'custom_label' => 'Add a Refreshing Drink',
            'selection_type' => 'single_choice',
            'is_required' => 0
        ],
        [
            'target_category' => 'Shawarma',
            'addon_category' => 'Sauses',
            'custom_label' => 'Extra Tahini & Garlic Mayo',
            'selection_type' => 'multiple_choice',
            'is_required' => 0
        ],
        [
            'target_category' => 'Shawarma',
            'addon_category' => 'Potato Corner',
            'custom_label' => 'Perfect Pairings: Pickled Fries Cup',
            'selection_type' => 'multiple_choice',
            'is_required' => 0
        ],

        // 5. WRAPS CATEGORY
        [
            'target_category' => 'Wraps',
            'addon_category' => 'drinks',
            'custom_label' => 'Add a Refreshing Drink',
            'selection_type' => 'single_choice',
            'is_required' => 0
        ],
        [
            'target_category' => 'Wraps',
            'addon_category' => 'Sauses',
            'custom_label' => 'Extra Dips & Sauces',
            'selection_type' => 'multiple_choice',
            'is_required' => 0
        ],
        [
            'target_category' => 'Wraps',
            'addon_category' => 'Potato Corner',
            'custom_label' => 'Perfect Pairings: Seasoned Fries',
            'selection_type' => 'multiple_choice',
            'is_required' => 0
        ],

        // 6. PASTA CATEGORY
        [
            'target_category' => 'Pasta',
            'addon_category' => 'drinks',
            'custom_label' => 'Cold Drink or Mineral Water',
            'selection_type' => 'single_choice',
            'is_required' => 0
        ],
        [
            'target_category' => 'Pasta',
            'addon_category' => 'Sides',
            'custom_label' => 'Perfect Pairings: Garlic Bread & Mozzarella Sticks',
            'selection_type' => 'multiple_choice',
            'is_required' => 0
        ],
        [
            'target_category' => 'Pasta',
            'addon_category' => 'Sauses',
            'custom_label' => 'Extra Cheese & Gourmet Dips',
            'selection_type' => 'multiple_choice',
            'is_required' => 0
        ],

        // 7. BROAST CATEGORY
        [
            'target_category' => 'Broast',
            'addon_category' => 'drinks',
            'custom_label' => 'Cold Drink (500ml / 1.5L)',
            'selection_type' => 'single_choice',
            'is_required' => 0
        ],
        [
            'target_category' => 'Broast',
            'addon_category' => 'Sides',
            'custom_label' => 'Perfect Pairings: Warm Dinner Roll & Coleslaw',
            'selection_type' => 'multiple_choice',
            'is_required' => 0
        ],
        [
            'target_category' => 'Broast',
            'addon_category' => 'Potato Corner',
            'custom_label' => 'Add Seasoned Fries',
            'selection_type' => 'multiple_choice',
            'is_required' => 0
        ],
        [
            'target_category' => 'Broast',
            'addon_category' => 'Sauses',
            'custom_label' => 'Garlic Mayo & Hot Sauce',
            'selection_type' => 'multiple_choice',
            'is_required' => 0
        ],

        // 8. FRIED CHICKEN CATEGORY
        [
            'target_category' => 'Fried Chicken',
            'addon_category' => 'drinks',
            'custom_label' => 'Choose Your Soft Drink',
            'selection_type' => 'single_choice',
            'is_required' => 0
        ],
        [
            'target_category' => 'Fried Chicken',
            'addon_category' => 'Sides',
            'custom_label' => 'Perfect Pairings: Dinner Rolls & Coleslaw',
            'selection_type' => 'multiple_choice',
            'is_required' => 0
        ],
        [
            'target_category' => 'Fried Chicken',
            'addon_category' => 'Potato Corner',
            'custom_label' => 'Add Crispy Fries',
            'selection_type' => 'multiple_choice',
            'is_required' => 0
        ],
        [
            'target_category' => 'Fried Chicken',
            'addon_category' => 'Sauses',
            'custom_label' => 'Extra Dips & Sauces',
            'selection_type' => 'multiple_choice',
            'is_required' => 0
        ],

        // 9. GRILLED WINGS
        [
            'target_category' => 'Grilled Wings',
            'addon_category' => 'drinks',
            'custom_label' => 'Complete With a Cold Drink',
            'selection_type' => 'single_choice',
            'is_required' => 0
        ],
        [
            'target_category' => 'Grilled Wings',
            'addon_category' => 'Potato Corner',
            'custom_label' => 'Perfect Pairings: Crispy Fries & Wedges',
            'selection_type' => 'multiple_choice',
            'is_required' => 0
        ],
        [
            'target_category' => 'Grilled Wings',
            'addon_category' => 'Sauses',
            'custom_label' => 'Extra Hot Sauces & Dips',
            'selection_type' => 'multiple_choice',
            'is_required' => 0
        ],
    ];

    $insStmt = $db->prepare("INSERT INTO category_addons (target_category, addon_category, custom_label, selection_type, is_required) VALUES (?, ?, ?, ?, ?)");
    foreach ($mappings as $m) {
        $insStmt->execute([
            $m['target_category'],
            $m['addon_category'],
            $m['custom_label'],
            $m['selection_type'],
            $m['is_required']
        ]);
        echo "Mapped [{$m['target_category']}] -> [{$m['addon_category']}] ({$m['custom_label']})\n";
    }

    echo "\n=== ALL CATEGORY MAPPINGS SEEDED SUCCESSFULLY! ===\n";

} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
