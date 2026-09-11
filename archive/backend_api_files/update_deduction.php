<?php
include_once __DIR__ . '/../config/cors_headers.php';
include_once __DIR__ . '/../config/auth_middleware.php';
require_role(['Admin', 'Manager']);
include_once '../config/Database.php';
$database = new Database();
$db = $database->getConnection();
$data = json_decode(file_get_contents("php://input"));

if(isset($data->rate)) {
    try {
        $stmt = $db->prepare("UPDATE settings SET setting_value = :rate WHERE setting_key = 'daily_deduction'");
        $stmt->execute([':rate' => $data->rate]);
        echo json_encode(["success" => true, "message" => "Rate updated!"]);
    } catch(PDOException $e) {
        echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Rate not provided."]);
}
?>