<?php
include_once __DIR__ . '/../config/cors_headers.php';

include_once __DIR__ . '/../config/Database.php';

$database = new Database();
$conn = $database->getConnection();

if (!$conn) {
    echo json_encode(["success" => false, "message" => "Database connection failed."]);
    exit();
}

// 🔥 NAYI TABDEELI 1: Query mein v.in_stock add kiya
$query = "SELECT m.*, v.size_name, v.price, v.id as variant_id, v.in_stock 
          FROM menu_items m 
          LEFT JOIN menu_variants v ON m.id = v.menu_id";

$stmt = $conn->query($query);
$menu = [];

if ($stmt && $stmt->rowCount() > 0) {
    while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $id = $row['id'];
        
        if (!isset($menu[$id])) {
            $menu[$id] = [
                "id" => $id,
                "name" => $row['name'],
                "description" => $row['description'],
                "category" => $row['category'],
                "img" => $row['img'],
                "isAvailable" => (bool)$row['isAvailable'],
                "isTopDeal" => (bool)$row['isTopDeal'],
                "isBestSeller" => (bool)$row['isBestSeller'],
                "variants" => []
            ];
        }
        
        if ($row['variant_id']) {
            $menu[$id]['variants'][] = [
                "id" => $row['variant_id'],
                "size" => $row['size_name'],
                "price" => $row['price'],
                // 🔥 NAYI TABDEELI 2: Database ki in_stock value ko React ke true/false mein bheja
                "inStock" => isset($row['in_stock']) ? (bool)$row['in_stock'] : true
            ];
            
            // Default price for table view
            if (!isset($menu[$id]['price'])) {
                $menu[$id]['price'] = $row['price'];
            }
        }
    }
}

echo json_encode(array_values($menu));
$conn = null; // Close connection
?>