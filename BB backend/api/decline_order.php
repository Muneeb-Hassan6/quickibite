<?php
include_once __DIR__ . '/../config/cors_headers.php';
include_once __DIR__ . '/../config/auth_middleware.php';
include_once __DIR__ . '/../config/Database.php';

$database = new Database();
$db = $database->getConnection();
$data = json_decode(file_get_contents("php://input"));

$rawOrderIds = [];
if (!empty($data->order_ids) && is_array($data->order_ids)) {
    $rawOrderIds = $data->order_ids;
} elseif (!empty($data->order_id)) {
    $rawOrderIds = [$data->order_id];
} elseif (!empty($data->id)) {
    $rawOrderIds = [$data->id];
}

$orderIds = array_values(array_unique(array_filter(array_map('intval', $rawOrderIds))));

if(!empty($orderIds) && !empty($data->rider_id)) {
    try {
        $db->beginTransaction();

        // 1. Order status 'Ready' kar do aur rider_id hata do taa ke dispatcher ko dobara "Ready" orders mein show ho
        $stmt1 = $db->prepare("UPDATE orders SET status = 'Ready', rider_id = 0 WHERE id = :order_id");
        foreach ($orderIds as $oid) {
            $stmt1->execute([':order_id' => $oid]);
        }

        // 2. Rider ko dubara 'Available' mark kar do taa ke usay naye orders assign ho sakein
        $query2 = "UPDATE staff SET shift_status = 'Available' WHERE id = :rider_id";
        $stmt2 = $db->prepare($query2);
        $stmt2->execute([':rider_id' => $data->rider_id]);

        $db->commit();
        echo json_encode([
            "success" => true, 
            "message" => count($orderIds) > 1 ? "Batch of orders declined successfully. Returned to dispatcher." : "Order declined successfully. Returned to dispatcher.",
            "order_ids" => $orderIds
        ]);
    } catch(PDOException $e) {
        $db->rollBack();
        echo json_encode(["success" => false, "message" => "Database Error: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Incomplete data."]);
}
?>
