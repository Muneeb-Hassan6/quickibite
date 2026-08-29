<?php
include_once __DIR__ . '/../config/cors_headers.php';
include_once __DIR__ . '/../config/auth_middleware.php';
require_role(['Admin', 'Manager', 'Cashier', 'Kitchen', 'Chef', 'Dispatcher', 'Rider']);
include_once __DIR__ . '/../config/Database.php';

$database = new Database();
$db = $database->getConnection();

if (!$db) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database connection failed"]);
    exit();
}

$data = json_decode(file_get_contents("php://input"));

$orderId = !empty($data->id) ? $data->id : (!empty($data->order_id) ? $data->order_id : null);

if (!empty($orderId) && !empty($data->status)) {
    try {
        $id = intval($orderId);
        $rawStatus = trim($data->status);

        // Normalize status string (capitalized word for DB, lowercase for client)
        $statusMap = [
            'pending' => 'Pending',
            'cooking' => 'Cooking',
            'preparing' => 'Cooking',
            'ready' => 'Ready',
            'dispatched' => 'Dispatched',
            'delivered' => 'Delivered',
            'completed' => 'Completed',
            'cancelled' => 'Cancelled',
            'declined' => 'Declined'
        ];

        $dbStatus = isset($statusMap[strtolower($rawStatus)]) ? $statusMap[strtolower($rawStatus)] : ucfirst($rawStatus);

        $query = "UPDATE orders SET status = :status WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->execute([
            ':status' => $dbStatus,
            ':id' => $id
        ]);

        echo json_encode([
            "success" => true,
            "message" => "Order #$id status updated to $dbStatus",
            "status" => $dbStatus,
            "id" => $id
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "message" => "Database Error: " . $e->getMessage()
        ]);
    }
} else {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Order ID and status are required."
    ]);
}
?>