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

    // Har deal k andr uske items nikal rahy hain
    foreach ($deals as &$deal) {
        // 🔥 YAHAN JOIN menu_items KAR DIYA HAI (Agar aapki table ka naam kuch aur hy toh wo likhein)
        $itemQuery = "SELECT di.menu_item_id, di.quantity as qty, m.* FROM deal_items di 
                      JOIN menu_items m ON di.menu_item_id = m.id 
                      WHERE di.deal_id = :deal_id"; 
                      
        $itemStmt = $db->prepare($itemQuery);
        $itemStmt->execute([':deal_id' => $deal['id']]);
        $rawItems = $itemStmt->fetchAll(PDO::FETCH_ASSOC);
        
        $formattedItems = [];
        foreach ($rawItems as $item) {
            // Check if title exists, warna name use karega
            $itemName = isset($item['title']) ? $item['title'] : (isset($item['name']) ? $item['name'] : 'Item');
            $formattedItems[] = [
                "menu_item_id" => $item['menu_item_id'],
                "qty"          => $item['qty'],
                "name"         => $itemName
            ];
        }
        $deal['items'] = $formattedItems;
    }

    echo json_encode(["success" => true, "data" => $deals]);
} catch(PDOException $e) {
    // Agar koi DB error hoga toh khamosh nahi rahega, bta dega
    echo json_encode(["success" => false, "message" => "DB Error: " . $e->getMessage()]);
}
?>