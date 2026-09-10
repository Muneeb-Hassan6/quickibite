<?php
include_once __DIR__ . '/../config/cors_headers.php';
include_once __DIR__ . '/../config/auth_middleware.php';
require_role(['Admin', 'Cashier', 'Kitchen', 'Chef', 'Dispatcher', 'Manager', 'Rider']);

include_once __DIR__ . '/../config/Database.php';
$database = new Database();
$db = $database->getConnection();

if (!$db) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database connection failed", "data" => []]);
    exit();
}

try {
    $type = isset($_GET['type']) ? trim($_GET['type']) : 'active';

    if ($type === 'all' || $type === 'cashier') {
        $query = "SELECT o.*, 
                         COALESCE(p.status, o.payment_status, 'Pending') as payment_status, 
                         COALESCE(p.method, o.payment_method, 'Cash') as payment_method,
                         DATE_FORMAT(o.created_at, '%h:%i %p') as time,
                         DATE_FORMAT(o.created_at, '%d/%m/%Y') as date,
                         s.name as rider_name,
                         s.phone as rider_phone
                  FROM orders o 
                  LEFT JOIN payments p ON o.id = p.order_id 
                  LEFT JOIN staff s ON o.rider_id = s.id
                  ORDER BY o.id DESC";
    } else {
        $query = "SELECT o.*, 
                         COALESCE(p.status, o.payment_status, 'Pending') as payment_status, 
                         COALESCE(p.method, o.payment_method, 'Cash') as payment_method,
                         DATE_FORMAT(o.created_at, '%h:%i %p') as time,
                         DATE_FORMAT(o.created_at, '%d/%m/%Y') as date,
                         s.name as rider_name,
                         s.phone as rider_phone
                  FROM orders o 
                  LEFT JOIN payments p ON o.id = p.order_id 
                  LEFT JOIN staff s ON o.rider_id = s.id
                  WHERE o.status NOT IN ('Delivered', 'Completed', 'Dispatched', 'Cancelled', 'Declined') 
                  ORDER BY o.id DESC";
    }
    
    $stmt = $db->prepare($query);
    $stmt->execute();
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $final_orders = [];

    foreach ($orders as $order) {
        $itemQuery = "SELECT id, title as name, size, note, qty, price, spice_level, selected_addons_json FROM order_items WHERE order_id = :oid";
        $itemStmt = $db->prepare($itemQuery);
        $itemStmt->execute([':oid' => $order['id']]);
        
        $order['items'] = $itemStmt->fetchAll(PDO::FETCH_ASSOC);
        $order['cart'] = $order['items'];
        
        $final_orders[] = $order;
    }

    echo json_encode($final_orders);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "SQL Error: " . $e->getMessage(), "data" => []]);
}
?>