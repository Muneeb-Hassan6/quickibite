<?php
include_once __DIR__ . '/../config/cors_headers.php';
include_once __DIR__ . '/../config/Database.php';

$database = new Database();
$db = $database->getConnection();

if (empty($_GET['rider_id'])) {
    echo json_encode(["success" => false, "message" => "rider_id parameter is required.", "order" => null]);
    exit();
}

$rider_id = $_GET['rider_id'];

try {
    // Only return orders that are actively assigned/in transit to this rider
    $query = "SELECT * FROM orders 
              WHERE rider_id = :rider_id 
                AND status IN ('Dispatched', 'Out for Delivery', 'On the Way')
              ORDER BY id DESC 
              LIMIT 1";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":rider_id", $rider_id);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        $order = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Fetch order items (cart)
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
        echo json_encode(["success" => false, "message" => "No active orders.", "order" => null]);
    }
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Database Error: " . $e->getMessage(), "order" => null]);
}
?>