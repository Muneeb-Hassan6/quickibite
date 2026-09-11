<?php
require_once __DIR__ . '/../config/cors_headers.php';
require_once __DIR__ . '/../config/Database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        throw new Exception("Unable to connect to database.");
    }

    // 1. Fetch exact rows from inventory table
    $invStmt = $db->query("SELECT id, name, unit, price, stock FROM inventory ORDER BY id ASC");
    $inventoryRows = $invStmt->fetchAll(PDO::FETCH_ASSOC);

    $invByName = [];
    foreach ($inventoryRows as $r) {
        $invByName[strtolower(trim($r['name']))] = $r;
    }

    // Identify authentic inventory items
    $cheeseSlice = $invByName['cheese slice'] ?? null;
    $garlicMayo = $invByName['garlic mayo'] ?? null;
    $whiteMayo = $invByName['white mayonise'] ?? null;
    $ketchup = $invByName['ketchup'] ?? null;
    $chickenPatty = $invByName['chicken patty'] ?? null;
    $chickenSteak = $invByName['chicken steak'] ?? null;
    $mozarellaCheese = $invByName['mozarella cheese'] ?? null;
    $cheddarCheese = $invByName['chadder cheese'] ?? null;
    $generalCheese = $invByName['cheese'] ?? null;
    $blackOlive = $invByName['black olive'] ?? null;
    $jalapeno = $invByName['jelapeno'] ?? null;
    $mushroom = $invByName['mashroom'] ?? null;

    // 2. Fetch all menu items
    $menuStmt = $db->query("SELECT id, name, category FROM menu_items ORDER BY id ASC");
    $menuItems = $menuStmt->fetchAll(PDO::FETCH_ASSOC);

    // Clean up all old / mismatched rows
    $db->exec("TRUNCATE TABLE product_custom_addons");
    $db->exec("TRUNCATE TABLE menu_addons");

    $insCustom = $db->prepare("
        INSERT INTO product_custom_addons (menu_item_id, title, price, inventory_id, qty_to_deduct, is_active)
        VALUES (?, ?, ?, ?, ?, 1)
    ");

    $insLegacy = $db->prepare("
        INSERT INTO menu_addons (menu_item_id, addon_name, addon_price, inventory_id, qty_to_deduct)
        VALUES (?, ?, ?, ?, ?)
    ");

    $addedCount = 0;
    $summary = [];

    foreach ($menuItems as $m) {
        $mId = intval($m['id']);
        $cat = strtolower(trim($m['category']));
        $name = strtolower(trim($m['name']));

        // A. BURGERS & STEAKS & WRAPS
        if (strpos($cat, 'burger') !== false || strpos($name, 'burger') !== false || strpos($name, 'steak') !== false || strpos($name, 'patty') !== false) {
            // 1. Extra Cheese Slice
            if ($cheeseSlice) {
                $insCustom->execute([$mId, 'Extra Cheese Slice', 70.00, $cheeseSlice['id'], 1.0]);
                $insLegacy->execute([$mId, 'Extra Cheese Slice', 70.00, $cheeseSlice['id'], 1.0]);
                $addedCount++;
            }
            // 2. Garlic Mayo Dip Sauce
            if ($garlicMayo) {
                $insCustom->execute([$mId, 'Garlic Mayo Sauce', 60.00, $garlicMayo['id'], 30.0]);
                $insLegacy->execute([$mId, 'Garlic Mayo Sauce', 60.00, $garlicMayo['id'], 30.0]);
                $addedCount++;
            }
            // 3. Extra Chicken Patty (or Steak)
            if ($chickenPatty) {
                $insCustom->execute([$mId, 'Extra Chicken Patty', 150.00, $chickenPatty['id'], 1.0]);
                $insLegacy->execute([$mId, 'Extra Chicken Patty', 150.00, $chickenPatty['id'], 1.0]);
                $addedCount++;
            }
            // 4. White Mayonise
            if ($whiteMayo) {
                $insCustom->execute([$mId, 'Extra Mayo Dip', 50.00, $whiteMayo['id'], 30.0]);
                $insLegacy->execute([$mId, 'Extra Mayo Dip', 50.00, $whiteMayo['id'], 30.0]);
                $addedCount++;
            }
        }
        // B. PIZZAS
        else if (strpos($cat, 'pizza') !== false || strpos($name, 'pizza') !== false) {
            // 1. Mozzarella Cheese
            if ($mozarellaCheese) {
                $insCustom->execute([$mId, 'Extra Mozarella Cheese', 150.00, $mozarellaCheese['id'], 50.0]);
                $insLegacy->execute([$mId, 'Extra Mozarella Cheese', 150.00, $mozarellaCheese['id'], 50.0]);
                $addedCount++;
            }
            // 2. Cheddar Cheese
            if ($cheddarCheese) {
                $insCustom->execute([$mId, 'Extra Chadder Cheese', 150.00, $cheddarCheese['id'], 50.0]);
                $insLegacy->execute([$mId, 'Extra Chadder Cheese', 150.00, $cheddarCheese['id'], 50.0]);
                $addedCount++;
            }
            // 3. Black Olives
            if ($blackOlive) {
                $insCustom->execute([$mId, 'Extra Black Olive', 80.00, $blackOlive['id'], 20.0]);
                $insLegacy->execute([$mId, 'Extra Black Olive', 80.00, $blackOlive['id'], 20.0]);
                $addedCount++;
            }
            // 4. Jalapeno
            if ($jalapeno) {
                $insCustom->execute([$mId, 'Extra Jelapeno', 80.00, $jalapeno['id'], 20.0]);
                $insLegacy->execute([$mId, 'Extra Jelapeno', 80.00, $jalapeno['id'], 20.0]);
                $addedCount++;
            }
            // 5. Mushroom
            if ($mushroom) {
                $insCustom->execute([$mId, 'Extra Mashroom', 100.00, $mushroom['id'], 20.0]);
                $insLegacy->execute([$mId, 'Extra Mashroom', 100.00, $mushroom['id'], 20.0]);
                $addedCount++;
            }
        }
        // C. WRAPS & SHAWARMA
        else if (strpos($cat, 'wrap') !== false || strpos($name, 'wrap') !== false || strpos($cat, 'shawarma') !== false) {
            if ($cheeseSlice) {
                $insCustom->execute([$mId, 'Extra Cheese Slice', 70.00, $cheeseSlice['id'], 1.0]);
                $insLegacy->execute([$mId, 'Extra Cheese Slice', 70.00, $cheeseSlice['id'], 1.0]);
                $addedCount++;
            }
            if ($garlicMayo) {
                $insCustom->execute([$mId, 'Extra Garlic Mayo', 50.00, $garlicMayo['id'], 30.0]);
                $insLegacy->execute([$mId, 'Extra Garlic Mayo', 50.00, $garlicMayo['id'], 30.0]);
                $addedCount++;
            }
        }
    }

    echo json_encode([
        "success" => true,
        "message" => "Strict inventory alignment completed with 100% database symmetry.",
        "addons_created" => $addedCount
    ]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
