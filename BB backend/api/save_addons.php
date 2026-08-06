<?php
include_once __DIR__ . '/../config/cors_headers.php';
include_once __DIR__ . '/../config/auth_middleware.php';
include_once '../config/Database.php';
$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if(!empty($data->menu_item_id) && isset($data->addons)) {
    try {
        $db->beginTransaction();

        // 1. Purane Add-ons delete karein
        $del = $db->prepare("DELETE FROM menu_addons WHERE menu_item_id = ?");
        $del->execute([$data->menu_item_id]);

        // 2. Naye Add-ons insert karein
        $ins = $db->prepare("INSERT INTO menu_addons (menu_item_id, addon_name, addon_price, inventory_id, qty_to_deduct) VALUES (?, ?, ?, ?, ?)");

        foreach($data->addons as $addon) {
            $ins->execute([
                $data->menu_item_id,
                $addon->addon_name,
                $addon->addon_price,
                $addon->inventory_id,
                $addon->qty
            ]);
        }

        $db->commit();
        echo json_encode(["status" => "success", "message" => "Add-ons saved"]);
    } catch(Exception $e) {
        $db->rollBack();
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
}
?>