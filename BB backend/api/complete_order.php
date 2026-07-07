<?php
include_once __DIR__ . '/../config/cors_headers.php';
include_once __DIR__ . '/../config/auth_middleware.php';
include_once '../config/Database.php';
$database = new Database();
$db = $database->getConnection();
$data = json_decode(file_get_contents("php://input"));

if (isset($data->order_id) && isset($data->rider_id)) {
    try {
        $db->beginTransaction();

        // 1. Order ko 'Delivered' mark karo
        $stmt1 = $db->prepare("UPDATE orders SET status = 'Delivered' WHERE id = :order_id");
        $stmt1->execute([':order_id' => $data->order_id]);

        // 2. Rider table me trips_completed +1 karo
        $stmt2 = $db->prepare("UPDATE rider SET trips_completed = trips_completed + 1 WHERE staff_id = :rider_id");
        $stmt2->execute([':rider_id' => $data->rider_id]);

        // 3. 🔥 FIX: Rider ko automatically 'Available' set karo taake dispatcher use dobara assign kar sake
        $stmt3 = $db->prepare("UPDATE staff SET shift_status = 'Available' WHERE id = :rider_id");
        $stmt3->execute([':rider_id' => $data->rider_id]);

        $db->commit();
        echo json_encode(["success" => true, "message" => "Order delivered successfully!"]);

    } catch (PDOException $e) {
        $db->rollBack();
        echo json_encode(["success" => false, "message" => "Database Error: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Incomplete details provided."]);
}
?>