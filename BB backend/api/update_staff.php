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
        $username = isset($data->username) && trim((string)$data->username) !== '' ? trim((string)$data->username) : null;
        if ($username !== null) {
            $check_user = $db->prepare("SELECT id FROM staff WHERE username = :username AND id != :id");
            $check_user->execute([':username' => $username, ':id' => $data->id]);
            if ($check_user->fetch()) {
                echo json_encode(["success" => false, "message" => "This username is already taken by another staff member!"]);
                exit();
            }
        }

        $query = "UPDATE staff SET name = :name, role = :role, status = :status, phone = :phone, salary = :salary, username = :username WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":name", $data->name);
        $stmt->bindParam(":role", $data->role);
        $status = $data->status ?? 'Active';
        $stmt->bindParam(":status", $status);
        $stmt->bindParam(":phone", $data->phone);
        $stmt->bindParam(":salary", $data->salary);
        $stmt->bindParam(":username", $username);
        $stmt->bindParam(":id", $data->id);
        
        $stmt->execute();
        
        if (isset($data->password) && trim((string)$data->password) !== '') {
            $rawPassword = trim((string)$data->password);

            if (strlen($rawPassword) < 8) {
                echo json_encode(["success" => false, "message" => "New password must be at least 8 characters long."]);
                exit();
            }
            if (!preg_match('/[A-Z]/', $rawPassword)) {
                echo json_encode(["success" => false, "message" => "New password must contain at least one capital letter (A-Z)."]);
                exit();
            }
            if (!preg_match('/[!@#$%^&*(),.?":{}|<>]/', $rawPassword)) {
                echo json_encode(["success" => false, "message" => "New password must contain at least one special character."]);
                exit();
            }
            if (isset($data->confirm_password) && $rawPassword !== trim((string)$data->confirm_password)) {
                echo json_encode(["success" => false, "message" => "New password and confirm password do not match."]);
                exit();
            }

            $hashed_password = password_hash($rawPassword, PASSWORD_DEFAULT);
            $pass_query = "UPDATE staff SET password = :password WHERE id = :id";
            $pass_stmt = $db->prepare($pass_query);
            $pass_stmt->bindParam(":password", $hashed_password);
            $pass_stmt->bindParam(":id", $data->id);
            $pass_stmt->execute();
        }

        echo json_encode(["success" => true, "message" => "Staff member updated successfully."]);
    } catch(PDOException $e) {
        if ($e->getCode() == 23000) {
            echo json_encode(["success" => false, "message" => "This username is already taken!"]);
        } else {
            echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
        }
    }
} else {
    echo json_encode(["success" => false, "message" => "Incomplete data provided."]);
}
?>