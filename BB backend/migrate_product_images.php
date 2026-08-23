<?php
/**
 * Migration Script: Bulk Update Product Images & Insert New Sauces/Drinks
 * Run with: c:\xampp\php\php.exe "BB backend/migrate_product_images.php"
 */

require_once __DIR__ . '/config/Database.php';

$database = new Database();
$conn = $database->getConnection();

if (!$conn) {
    echo "❌ Database connection failed." . PHP_EOL;
    exit(1);
}

// 1. Ensure target upload directories exist
$sourceDir = __DIR__ . '/../Frontend_Customer/src/assets/products';
$backendUploadsDir = __DIR__ . '/uploads/products';
$customerPublicDir = __DIR__ . '/../Frontend_Customer/public/uploads/products';
$staffPublicDir = __DIR__ . '/../Frontend_Staff/public/uploads/products';

foreach ([$backendUploadsDir, $customerPublicDir, $staffPublicDir] as $dir) {
    if (!is_dir($dir)) {
        mkdir($dir, 0777, true);
        echo "📁 Created directory: $dir" . PHP_EOL;
    }
}

// 2. Copy all images to destination folders
$files = scandir($sourceDir);
$copied = 0;
foreach ($files as $file) {
    if ($file === '.' || $file === '..' || is_dir("$sourceDir/$file")) continue;
    
    $srcPath = "$sourceDir/$file";
    copy($srcPath, "$backendUploadsDir/$file");
    copy($srcPath, "$customerPublicDir/$file");
    copy($srcPath, "$staffPublicDir/$file");
    $copied++;
}
echo "✅ Copied $copied image files to backend uploads and frontend public folders." . PHP_EOL . PHP_EOL;

// 3. Mapping of existing menu items by ID and Name
$existingItemImageMap = [
    25 => 'malaibotipizza-removebg-preview.png',        // Malai Boti
    26 => 'chickentikkapizza.png',                      // Chicken Tikka
    27 => 'chickenfijitapizza-removebg-preview.png',    // Chicken Fagitta
    28 => 'supremepizza-removebg-preview.png',          // Supreme
    29 => 'hotandspicypizza-removebg-preview.png',      // Hot & Spicy
    30 => 'vegetarianpizza-removebg-preview.png',       // Vegetarian
    31 => 'cheezyweezypizza-removebg-preview.png',      // Cheezy Veezy
    32 => 'periperipizza-removebg-preview.png',         // Peri Peri
    33 => 'speacialpizza.png',                          // Big Bite Seacial
    34 => 'zingerburger-removebg-preview.png',          // Zinger Burger
    35 => 'thunderfillet.png',                          // Thunder Fillet Burger
    36 => 'doublepatty.png',                            // Double Crispy Patty
    37 => 'doublesteak.png',                            // Double Steak
    38 => 'grilledwings1-removebg-preview.png',         // Grilled Wings
    39 => 'periperiwings-removebg-preview.png',         // Peri Peri Wings
    40 => 'planfries-removebg-preview.png',             // Plain Fries
    41 => 'masalafries-removebg-preview.png',           // Masala Fries
    42 => 'garlicmayofries-removebg-preview.png',       // Garlic Mayo Fries
    43 => 'loadedfries-removebg-preview.png',           // Loaded Fries
    44 => 'periperipasta-removebg-preview.png',         // Peri Peri Pasta
    45 => 'micronipasta-removebg-preview.png',          // Microni Pasta
    46 => 'speacialpasta-removebg-preview.png',         // Big Bite Speacial Pasta
    47 => 'coke.png',                                   // Coke
    48 => 'tortillawrap.png',                           // Tortilla Wrap
    49 => 'steakwrap.png',                              // Steak Wrap
    50 => 'paratharoll-removebg-preview.png',           // Paratha Roll
    51 => 'zingertwisterparatharoll-removebg-preview.png', // Zinger Twister Paratha Roll
    52 => 'chaplishawarama-removebg-preview.png',       // Chapli Shawarama
    53 => 'zingershawarama-removebg-preview.png',       // Zinger Shawarama
    54 => 'friedchicken1-removebg-preview.png',         // Fried Chicken
    55 => 'hotwings-removebg-preview.png',              // Hot Wings
    56 => 'garlicmayo.png',                             // Sauses (Bundle item)
    57 => 'injectedbroast-removebg-preview.png',        // Injected Broast
];

echo "🔄 Updating existing menu items with local transparent images..." . PHP_EOL;
$updateStmt = $conn->prepare("UPDATE menu_items SET img = ? WHERE id = ?");
$updatedCount = 0;

