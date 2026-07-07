<?php
include_once __DIR__ . '/../config/cors_headers.php';

include_once __DIR__ . '/../config/auth_middleware.php';
require_role(['Admin', 'Cashier', 'Kitchen', 'Chef', 'Dispatcher']);

include_once '../config/Database.php';
$database = new Database();
$db = $database->getConnection();

try {
    // 🔥 CONDITION: Check karo ke kisne call kiya hy
    $type = isset($_GET['type']) ? $_GET['type'] : 'active';

    if ($type === 'all') {
        // ADMIN KE LIYE: Saare orders bhejo
        $query = "SELECT * FROM orders ORDER BY id DESC";
    } elseif ($type === 'cashier') {
        // CASHIER KE LIYE: Jo orders unpaid hain sirf wo dikhao
        $query = "SELECT * FROM orders WHERE payment_status != 'Paid' ORDER BY id DESC";
    } else {
        // KITCHEN KE LIYE (Default): Sirf active orders bhejo (Jo Dispatch nahi hue)
        $query = "SELECT * FROM orders WHERE status NOT IN ('Delivered', 'Completed', 'Dispatched') ORDER BY id DESC";
    }
    
    $stmt = $db->prepare($query);
    $stmt->execute();
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $final_orders = [];

    foreach ($orders as $order) {
        $itemQuery = "SELECT title as name, size, note, qty, price FROM order_items WHERE order_id = :oid";
        $itemStmt = $db->prepare($itemQuery);
        $itemStmt->execute([':oid' => $order['id']]);
        
        $order['items'] = $itemStmt->fetchAll(PDO::FETCH_ASSOC);
        
        $final_orders[] = $order;
    }

    echo json_encode($final_orders ?: []);
} catch (PDOException $e) {
    echo json_encode(["error" => "SQL Error: " . $e->getMessage()]);
}
?>