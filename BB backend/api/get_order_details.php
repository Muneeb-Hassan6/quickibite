<?php
include_once __DIR__ . '/../config/cors_headers.php';
include_once __DIR__ . '/../config/Database.php';

$database = new Database();
$db = $database->getConnection();

$order_id = isset($_GET['id']) ? intval($_GET['id']) : (isset($_GET['order_id']) ? intval($_GET['order_id']) : 0);

if ($order_id <= 0) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Valid Order ID is required"
    ]);
    exit();
}

try {
    $stmt = $db->prepare("SELECT id, order_type, customer_name, customer_mobile, customer_address, table_number, total, status, payment_method, payment_status, created_at FROM orders WHERE id = :id");
    $stmt->execute([':id' => $order_id]);
    $order = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$order) {
        http_response_code(404);
        echo json_encode([
            "success" => false,
            "message" => "Order #$order_id not found in database"
        ]);
        exit();
    }

    $itemStmt = $db->prepare("SELECT id, title as name, size, note, qty, price FROM order_items WHERE order_id = :oid");
    $itemStmt->execute([':oid' => $order_id]);
    $order['cart'] = $itemStmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "order" => $order
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Database Error: " . $e->getMessage()
    ]);
}
?>
