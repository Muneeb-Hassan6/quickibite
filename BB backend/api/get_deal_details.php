<?php
include_once __DIR__ . '/../config/cors_headers.php';
include_once __DIR__ . '/../config/Database.php';
include_once __DIR__ . '/../config/DealInventoryHelper.php';

$database = new Database();
$db = $database->getConnection();

$deal_id = isset($_GET['id']) ? intval($_GET['id']) : (isset($_GET['deal_id']) ? intval($_GET['deal_id']) : 0);

if ($deal_id <= 0) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Valid Deal ID is required"]);
    exit();
}

try {
    // Initialize inventory helper for stock cascading
    DealInventoryHelper::init($db);

    $stmt = $db->prepare("SELECT * FROM deals WHERE id = :id AND is_active = 1 AND (expires_at IS NULL OR expires_at > NOW())");
    $stmt->execute([':id' => $deal_id]);
    $deal = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$deal) {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "Deal not found"]);
        exit();
    }

    $itemQuery = "SELECT id, menu_item_id, item_title, quantity, is_customizable, choice_group_name, options_json 
                  FROM deal_items 
                  WHERE deal_id = :deal_id 
                  ORDER BY id ASC";
    $itemStmt = $db->prepare($itemQuery);
    $itemStmt->execute([':deal_id' => $deal_id]);
    $rawItems = $itemStmt->fetchAll(PDO::FETCH_ASSOC);

    // Process stock cascading across slots and flavor options
    DealInventoryHelper::processDeal($deal, $rawItems);

    $deal['badge_tag'] = $deal['badge_tag'] ?? $deal['tag'] ?? 'HOT DEAL';
    $deal['is_deal'] = true;
    $deal['price'] = floatval($deal['price']);
    $deal['original_price'] = !empty($deal['original_price']) ? floatval($deal['original_price']) : null;
    $deal['addon_categories'] = !empty($deal['addon_categories']) ? $deal['addon_categories'] : 'drinks,Potato Corner,Sauses,Grilled Wings';

    echo json_encode([
        "success" => true,
        "deal" => $deal,
        "data" => $deal
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database Error: " . $e->getMessage()]);
}
?>
