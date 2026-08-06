<?php
include_once __DIR__ . '/../config/cors_headers.php';

include_once '../config/Database.php';

$database = new Database();
$db = $database->getConnection();

$rider_id = isset($_GET['rider_id']) ? $_GET['rider_id'] : die();

// Orders table se wo order nikalen jo is rider ko assign hua hai aur abhi raste mein hai
// 🔥 FIX: 'Assigned' dhoondne ke bajaye, hum sirf wo order dikhayenge jo abhi 'Delivered' NAHI hua!
        $query = "SELECT * FROM orders WHERE rider_id = :rider_id AND status != 'Delivered' LIMIT 1";
$stmt = $db->prepare($query);
$stmt->bindParam(":rider_id", $rider_id);
$stmt->execute();

if($stmt->rowCount() > 0) {
    $order = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Order ke items (cart) bhi nikal lein
    $itemQuery = "SELECT * FROM order_items WHERE order_id = :order_id";
    $itemStmt = $db->prepare($itemQuery);
    $itemStmt->bindParam(":order_id", $order['id']);
    $itemStmt->execute();
    
    $cart = [];
    while ($row = $itemStmt->fetch(PDO::FETCH_ASSOC)) {
        array_push($cart, $row);
    }
    $order['cart'] = $cart;

    echo json_encode(["success" => true, "order" => $order]);
} else {
    echo json_encode(["success" => false, "message" => "No new orders."]);
}
?>