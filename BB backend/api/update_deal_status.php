<?php
include_once __DIR__ . '/../config/cors_headers.php';
include_once __DIR__ . '/../config/auth_middleware.php';
require_role(['Admin', 'Manager']);
include_once __DIR__ . '/../config/Database.php';

$database = new Database();
$db = $database->getConnection();

if (!$db) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database connection failed"]);
    exit();
}

$data = json_decode(file_get_contents("php://input"));

if (isset($data->id) && isset($data->is_active)) {
    try {
        $id = intval($data->id);
        $status = !empty($data->is_active) ? 1 : 0;

        $query = "UPDATE deals SET is_active = :status WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->execute([':status' => $status, ':id' => $id]);

        echo json_encode([
            "success" => true,
            "message" => "Deal status updated successfully",
            "is_active" => $status
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Database Error: " . $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Deal ID and is_active status are required."]);
}
?>