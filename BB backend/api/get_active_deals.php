<?php
include_once __DIR__ . '/../config/cors_headers.php';

include_once '../config/Database.php';
$database = new Database();
$db = $database->getConnection();

try {
    $query = "SELECT * FROM deals 
              WHERE is_active = 1 
              AND (is_permanent = 1 OR (CURRENT_TIME() BETWEEN start_time AND end_time)) 
              ORDER BY id DESC";

    $stmt = $db->prepare($query);
    $stmt->execute();
    $deals = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($deals as &$deal) {
        $deal_id = $deal['id'];
        
        // 🔥 YAHAN TABLE KA ASAL NAAM LIKHNA HAI (Maine 'menu_items' kar diya hai)
        $itemQuery = "SELECT di.quantity, m.* FROM deal_items di 
                      JOIN menu_items m ON di.menu_item_id = m.id 
                      WHERE di.deal_id = :deal_id";
                      
        $itemStmt = $db->prepare($itemQuery);
        $itemStmt->execute([':deal_id' => $deal_id]);
        $items = $itemStmt->fetchAll(PDO::FETCH_ASSOC);
        
        $itemsString = "";
        if (count($items) > 0) {
            $itemParts = [];
            foreach ($items as $item) {
                $itemName = isset($item['title']) ? $item['title'] : (isset($item['name']) ? $item['name'] : 'Item');
                $itemParts[] = $item['quantity'] . "x " . $itemName; 
            }
            $itemsString = implode(", ", $itemParts);
        }
        
        $deal['items_description'] = $itemsString; 
    }

    echo json_encode(["success" => true, "data" => $deals]);
} catch(PDOException $e) {
    echo json_encode(["success" => false, "message" => "DB Error: " . $e->getMessage()]);
}
?>