<?php
include_once __DIR__ . '/../config/cors_headers.php';
include_once __DIR__ . '/../config/auth_middleware.php';
include_once __DIR__ . '/../config/Database.php';

$database = new Database();
$db = $database->getConnection();
$data = json_decode(file_get_contents("php://input"));

if(!empty($data->order_id) && !empty($data->rider_id)) {
    try {
        $db->beginTransaction();

        // 1. Order status 'Ready' kar do aur rider_id hata do taa ke dispatcher ko dobara "Ready" orders mein show ho
        $query1 = "UPDATE orders SET status = 'Ready', rider_id = 0 WHERE id = :order_id";
        $stmt1 = $db->prepare($query1);
        $stmt1->bindParam(":order_id", $data->order_id);
        $stmt1->execute();

        // 2. Rider ko dubara 'Available' mark kar do taa ke usay naye orders assign ho sakein
        $query2 = "UPDATE staff SET shift_status = 'Available' WHERE id = :rider_id";
        $stmt2 = $db->prepare($query2);
        $stmt2->bindParam(":rider_id", $data->rider_id);
        $stmt2->execute();

        $db->commit();
        echo json_encode(["success" => true, "message" => "Order declined successfully. Returned to dispatcher."]);
    } catch(PDOException $e) {
        $db->rollBack();
        echo json_encode(["success" => false, "message" => "Database Error: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Incomplete data."]);
}
?>
