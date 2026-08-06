<?php
include_once __DIR__ . '/../config/cors_headers.php';
include_once __DIR__ . '/../config/auth_middleware.php';
include_once '../config/Database.php';
$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (isset($data->id) && isset($data->is_active)) {
    try {
        $query = "UPDATE deals SET is_active = :status WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->execute([':status' => $data->is_active, ':id' => $data->id]);
        echo json_encode(["success" => true, "message" => "Status Updated!"]);
    } catch(PDOException $e) {
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
}
?>