foreach ($existingItemImageMap as $id => $filename) {
    $relativePath = "uploads/products/" . $filename;
    $updateStmt->execute([$relativePath, $id]);
    $updatedCount++;
    echo "  [ID $id] Updated image -> $relativePath" . PHP_EOL;
}
echo "✅ Total existing items updated: $updatedCount" . PHP_EOL . PHP_EOL;

// 4. Ensure Categories exist
$ensureCats = [
    ['name' => 'Sauses', 'img' => 'uploads/products/garlicmayo.png'],
    ['name' => 'drinks', 'img' => 'uploads/products/coke.png']
];

$checkCatStmt = $conn->prepare("SELECT id FROM categories WHERE LOWER(name) = LOWER(?)");
$insertCatStmt = $conn->prepare("INSERT INTO categories (name, img) VALUES (?, ?)");

foreach ($ensureCats as $cat) {
    $checkCatStmt->execute([$cat['name']]);
    if (!$checkCatStmt->fetch()) {
        $insertCatStmt->execute([$cat['name'], $cat['img']]);
        echo "➕ Created category: {$cat['name']}" . PHP_EOL;
    }
}

// 5. Insert New Products (Sauces and Drinks)
$newProducts = [
    // SAUCES
    [
        'name' => 'Creamy Mayo',
        'description' => 'Rich and smooth creamy mayonnaise sauce.',
        'category' => 'Sauses',
        'img' => 'uploads/products/creamymayo.png',
        'isAvailable' => 1,
        'isTopDeal' => 0,
        'isBestSeller' => 0,
        'variants' => [
            ['size' => 'Dip Cup (50g)', 'price' => 60.00]
        ]
    ],
    [
        'name' => 'Garlic Mayo',
        'description' => 'Zesty garlic infused creamy mayonnaise dip.',
        'category' => 'Sauses',
        'img' => 'uploads/products/garlicmayo.png',
        'isAvailable' => 1,
        'isTopDeal' => 0,
        'isBestSeller' => 1,
        'variants' => [
            ['size' => 'Dip Cup (50g)', 'price' => 60.00]
        ]
    ],
    [
        'name' => 'Green Chilli Sauce',
        'description' => 'Spicy and tangy green chilli dipping sauce.',
        'category' => 'Sauses',
        'img' => 'uploads/products/greenchillisauce-removebg-preview.png',
        'isAvailable' => 1,
        'isTopDeal' => 0,
        'isBestSeller' => 0,
        'variants' => [
            ['size' => 'Dip Cup (50g)', 'price' => 50.00]
        ]
    ],
    [
        'name' => 'Red Chilli Sauce',
        'description' => 'Fiery red chilli hot sauce with a spicy kick.',
        'category' => 'Sauses',
        'img' => 'uploads/products/redchilli.saucejpg-removebg-preview.png',
        'isAvailable' => 1,
        'isTopDeal' => 0,
        'isBestSeller' => 0,
        'variants' => [
            ['size' => 'Dip Cup (50g)', 'price' => 50.00]
        ]
    ],
    [
        'name' => 'Tomato Ketchup',
        'description' => 'Classic sweet and tangy tomato ketchup dip.',
        'category' => 'Sauses',
        'img' => 'uploads/products/tomatoketchup-removebg-preview.png',
        'isAvailable' => 1,
        'isTopDeal' => 0,
        'isBestSeller' => 0,
        'variants' => [
            ['size' => 'Dip Cup (50g)', 'price' => 50.00]
        ]
    ],
    [
        'name' => 'Mayo Sauce',
        'description' => 'Traditional rich and savory mayonnaise.',
        'category' => 'Sauses',
        'img' => 'uploads/products/mayo-removebg-preview.png',
        'isAvailable' => 1,
        'isTopDeal' => 0,
        'isBestSeller' => 0,
        'variants' => [
            ['size' => 'Dip Cup (50g)', 'price' => 50.00]
        ]
    ],

    // DRINKS
    [
        'name' => '7Up',
        'description' => 'Crisp, refreshing lemon-lime carbonated beverage.',
        'category' => 'drinks',
        'img' => 'uploads/products/7up-removebg-preview.png',
        'isAvailable' => 1,
        'isTopDeal' => 0,
        'isBestSeller' => 1,
        'variants' => [
            ['size' => '345ml', 'price' => 110.00],
            ['size' => '500ml', 'price' => 140.00],
            ['size' => '1.5 Litre', 'price' => 220.00]
        ]
    ],
    [
        'name' => 'Mountain Dew',
        'description' => 'Exhilarating citrus blast soft drink.',
        'category' => 'drinks',
        'img' => 'uploads/products/dew-removebg-preview.png',
        'isAvailable' => 1,
        'isTopDeal' => 0,
        'isBestSeller' => 0,
        'variants' => [
            ['size' => '345ml', 'price' => 110.00],
            ['size' => '500ml', 'price' => 140.00],
            ['size' => '1.5 Litre', 'price' => 220.00]
        ]
    ],
    [
        'name' => 'Fanta',
        'description' => 'Bright and bubbly fruity orange soda.',
        'category' => 'drinks',
        'img' => 'uploads/products/fanta-removebg-preview.png',
        'isAvailable' => 1,
        'isTopDeal' => 0,
        'isBestSeller' => 0,
        'variants' => [
            ['size' => '345ml', 'price' => 110.00],
            ['size' => '500ml', 'price' => 140.00],
            ['size' => '1.5 Litre', 'price' => 220.00]
        ]
    ],
    [
        'name' => 'Pepsi',
        'description' => 'Bold, refreshing cola beverage with a crisp finish.',
        'category' => 'drinks',
        'img' => 'uploads/products/pepsi-removebg-preview.png',
        'isAvailable' => 1,
        'isTopDeal' => 0,
        'isBestSeller' => 1,
        'variants' => [
            ['size' => '345ml', 'price' => 110.00],
            ['size' => '500ml', 'price' => 140.00],
            ['size' => '1.5 Litre', 'price' => 220.00]
        ]
    ],
    [
        'name' => 'Mineral Water',
        'description' => 'Pure, clear, and refreshing premium drinking water.',
        'category' => 'drinks',
        'img' => 'uploads/products/water-removebg-preview.png',
        'isAvailable' => 1,
        'isTopDeal' => 0,
        'isBestSeller' => 0,
        'variants' => [
            ['size' => '500ml', 'price' => 60.00],
            ['size' => '1.5 Litre', 'price' => 100.00]
        ]
    ]
];

