<?php
include_once __DIR__ . '/../config/cors_headers.php';
include_once __DIR__ . '/../config/auth_middleware.php';
include_once __DIR__ . '/../config/Database.php';

$database = new Database();
$db = $database->getConnection();
$data = json_decode(file_get_contents("php://input"));

// Check that order_id and rider_id are provided
if (!empty($data->order_id) && !empty($data->rider_id)) {
    try {
        $db->beginTransaction();

        // 1. Verify Rider exists and is Available (Lock row)
        $riderStmt = $db->prepare("SELECT id, name, shift_status FROM staff WHERE id = :rider_id FOR UPDATE");
        $riderStmt->execute([':rider_id' => $data->rider_id]);
        $rider = $riderStmt->fetch(PDO::FETCH_ASSOC);

        if (!$rider) {
            $db->rollBack();
            echo json_encode(["success" => false, "message" => "Rider not found."]);
            exit();
        }

        if (strtolower($rider['shift_status'] ?? '') !== 'available') {
            $db->rollBack();
            echo json_encode([
                "success" => false, 
                "message" => "Rider is currently " . ($rider['shift_status'] ?: 'Unavailable') . " and cannot be assigned."
            ]);
            exit();
        }

        // 2. Verify Order exists and is ready for dispatch (Lock row)
        $orderStmt = $db->prepare("SELECT id, status, rider_id FROM orders WHERE id = :order_id FOR UPDATE");
        $orderStmt->execute([':order_id' => $data->order_id]);
        $order = $orderStmt->fetch(PDO::FETCH_ASSOC);

        if (!$order) {
            $db->rollBack();
            echo json_encode(["success" => false, "message" => "Order not found."]);
            exit();
        }

        if (in_array(strtolower($order['status']), ['dispatched', 'out for delivery', 'delivered', 'cancelled'])) {
            $db->rollBack();
            echo json_encode([
                "success" => false, 
                "message" => "Order #{$data->order_id} is already {$order['status']}."
            ]);
            exit();
        }

        // 3. Atomically update Order status and assign rider
        $updateOrder = $db->prepare("UPDATE orders SET status = 'Dispatched', rider_id = :rider_id WHERE id = :order_id");
        $updateOrder->execute([
            ':rider_id' => $data->rider_id,
            ':order_id' => $data->order_id
        ]);

        // 4. Atomically set Rider shift_status to Busy
        $updateRider = $db->prepare("UPDATE staff SET shift_status = 'Busy' WHERE id = :rider_id");
        $updateRider->execute([':rider_id' => $data->rider_id]);

        $db->commit();
        echo json_encode([
            "success" => true, 
            "message" => "Order assigned successfully.",
            "order_id" => $data->order_id,
            "rider_id" => $data->rider_id
        ]);

    } catch (PDOException $e) {
        if ($db->inTransaction()) {
            $db->rollBack();
        }
        echo json_encode(["success" => false, "message" => "Database Error: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Incomplete data. Both order_id and rider_id are required."]);
}
?>