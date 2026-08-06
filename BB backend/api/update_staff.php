<?php
include_once __DIR__ . '/../config/cors_headers.php';
include_once __DIR__ . '/../config/auth_middleware.php';
require_role(['Admin', 'Manager']);
include_once __DIR__ . '/../config/Database.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if(!empty($data->id) && !empty($data->name) && !empty($data->role)) {
    try {
        $query = "UPDATE staff SET name = :name, role = :role, status = :status, phone = :phone, salary = :salary WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":name", $data->name);
        $stmt->bindParam(":role", $data->role);
        $status = $data->status ?? 'Active';
        $stmt->bindParam(":status", $status);
        $stmt->bindParam(":phone", $data->phone);
        $stmt->bindParam(":salary", $data->salary);
        $stmt->bindParam(":id", $data->id);
        
        $stmt->execute();
        
        if (!empty($data->password)) {
            $hashed_password = password_hash($data->password, PASSWORD_DEFAULT);
            $pass_query = "UPDATE staff SET password = :password WHERE id = :id";
            $pass_stmt = $db->prepare($pass_query);
            $pass_stmt->bindParam(":password", $hashed_password);
            $pass_stmt->bindParam(":id", $data->id);
            $pass_stmt->execute();
        }

        echo json_encode(["success" => true, "message" => "Staff member updated successfully."]);
    } catch(PDOException $e) {
        echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Incomplete data provided."]);
}
?>