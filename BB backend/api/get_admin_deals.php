<?php
include_once __DIR__ . '/../config/cors_headers.php';
include_once '../config/Database.php';

$database = new Database();
$db = $database->getConnection();

try {
    $query = "SELECT * FROM deals ORDER BY id DESC";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $deals = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($deals as &$deal) {
        $deal_id = $deal['id'];
        
        $itemQuery = "SELECT id, item_title, quantity, is_customizable, choice_group_name, options_json 
                      FROM deal_items 
                      WHERE deal_id = :deal_id 
                      ORDER BY id ASC";
                      
        $itemStmt = $db->prepare($itemQuery);
        $itemStmt->execute([':deal_id' => $deal_id]);
        $rawItems = $itemStmt->fetchAll(PDO::FETCH_ASSOC);
        
        $itemsList = [];
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
                'choice_group_name' => $it['choice_group_name'] ?? '',
                'options' => $options ?? []
            ];
        }

        $deal['items'] = $itemsList;
        $deal['badge_tag'] = $deal['badge_tag'] ?? $deal['tag'] ?? 'DEAL';
    }

    echo json_encode(["success" => true, "data" => $deals]);
} catch(PDOException $e) {
    echo json_encode(["success" => false, "message" => "DB Error: " . $e->getMessage()]);
}
?>