<?php
include_once __DIR__ . '/../config/cors_headers.php';
include_once __DIR__ . '/../config/auth_middleware.php';
include_once __DIR__ . '/../config/Database.php';

$database = new Database();
$db = $database->getConnection();
$data = json_decode(file_get_contents("php://input"));

// Check karein ke order_id aur rider_id aa gayi hai
if(!empty($data->order_id) && !empty($data->rider_id)) {
    
    // Order ko Dispatched mark karo aur rider ki ID save kar do
    $query = "UPDATE orders SET status = 'Dispatched', rider_id = :rider_id WHERE id = :order_id";
    $stmt = $db->prepare($query);

    $stmt->bindParam(":rider_id", $data->rider_id);
    $stmt->bindParam(":order_id", $data->order_id);

    if($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Order assigned successfully."]);
    } else {
        echo json_encode(["success" => false, "message" => "Failed to assign order."]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Incomplete data."]);
}
?>