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
    $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 0;
    $offset = isset($_GET['offset']) ? max(0, intval($_GET['offset'])) : 0;
    $format = isset($_GET['format']) ? trim($_GET['format']) : '';

    $limitSql = "";
    if ($limit > 0) {
        $limitSql = " LIMIT " . intval($limit) . " OFFSET " . intval($offset);
    }

    if ($type === 'all' || $type === 'cashier') {
        $countQuery = "SELECT COUNT(*) FROM orders";
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
                  ORDER BY o.id DESC" . $limitSql;
    } else {
        $countQuery = "SELECT COUNT(*) FROM orders WHERE status NOT IN ('Delivered', 'Completed', 'Dispatched', 'Cancelled', 'Declined')";
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
                  ORDER BY o.id DESC" . $limitSql;
    }

    $totalStmt = $db->prepare($countQuery);
    $totalStmt->execute();
    $total_count = intval($totalStmt->fetchColumn());

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

    $has_more = ($limit > 0) ? (($offset + count($final_orders)) < $total_count) : false;

    if ($format === 'paginated') {
        echo json_encode([
            "success" => true,
            "orders" => $final_orders,
            "total" => $total_count,
            "has_more" => $has_more,
            "limit" => $limit,
            "offset" => $offset
        ]);
    } else {
        header("X-Total-Count: " . $total_count);
        header("X-Has-More: " . ($has_more ? "1" : "0"));
        echo json_encode($final_orders);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "SQL Error: " . $e->getMessage(), "data" => []]);
}
?>