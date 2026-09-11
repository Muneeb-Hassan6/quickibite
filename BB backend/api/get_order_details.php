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
    $stmt = $db->prepare("SELECT o.*, DATE_FORMAT(o.created_at, '%h:%i %p') as time, DATE_FORMAT(o.created_at, '%d/%m/%Y') as date FROM orders o WHERE o.id = :id");
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

    $itemStmt = $db->prepare("SELECT id, title as name, size, note, qty, price, spice_level, selected_addons_json FROM order_items WHERE order_id = :oid");
    $itemStmt->execute([':oid' => $order_id]);
    $order['cart'] = $itemStmt->fetchAll(PDO::FETCH_ASSOC);
    $order['items'] = $order['cart'];

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
