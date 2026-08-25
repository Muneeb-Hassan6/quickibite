<?php
include_once __DIR__ . '/../config/cors_headers.php';
include_once __DIR__ . '/../config/auth_middleware.php';
require_role(['Admin', 'Manager']);
include_once __DIR__ . '/../config/Database.php';

$database = new Database();
$db = $database->getConnection();

if (!$db) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database connection failed"]);
    exit();
}

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->menu_item_id) && isset($data->addons)) {
    try {
        $db->beginTransaction();

        $menu_item_id = intval($data->menu_item_id);

        // 1. Purane Add-ons delete karein
        $del = $db->prepare("DELETE FROM menu_addons WHERE menu_item_id = ?");
        $del->execute([$menu_item_id]);

        // 2. Naye Add-ons insert karein
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
        echo json_encode([
            "success" => true,
            "status" => "success", // Backward compatibility
            "message" => "Add-ons saved successfully"
        ]);
    } catch (Exception $e) {
        $db->rollBack();
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "status" => "error", // Backward compatibility
            "message" => "Database error: " . $e->getMessage()
        ]);
    }
} else {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Incomplete data. menu_item_id and addons required."
    ]);
}
?>