<?php
include_once __DIR__ . '/../config/cors_headers.php';
include_once __DIR__ . '/../config/Database.php';

$database = new Database();
$db = $database->getConnection();

$deal_id = isset($_GET['id']) ? intval($_GET['id']) : (isset($_GET['deal_id']) ? intval($_GET['deal_id']) : 0);

if ($deal_id <= 0) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Valid Deal ID is required"]);
    exit();
}

try {
    $stmt = $db->prepare("SELECT * FROM deals WHERE id = :id AND is_active = 1");
    $stmt->execute([':id' => $deal_id]);
    $deal = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$deal) {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "Deal not found"]);
        exit();
    }

    $itemQuery = "SELECT id, item_title, quantity, is_customizable, choice_group_name, options_json 
                  FROM deal_items 
                  WHERE deal_id = :deal_id 
                  ORDER BY id ASC";
    $itemStmt = $db->prepare($itemQuery);
    $itemStmt->execute([':deal_id' => $deal_id]);
    $rawItems = $itemStmt->fetchAll(PDO::FETCH_ASSOC);

    $itemsList = [];
    $descParts = [];

    foreach ($rawItems as $it) {
        $options = null;
        if (!empty($it['options_json'])) {
            $options = is_string($it['options_json']) ? json_decode($it['options_json'], true) : $it['options_json'];
        }

        $itemsList[] = [
            'id' => $it['id'],
            'item_title' => $it['item_title'],
            'quantity' => intval($it['quantity'] ?? 1),
            'is_customizable' => intval($it['is_customizable'] ?? 0) === 1,
            'choice_group_name' => $it['choice_group_name'],
            'options' => $options ?? []
        ];

        $descParts[] = ($it['quantity'] > 1 ? $it['quantity'] . 'x ' : '1x ') . $it['item_title'];
    }

    $deal['items'] = $itemsList;
    $deal['badge_tag'] = $deal['badge_tag'] ?? $deal['tag'] ?? 'HOT DEAL';
    $deal['items_description'] = !empty($deal['description']) 
        ? $deal['description'] 
        : (count($descParts) > 0 ? implode(' + ', $descParts) : 'Exclusive Combo Deal');
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
