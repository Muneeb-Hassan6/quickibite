<?php
include_once __DIR__ . '/../config/cors_headers.php';
include_once __DIR__ . '/../config/auth_middleware.php';
include_once __DIR__ . '/../config/Database.php';

$database = new Database();
$db = $database->getConnection();
$data = json_decode(file_get_contents("php://input"));

if(!empty($data->lat) && !empty($data->lng)) {
    // Prevent IDOR: target authenticated user's ID, allow override only for Admin/Dispatcher
    $target_id = $auth_user['user_id'];
    if (!empty($data->id) && $data->id != $auth_user['user_id']) {
        if (in_array(strtolower($auth_user['role']), ['admin', 'dispatcher'])) {
            $target_id = $data->id;
        } else {
            http_response_code(403);
            echo json_encode(["success" => false, "message" => "Unauthorized to update another user's location."]);
            exit();
        }
    }

    $query = "UPDATE staff SET lat = :lat, lng = :lng WHERE id = :id";
    $stmt = $db->prepare($query);
    
    $stmt->bindParam(":lat", $data->lat);
    $stmt->bindParam(":lng", $data->lng);
    $stmt->bindParam(":id", $target_id);

    if($stmt->execute()) {
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["success" => false]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Incomplete details."]);
}
?>