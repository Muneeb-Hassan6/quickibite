<?php
require_once __DIR__ . '/../config/cors_headers.php';
require_once __DIR__ . '/../config/Database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        throw new Exception("Database connection failed.");
    }

    // 1. Fetch all items from inventory table
    $invStmt = $db->query("SELECT id, name, unit, price, stock FROM inventory ORDER BY id ASC");
    $inventory = $invStmt->fetchAll(PDO::FETCH_ASSOC);

    // Map specific inventory IDs by name
    $invMap = [];
    foreach ($inventory as $i) {
        $invMap[strtolower(trim($i['name']))] = intval($i['id']);
    }

    $cheeseSliceId = $invMap['cheese slice'] ?? 12;
    $cheddarCheeseId = $invMap['chadder cheese'] ?? 15;
    $mozzarellaId = $invMap['mozarella cheese'] ?? 14;
    $generalCheeseId = $invMap['cheese'] ?? 11;
    $garlicMayoId = $invMap['garlic mayo'] ?? 30;
    $mayoId = $invMap['white mayonise'] ?? 20;
    $ketchupId = $invMap['ketchup'] ?? 21;
    $pattyId = $invMap['chicken patty'] ?? 27;
    $steakId = $invMap['chicken steak'] ?? 28;
    $jalapenoId = $invMap['jelapeno'] ?? 13;
    $mushroomId = $invMap['mashroom'] ?? 9;
    $oliveId = $invMap['black olive'] ?? 10;

    // 2. Fetch all product_custom_addons
    $addonStmt = $db->query("SELECT id, menu_item_id, title, price FROM product_custom_addons");
    $addons = $addonStmt->fetchAll(PDO::FETCH_ASSOC);

    $updateStmt = $db->prepare("
        UPDATE product_custom_addons 
        SET inventory_id = ?, qty_to_deduct = ? 
        WHERE id = ?
    ");

    $legacyUpdate = $db->prepare("
        UPDATE menu_addons 
        SET inventory_id = ?, qty_to_deduct = ? 
        WHERE menu_item_id = ? AND addon_name = ?
    ");

    $updatedList = [];

    foreach ($addons as $addon) {
        $title = $addon['title'];
        $titleLower = strtolower($title);
        $invId = null;
        $qty = 1.0;

        if (strpos($titleLower, 'cheddar') !== false || strpos($titleLower, 'slice') !== false) {
            $invId = $cheeseSliceId;
            $qty = 1.0; // 1 piece
        } elseif (strpos($titleLower, 'mozzarella') !== false || strpos($titleLower, 'mozarella') !== false) {
            $invId = $mozzarellaId;
            $qty = 50.0; // 50 grams
        } elseif (strpos($titleLower, 'crust') !== false || (strpos($titleLower, 'cheese') !== false && strpos($titleLower, 'stuffed') !== false)) {
            $invId = $generalCheeseId;
            $qty = 100.0; // 100 grams
        } elseif (strpos($titleLower, 'garlic') !== false || strpos($titleLower, 'dip') !== false) {
            $invId = $garlicMayoId;
            $qty = 30.0; // 30 grams
        } elseif (strpos($titleLower, 'mayo') !== false) {
            $invId = $mayoId;
            $qty = 30.0; // 30 grams
        } elseif (strpos($titleLower, 'ketchup') !== false || strpos($titleLower, 'sauce') !== false) {
            $invId = $ketchupId;
            $qty = 30.0; // 30 grams
        } elseif (strpos($titleLower, 'bacon') !== false || strpos($titleLower, 'strip') !== false || strpos($titleLower, 'steak') !== false) {
            $invId = $steakId;
            $qty = 1.0; // 1 piece
        } elseif (strpos($titleLower, 'patty') !== false) {
            $invId = $pattyId;
            $qty = 1.0; // 1 piece
        } elseif (strpos($titleLower, 'jalapeno') !== false || strpos($titleLower, 'jelapeno') !== false) {
            $invId = $jalapenoId;
            $qty = 20.0; // 20 grams
        } elseif (strpos($titleLower, 'olive') !== false) {
            $invId = $oliveId;
            $qty = 20.0; // 20 grams
        } elseif (strpos($titleLower, 'mushroom') !== false || strpos($titleLower, 'mashroom') !== false) {
            $invId = $mushroomId;
            $qty = 20.0; // 20 grams
        } else {
            $invId = $cheeseSliceId;
            $qty = 1.0;
        }

        $updateStmt->execute([$invId, $qty, $addon['id']]);
        $legacyUpdate->execute([$invId, $qty, $addon['menu_item_id'], $addon['title']]);

        $updatedList[] = [
            'id' => $addon['id'],
            'title' => $addon['title'],
            'inventory_id' => $invId,
            'qty_to_deduct' => $qty
        ];
    }

    // Clean up scratch file if needed
    if (file_exists(__DIR__ . '/../../scratch_desc_inv.php')) {
        @unlink(__DIR__ . '/../../scratch_desc_inv.php');
    }

    echo json_encode([
        "success" => true,
        "message" => "All product custom addons relinked to exact inventory IDs successfully.",
        "addons_relinked" => count($updatedList),
        "details" => array_slice($updatedList, 0, 6)
    ]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
