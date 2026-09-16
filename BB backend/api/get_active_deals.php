<?php
include_once __DIR__ . '/../config/cors_headers.php';
include_once '../config/Database.php';

$database = new Database();
$db = $database->getConnection();

include_once __DIR__ . '/../config/DealInventoryHelper.php';

try {
    // Auto-deactivate deals whose day limit has expired
    $db->exec("UPDATE deals SET is_active = 0 WHERE is_active = 1 AND expires_at IS NOT NULL AND expires_at <= NOW()");

    // Initialize inventory and recipe helper
    DealInventoryHelper::init($db);

    $query = "SELECT * FROM deals 
              WHERE is_active = 1 
              AND (expires_at IS NULL OR expires_at > NOW())
              AND (is_permanent = 1 OR (CURRENT_TIME() BETWEEN start_time AND end_time)) 
              ORDER BY id DESC";

    $stmt = $db->prepare($query);
    $stmt->execute();
    $deals = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($deals as &$deal) {
        $deal_id = $deal['id'];
        
        // Fetch structured deal items
        $itemQuery = "SELECT id, menu_item_id, item_title, quantity, is_customizable, choice_group_name, options_json 
                      FROM deal_items 
                      WHERE deal_id = :deal_id 
                      ORDER BY id ASC";
                      
        $itemStmt = $db->prepare($itemQuery);
        $itemStmt->execute([':deal_id' => $deal_id]);
        $rawItems = $itemStmt->fetchAll(PDO::FETCH_ASSOC);

        // Process stock cascading across slots and flavor options
        DealInventoryHelper::processDeal($deal, $rawItems);
    }

    echo json_encode(["success" => true, "data" => $deals]);
} catch(PDOException $e) {
    echo json_encode(["success" => false, "message" => "DB Error: " . $e->getMessage()]);
}
?>