echo "🔄 Checking and inserting new sauces & drinks..." . PHP_EOL;

$checkItemStmt = $conn->prepare("SELECT id FROM menu_items WHERE LOWER(name) = LOWER(?)");
$insertItemStmt = $conn->prepare("INSERT INTO menu_items (name, description, category, img, isAvailable, isTopDeal, isBestSeller) VALUES (?, ?, ?, ?, ?, ?, ?)");
$insertVarStmt = $conn->prepare("INSERT INTO menu_variants (menu_id, size_name, price, in_stock) VALUES (?, ?, ?, 1)");
$updateImgStmt = $conn->prepare("UPDATE menu_items SET img = ?, description = ?, category = ? WHERE id = ?");

$insertedProductsCount = 0;

foreach ($newProducts as $prod) {
    $checkItemStmt->execute([$prod['name']]);
    $existing = $checkItemStmt->fetch(PDO::FETCH_ASSOC);

    if ($existing) {
        $itemId = $existing['id'];
        $updateImgStmt->execute([$prod['img'], $prod['description'], $prod['category'], $itemId]);
        echo "  [ID $itemId] Updated existing item: {$prod['name']} -> {$prod['img']}" . PHP_EOL;
    } else {
        $insertItemStmt->execute([
            $prod['name'],
            $prod['description'],
            $prod['category'],
            $prod['img'],
            $prod['isAvailable'],
            $prod['isTopDeal'],
            $prod['isBestSeller']
        ]);
        $newItemId = $conn->lastInsertId();

        foreach ($prod['variants'] as $v) {
            $insertVarStmt->execute([$newItemId, $v['size'], $v['price']]);
        }

        $insertedProductsCount++;
        echo "  [ID $newItemId] ➕ Inserted new item: {$prod['name']} ({$prod['category']}) with " . count($prod['variants']) . " variant(s)" . PHP_EOL;
    }
}

echo PHP_EOL . "═══════════════════════════════════════════════════════" . PHP_EOL;
echo "📊 MIGRATION SUMMARY" . PHP_EOL;
echo "═══════════════════════════════════════════════════════" . PHP_EOL;
echo "   Total Asset Images Processed : $copied" . PHP_EOL;
echo "   Existing Products Updated    : $updatedCount" . PHP_EOL;
echo "   New Products Inserted        : $insertedProductsCount" . PHP_EOL;
echo "   Image Uploads Directory      : $backendUploadsDir" . PHP_EOL;
echo "═══════════════════════════════════════════════════════" . PHP_EOL;
