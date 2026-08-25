<?php
include_once __DIR__ . '/../config/cors_headers.php';
include_once __DIR__ . '/../config/Database.php';

$database = new Database();
$db = $database->getConnection();

if (!$db) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database connection failed"]);
    exit;
}

$menu_item_id = isset($_GET['menu_item_id']) ? intval($_GET['menu_item_id']) : 0;

if ($menu_item_id <= 0) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Valid menu_item_id is required", "data" => []]);
    exit;
}

try {
    $query = "SELECT id, menu_item_id, addon_name, addon_price, inventory_id, qty_to_deduct 
              FROM menu_addons 
              WHERE menu_item_id = ? 
              ORDER BY id ASC";
    $stmt = $db->prepare($query);
    $stmt->execute([$menu_item_id]);
    $addons = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "status" => "success", // Backward compatibility
        "data" => $addons,
        "addons" => $addons     // Backward compatibility
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Database error: " . $e->getMessage(),
        "data" => []
    ]);
}
?>