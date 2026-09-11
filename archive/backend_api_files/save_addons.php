<?php
if (!ob_get_level()) {
    ob_start();
}

include_once __DIR__ . '/../config/cors_headers.php';
include_once __DIR__ . '/../config/Database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        throw new Exception("Database connection failed");
    }

    $rawInput = file_get_contents("php://input");
    $data = json_decode($rawInput);

    if (!empty($data->menu_item_id) && isset($data->addons)) {
        $db->beginTransaction();

        $menu_item_id = intval($data->menu_item_id);

        // 1. Delete old add-ons
        $del = $db->prepare("DELETE FROM menu_addons WHERE menu_item_id = ?");
        $del->execute([$menu_item_id]);

        // 2. Insert new add-ons
        $ins = $db->prepare("INSERT INTO menu_addons (menu_item_id, addon_name, addon_price, inventory_id, qty_to_deduct) VALUES (?, ?, ?, ?, ?)");

        foreach ($data->addons as $addon) {
            $name = trim($addon->addon_name ?? '');
            if ($name === '') continue;

            $price = isset($addon->addon_price) && $addon->addon_price !== '' ? floatval($addon->addon_price) : 0.0;
            $inventory_id = !empty($addon->inventory_id) && intval($addon->inventory_id) > 0 ? intval($addon->inventory_id) : null;
            $qty = !empty($addon->qty) && floatval($addon->qty) > 0 ? floatval($addon->qty) : null;

            $ins->execute([
                $menu_item_id,
                $name,
                $price,
                $inventory_id,
                $qty
            ]);
        }

        $db->commit();
        if (ob_get_level()) ob_clean();
        echo json_encode([
            "success" => true,
            "status" => "success",
            "message" => "Add-ons saved successfully"
        ]);
        exit();
    } else {
        throw new Exception("Incomplete data. menu_item_id and addons are required.");
    }
} catch (Exception $e) {
    if (isset($db) && $db && $db->inTransaction()) {
        $db->rollBack();
    }
    if (ob_get_level()) ob_clean();
    echo json_encode([
        "success" => false,
        "status" => "error",
        "message" => $e->getMessage()
    ]);
    exit();
}
?>