<?php
include_once __DIR__ . '/../config/cors_headers.php';
include_once __DIR__ . '/../config/auth_middleware.php';
include_once '../config/Database.php';
include_once '../models/Order.php';

$database = new Database();
$db = $database->getConnection();
$orderModel = new Order($db);

$data = json_decode(file_get_contents("php://input"));

if(!empty($data->id) && !empty($data->status)) {
    if($orderModel->updateStatus($data->id, $data->status)) {
        echo json_encode(["message" => "Status updated."]);
    } else {
        echo json_encode(["message" => "Failed to update."]);
    }
}
?>