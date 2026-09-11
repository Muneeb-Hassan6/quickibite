<?php
include_once __DIR__ . '/config/Database.php';

$database = new Database();
$db = $database->getConnection();

echo "Connected to database successfully.\n";

// 1. Ensure columns exist in `deals` table
try {
    $columns = $db->query("SHOW COLUMNS FROM deals")->fetchAll(PDO::FETCH_COLUMN);
    
    if (!in_array('original_price', $columns)) {
        $db->exec("ALTER TABLE deals ADD COLUMN original_price DECIMAL(10,2) DEFAULT NULL AFTER price");
        echo "Added 'original_price' column to deals table.\n";
    }
    if (!in_array('tag', $columns)) {
        $db->exec("ALTER TABLE deals ADD COLUMN tag VARCHAR(50) DEFAULT NULL AFTER title");
        echo "Added 'tag' column to deals table.\n";
    }
    if (!in_array('description', $columns)) {
        $db->exec("ALTER TABLE deals ADD COLUMN description TEXT DEFAULT NULL AFTER title");
        echo "Added 'description' column to deals table.\n";
    }
} catch (Exception $e) {
    echo "Note on column alterations: " . $e->getMessage() . "\n";
}

// 2. Define the 6 requested combo deals
$deals = [
    [
        'title' => 'Midnight Craver Deal',
        'tag' => 'POPULAR',
        'description' => '1 Zinger Burger + Plain Fries + 345ml Drink',
        'price' => 720.00,
        'original_price' => 850.00,
        'img' => 'uploads/products/zingerburger-removebg-preview.png',
        'is_permanent' => 1,
        'is_active' => 1
    ],
    [
        'title' => 'Duo Shawarma & Wings Feast',
        'tag' => 'HOT DEAL',
        'description' => '2 Chapli Shawarma + 4 Pcs Grilled Wings + 2 Drinks',
        'price' => 899.00,
        'original_price' => 1050.00,
        'img' => 'uploads/products/chaplishawarama-removebg-preview.png',
        'is_permanent' => 1,
        'is_active' => 1
    ],
    [
        'title' => 'BigBite Mega Pizza Combo',
        'tag' => 'MEGA SAVER',
        'description' => '1 Large Special Pizza + 6 Pcs Peri Peri Wings + 1.5L Drink',
        'price' => 1799.00,
        'original_price' => 2150.00,
        'img' => 'uploads/products/speacialpizza.png',
        'is_permanent' => 1,
        'is_active' => 1
    ],
    [
        'title' => 'Crispy Broast Solo Box',
        'tag' => 'CRUNCHY',
        'description' => 'Quarter Broast + Garlic Mayo Fries + Garlic Dip + Drink',
        'price' => 850.00,
        'original_price' => 990.00,
        'img' => 'uploads/products/injectedbroast-removebg-preview.png',
        'is_permanent' => 1,
        'is_active' => 1
    ],
    [
        'title' => 'Wrap & Roll Platter',
        'tag' => 'BEST VALUE',
        'description' => '1 Tortilla Wrap + 1 Steak Wrap + Loaded Fries + 2 Drinks',
        'price' => 1299.00,
        'original_price' => 1550.00,
        'img' => 'uploads/products/tortillawrap.png',
        'is_permanent' => 1,
        'is_active' => 1
    ],
    [
        'title' => 'Family Feast 4-in-1',
        'tag' => 'FAMILY PACK',
        'description' => '2 Zinger Burgers + 1 Medium Pizza + Large Fries + 1.5L Drink',
        'price' => 2350.00,
        'original_price' => 2800.00,
        'img' => 'uploads/products/doublepatty.png',
        'is_permanent' => 1,
        'is_active' => 1
    ]
];

// 3. Upsert deals into DB
foreach ($deals as $deal) {
    // Check if deal already exists by title
    $checkStmt = $db->prepare("SELECT id FROM deals WHERE title = :title");
    $checkStmt->execute([':title' => $deal['title']]);
    $existing = $checkStmt->fetch(PDO::FETCH_ASSOC);

    if ($existing) {
        $updateStmt = $db->prepare("UPDATE deals SET 
            tag = :tag,
            description = :description,
            price = :price,
            original_price = :original_price,
            img = :img,
            is_permanent = :is_permanent,
            is_active = :is_active
            WHERE id = :id");
        $updateStmt->execute([
            ':tag' => $deal['tag'],
            ':description' => $deal['description'],
            ':price' => $deal['price'],
            ':original_price' => $deal['original_price'],
            ':img' => $deal['img'],
            ':is_permanent' => $deal['is_permanent'],
            ':is_active' => $deal['is_active'],
            ':id' => $existing['id']
        ]);
        echo "Updated existing deal: " . $deal['title'] . " (ID: " . $existing['id'] . ")\n";
    } else {
        $insertStmt = $db->prepare("INSERT INTO deals 
            (title, tag, description, price, original_price, img, is_permanent, is_active) 
            VALUES (:title, :tag, :description, :price, :original_price, :img, :is_permanent, :is_active)");
        $insertStmt->execute([
            ':title' => $deal['title'],
            ':tag' => $deal['tag'],
            ':description' => $deal['description'],
            ':price' => $deal['price'],
            ':original_price' => $deal['original_price'],
            ':img' => $deal['img'],
            ':is_permanent' => $deal['is_permanent'],
            ':is_active' => $deal['is_active']
        ]);
        $dealId = $db->lastInsertId();
        echo "Inserted new deal: " . $deal['title'] . " (ID: " . $dealId . ")\n";
    }
}

echo "\nAll deals successfully seeded!\n";
?>
