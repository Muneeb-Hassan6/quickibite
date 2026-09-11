<?php
include_once __DIR__ . '/config/Database.php';

$database = new Database();
$db = $database->getConnection();

echo "Starting Deals System Migration...\n";

// 1. Ensure `deals` table has all necessary columns
try {
    $db->exec("CREATE TABLE IF NOT EXISTS deals (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT DEFAULT NULL,
        price DECIMAL(10,2) NOT NULL,
        original_price DECIMAL(10,2) DEFAULT NULL,
        badge_tag VARCHAR(100) DEFAULT NULL,
        tag VARCHAR(50) DEFAULT NULL,
        img VARCHAR(255) DEFAULT NULL,
        is_permanent TINYINT(1) DEFAULT 1,
        start_time TIME DEFAULT NULL,
        end_time TIME DEFAULT NULL,
        is_active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    echo "Verified 'deals' table.\n";

    $dealCols = $db->query("SHOW COLUMNS FROM deals")->fetchAll(PDO::FETCH_COLUMN);
    if (!in_array('original_price', $dealCols)) {
        $db->exec("ALTER TABLE deals ADD COLUMN original_price DECIMAL(10,2) DEFAULT NULL AFTER price");
    }
    if (!in_array('badge_tag', $dealCols)) {
        $db->exec("ALTER TABLE deals ADD COLUMN badge_tag VARCHAR(100) DEFAULT NULL AFTER title");
    }
    if (!in_array('tag', $dealCols)) {
        $db->exec("ALTER TABLE deals ADD COLUMN tag VARCHAR(50) DEFAULT NULL AFTER badge_tag");
    }
    if (!in_array('description', $dealCols)) {
        $db->exec("ALTER TABLE deals ADD COLUMN description TEXT DEFAULT NULL AFTER title");
    }
    if (!in_array('created_at', $dealCols)) {
        $db->exec("ALTER TABLE deals ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
    }
    echo "Updated 'deals' table columns.\n";
} catch (Exception $e) {
    echo "Error updating deals table: " . $e->getMessage() . "\n";
}

// 2. Ensure `deal_items` table exists with structured choice options
try {
    $db->exec("CREATE TABLE IF NOT EXISTS deal_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        deal_id INT NOT NULL,
        menu_item_id INT DEFAULT NULL,
        variant_id INT DEFAULT NULL,
        item_title VARCHAR(255) DEFAULT NULL,
        quantity INT DEFAULT 1,
        is_customizable TINYINT(1) DEFAULT 0,
        choice_group_name VARCHAR(255) DEFAULT NULL,
        options_json JSON DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX (deal_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    echo "Verified 'deal_items' table.\n";

    $itemCols = $db->query("SHOW COLUMNS FROM deal_items")->fetchAll(PDO::FETCH_COLUMN);
    if (!in_array('item_title', $itemCols)) {
        $db->exec("ALTER TABLE deal_items ADD COLUMN item_title VARCHAR(255) DEFAULT NULL AFTER variant_id");
    }
    if (!in_array('is_customizable', $itemCols)) {
        $db->exec("ALTER TABLE deal_items ADD COLUMN is_customizable TINYINT(1) DEFAULT 0 AFTER quantity");
    }
    if (!in_array('choice_group_name', $itemCols)) {
        $db->exec("ALTER TABLE deal_items ADD COLUMN choice_group_name VARCHAR(255) DEFAULT NULL AFTER is_customizable");
    }
    if (!in_array('options_json', $itemCols)) {
        $db->exec("ALTER TABLE deal_items ADD COLUMN options_json JSON DEFAULT NULL AFTER choice_group_name");
    }
    if (!in_array('created_at', $itemCols)) {
        $db->exec("ALTER TABLE deal_items ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
    }
    echo "Updated 'deal_items' table columns.\n";
} catch (Exception $e) {
    echo "Error updating deal_items table: " . $e->getMessage() . "\n";
}

// 3. Structured Seed Deals Data
$seedDeals = [
    [
        'title' => 'Midnight Craver Deal',
        'badge_tag' => 'POPULAR',
        'tag' => 'POPULAR',
        'description' => '1 Zinger Burger + Plain Fries + 345ml Drink',
        'price' => 720.00,
        'original_price' => 850.00,
        'img' => 'uploads/products/zingerburger-removebg-preview.png',
        'is_permanent' => 1,
        'is_active' => 1,
        'items' => [
            [
                'item_title' => 'Zinger Burger',
                'quantity' => 1,
                'is_customizable' => 0,
                'choice_group_name' => null,
                'options_json' => null
            ],
            [
                'item_title' => 'Plain Fries',
                'quantity' => 1,
                'is_customizable' => 1,
                'choice_group_name' => 'Choose Fries Flavor',
                'options_json' => json_encode(['Plain Salted', 'Masala Fries', 'Garlic Mayo Fries'])
            ],
            [
                'item_title' => '345ml Drink',
                'quantity' => 1,
                'is_customizable' => 1,
                'choice_group_name' => 'Choose Drink Flavor',
                'options_json' => json_encode(['Coca-Cola', '7Up', 'Mountain Dew', 'Sprite', 'Fanta', 'Diet Coke'])
            ]
        ]
    ],
    [
        'title' => 'Duo Shawarma & Wings Feast',
        'badge_tag' => 'HOT DEAL',
        'tag' => 'HOT DEAL',
        'description' => '2 Chapli Shawarma + 4 Pcs Grilled Wings + 2 Drinks',
        'price' => 899.00,
        'original_price' => 1050.00,
        'img' => 'uploads/products/chaplishawarama-removebg-preview.png',
        'is_permanent' => 1,
        'is_active' => 1,
        'items' => [
            [
                'item_title' => 'Chapli Shawarma',
                'quantity' => 2,
                'is_customizable' => 0,
                'choice_group_name' => null,
                'options_json' => null
            ],
            [
                'item_title' => 'Grilled Wings',
                'quantity' => 4,
                'is_customizable' => 1,
                'choice_group_name' => 'Choose Wings Spice Level',
                'options_json' => json_encode(['Mild BBQ', 'Spicy Peri Peri', 'Ghost Pepper Extreme'])
            ],
            [
                'item_title' => 'Soft Drinks',
                'quantity' => 2,
                'is_customizable' => 1,
                'choice_group_name' => 'Choose Drink Flavor',
                'options_json' => json_encode(['Coca-Cola', '7Up', 'Mountain Dew', 'Sprite', 'Fanta'])
            ]
        ]
    ],
    [
        'title' => 'BigBite Mega Pizza Combo',
        'badge_tag' => 'MEGA SAVER',
        'tag' => 'MEGA SAVER',
        'description' => '1 Large Special Pizza + 6 Pcs Peri Peri Wings + 1.5L Drink',
        'price' => 1799.00,
        'original_price' => 2150.00,
        'img' => 'uploads/products/speacialpizza.png',
        'is_permanent' => 1,
        'is_active' => 1,
        'items' => [
            [
                'item_title' => 'Large Special Pizza',
                'quantity' => 1,
                'is_customizable' => 1,
                'choice_group_name' => 'Choose Pizza Flavor',
                'options_json' => json_encode(['Chicken Tikka', 'Chicken Fajita', 'Peri Peri', 'Supreme'])
            ],
            [
                'item_title' => 'Peri Peri Wings',
                'quantity' => 6,
                'is_customizable' => 0,
                'choice_group_name' => null,
                'options_json' => null
            ],
            [
                'item_title' => '1.5L Soft Drink',
                'quantity' => 1,
                'is_customizable' => 1,
                'choice_group_name' => 'Choose Drink Flavor',
                'options_json' => json_encode(['Coca-Cola', '7Up', 'Mountain Dew', 'Sprite', 'Fanta'])
            ]
        ]
    ],
    [
        'title' => 'Crispy Broast Solo Box',
        'badge_tag' => 'CRUNCHY',
        'tag' => 'CRUNCHY',
        'description' => 'Quarter Broast + Garlic Mayo Fries + Garlic Dip + Drink',
        'price' => 850.00,
        'original_price' => 990.00,
        'img' => 'uploads/products/injectedbroast-removebg-preview.png',
        'is_permanent' => 1,
        'is_active' => 1,
        'items' => [
            [
                'item_title' => 'Quarter Broast',
                'quantity' => 1,
                'is_customizable' => 1,
                'choice_group_name' => 'Choose Broast Piece',
                'options_json' => json_encode(['Chest Piece', 'Leg Piece'])
            ],
            [
                'item_title' => 'Garlic Mayo Fries',
                'quantity' => 1,
                'is_customizable' => 1,
                'choice_group_name' => 'Choose Fries Flavor',
                'options_json' => json_encode(['Garlic Mayo Fries', 'Masala Fries', 'Plain Salted'])
            ],
            [
                'item_title' => 'Garlic Dip',
                'quantity' => 1,
                'is_customizable' => 0,
                'choice_group_name' => null,
                'options_json' => null
            ],
            [
                'item_title' => '345ml Drink',
                'quantity' => 1,
                'is_customizable' => 1,
                'choice_group_name' => 'Choose Drink Flavor',
                'options_json' => json_encode(['Coca-Cola', '7Up', 'Mountain Dew', 'Sprite', 'Fanta'])
            ]
        ]
    ],
    [
        'title' => 'Wrap & Roll Platter',
        'badge_tag' => 'BEST VALUE',
        'tag' => 'BEST VALUE',
        'description' => '1 Tortilla Wrap + 1 Steak Wrap + Loaded Fries + 2 Drinks',
        'price' => 1299.00,
        'original_price' => 1550.00,
        'img' => 'uploads/products/tortillawrap.png',
        'is_permanent' => 1,
        'is_active' => 1,
        'items' => [
            [
                'item_title' => 'Tortilla Wrap',
                'quantity' => 1,
                'is_customizable' => 1,
                'choice_group_name' => 'Choose Wrap Flavor',
                'options_json' => json_encode(['Crispy Chicken Wrap', 'Grilled Steak Wrap', 'BBQ Ranch Wrap'])
            ],
            [
                'item_title' => 'Steak Wrap',
                'quantity' => 1,
                'is_customizable' => 0,
                'choice_group_name' => null,
                'options_json' => null
            ],
            [
                'item_title' => 'Loaded Fries',
                'quantity' => 1,
                'is_customizable' => 1,
                'choice_group_name' => 'Choose Fries Flavor',
                'options_json' => json_encode(['Cheese Loaded', 'Jalapeno Loaded', 'Garlic Mayo Loaded'])
            ],
            [
                'item_title' => 'Soft Drinks',
                'quantity' => 2,
                'is_customizable' => 1,
                'choice_group_name' => 'Choose Drink Flavor',
                'options_json' => json_encode(['Coca-Cola', '7Up', 'Mountain Dew', 'Sprite', 'Fanta'])
            ]
        ]
    ],
    [
        'title' => 'Family Feast 4-in-1',
        'badge_tag' => 'FAMILY PACK',
        'tag' => 'FAMILY PACK',
        'description' => '2 Zinger Burgers + 1 Medium Pizza + Large Fries + 1.5L Drink',
        'price' => 2350.00,
        'original_price' => 2800.00,
        'img' => 'uploads/products/doublepatty.png',
        'is_permanent' => 1,
        'is_active' => 1,
        'items' => [
            [
                'item_title' => 'Zinger Burgers',
                'quantity' => 2,
                'is_customizable' => 0,
                'choice_group_name' => null,
                'options_json' => null
            ],
            [
                'item_title' => 'Medium Pizza',
                'quantity' => 1,
                'is_customizable' => 1,
                'choice_group_name' => 'Choose Pizza Flavor',
                'options_json' => json_encode(['Chicken Tikka', 'Chicken Fajita', 'Peri Peri', 'Supreme'])
            ],
            [
                'item_title' => 'Large Fries',
                'quantity' => 1,
                'is_customizable' => 1,
                'choice_group_name' => 'Choose Fries Flavor',
                'options_json' => json_encode(['Plain Salted', 'Masala Fries', 'Garlic Mayo Fries'])
            ],
            [
                'item_title' => '1.5L Soft Drink',
                'quantity' => 1,
                'is_customizable' => 1,
                'choice_group_name' => 'Choose Drink Flavor',
                'options_json' => json_encode(['Coca-Cola', '7Up', 'Mountain Dew', 'Sprite', 'Fanta'])
            ]
        ]
    ]
];

// 4. Seed or Update Deals and Deal Items
foreach ($seedDeals as $deal) {
    $checkStmt = $db->prepare("SELECT id FROM deals WHERE title = :title");
    $checkStmt->execute([':title' => $deal['title']]);
    $existing = $checkStmt->fetch(PDO::FETCH_ASSOC);

    $dealId = null;
    if ($existing) {
        $dealId = $existing['id'];
        $upStmt = $db->prepare("UPDATE deals SET 
            badge_tag = :badge_tag,
            tag = :tag,
            description = :description,
            price = :price,
            original_price = :original_price,
            img = :img,
            is_permanent = :is_permanent,
            is_active = :is_active
            WHERE id = :id");
        $upStmt->execute([
            ':badge_tag' => $deal['badge_tag'],
            ':tag' => $deal['tag'],
            ':description' => $deal['description'],
            ':price' => $deal['price'],
            ':original_price' => $deal['original_price'],
            ':img' => $deal['img'],
            ':is_permanent' => $deal['is_permanent'],
            ':is_active' => $deal['is_active'],
            ':id' => $dealId
        ]);
        echo "Updated deal: {$deal['title']} (ID: $dealId)\n";
    } else {
        $inStmt = $db->prepare("INSERT INTO deals 
            (title, badge_tag, tag, description, price, original_price, img, is_permanent, is_active)
            VALUES (:title, :badge_tag, :tag, :description, :price, :original_price, :img, :is_permanent, :is_active)");
        $inStmt->execute([
            ':title' => $deal['title'],
            ':badge_tag' => $deal['badge_tag'],
            ':tag' => $deal['tag'],
            ':description' => $deal['description'],
            ':price' => $deal['price'],
            ':original_price' => $deal['original_price'],
            ':img' => $deal['img'],
            ':is_permanent' => $deal['is_permanent'],
            ':is_active' => $deal['is_active']
        ]);
        $dealId = $db->lastInsertId();
        echo "Inserted deal: {$deal['title']} (ID: $dealId)\n";
    }

    // Clear old deal items for this deal
    $delItems = $db->prepare("DELETE FROM deal_items WHERE deal_id = :deal_id");
    $delItems->execute([':deal_id' => $dealId]);

    // Insert structured deal items
    $inItemStmt = $db->prepare("INSERT INTO deal_items 
        (deal_id, item_title, quantity, is_customizable, choice_group_name, options_json) 
        VALUES (:deal_id, :item_title, :quantity, :is_customizable, :choice_group_name, :options_json)");

    foreach ($deal['items'] as $item) {
        $inItemStmt->execute([
            ':deal_id' => $dealId,
            ':item_title' => $item['item_title'],
            ':quantity' => $item['quantity'],
            ':is_customizable' => $item['is_customizable'],
            ':choice_group_name' => $item['choice_group_name'],
            ':options_json' => $item['options_json']
        ]);
    }
    echo "  Seeded " . count($deal['items']) . " items for deal ID $dealId\n";
}

echo "\nDeals migration and seeding completed successfully!\n";
?>
