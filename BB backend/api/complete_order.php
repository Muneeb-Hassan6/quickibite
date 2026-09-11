<?php
include_once __DIR__ . '/../config/cors_headers.php';
include_once __DIR__ . '/../config/auth_middleware.php';
include_once __DIR__ . '/../config/Database.php';

$database = new Database();
$db = $database->getConnection();
$data = json_decode(file_get_contents("php://input"));

if (isset($data->order_id) && isset($data->rider_id)) {
    try {
        $db->beginTransaction();

        // 1. Fetch current order info to verify and check payment method
        $ordStmt = $db->prepare("SELECT id, payment_method, payment_status FROM orders WHERE id = :order_id FOR UPDATE");
        $ordStmt->execute([':order_id' => $data->order_id]);
        $orderInfo = $ordStmt->fetch(PDO::FETCH_ASSOC);

        // 2. Mark order as 'Delivered' and update payment_status to 'Paid' for COD / completed delivery
        $payMethod = isset($data->payment_method) ? $data->payment_method : ($orderInfo['payment_method'] ?? '');
        $isCod = in_array(strtoupper(trim($payMethod)), ['COD', 'CASH ON DELIVERY', 'CASH']);

        $stmt1 = $db->prepare("UPDATE orders SET status = 'Delivered', payment_status = 'Paid' WHERE id = :order_id");
        $stmt1->execute([':order_id' => $data->order_id]);

        // 3. Update payments table record if present
        $stmtPay = $db->prepare("UPDATE payments SET status = 'Paid' WHERE order_id = :order_id");
        $stmtPay->execute([':order_id' => $data->order_id]);

        // 4. Rider table: increment trips_completed
        $stmt2 = $db->prepare("UPDATE rider SET trips_completed = trips_completed + 1 WHERE staff_id = :rider_id");
        $stmt2->execute([':rider_id' => $data->rider_id]);
        if ($stmt2->rowCount() === 0) {
            $chkRider = $db->prepare("SELECT id FROM rider WHERE staff_id = :rider_id");
            $chkRider->execute([':rider_id' => $data->rider_id]);
            if ($chkRider->rowCount() === 0) {
                $insRider = $db->prepare("INSERT INTO rider (staff_id, trips_completed) VALUES (:rider_id, 1)");
                $insRider->execute([':rider_id' => $data->rider_id]);
            }
        }

        // 5. Rider staff record: reset shift_status to Available
        $stmt3 = $db->prepare("UPDATE staff SET shift_status = 'Available' WHERE id = :rider_id");
        $stmt3->execute([':rider_id' => $data->rider_id]);

        $db->commit();
        echo json_encode([
            "success" => true, 
            "message" => "Order delivered successfully!",
            "order_id" => $data->order_id,
            "rider_id" => $data->rider_id,
            "payment_status" => "Paid"
        ]);

    } catch (PDOException $e) {
        if ($db->inTransaction()) {
            $db->rollBack();
        }
        echo json_encode(["success" => false, "message" => "Database Error: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Incomplete details provided. order_id and rider_id are required."]);
}
?>