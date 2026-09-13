<?php
include_once __DIR__ . '/../config/cors_headers.php';
include_once __DIR__ . '/../config/auth_middleware.php';
require_role(['Admin', 'Manager']);
include_once __DIR__ . '/../config/Database.php';

$database = new Database();
$db = $database->getConnection();
$data = json_decode(file_get_contents("php://input"));

// 🔥 Validation: Check if required fields exist
if(isset($data->name) && isset($data->role) && isset($data->phone) && isset($data->salary)) {
    
    // Check for empty spaces
    if(trim($data->name) === '' || trim($data->phone) === '' || trim((string)$data->salary) === '') {
        echo json_encode(["success" => false, "message" => "Fields cannot be blank spaces."]);
        exit();
    }

    // 🔥 Strong Password Validation
    if (!empty($data->password)) {
        $rawPassword = (string)$data->password;
        if (strlen($rawPassword) < 8) {
            echo json_encode(["success" => false, "message" => "Password must be at least 8 characters long."]);
            exit();
        }
        if (!preg_match('/[A-Z]/', $rawPassword)) {
            echo json_encode(["success" => false, "message" => "Password must contain at least one capital letter (A-Z)."]);
            exit();
        }
        if (!preg_match('/[!@#$%^&*(),.?":{}|<>]/', $rawPassword)) {
            echo json_encode(["success" => false, "message" => "Password must contain at least one special character."]);
            exit();
        }
        if (isset($data->confirm_password) && $rawPassword !== (string)$data->confirm_password) {
            echo json_encode(["success" => false, "message" => "Password and confirm password do not match."]);
            exit();
        }
    }

    try {
        // 🔥 Transaction Start (Dono tables me data ikatha safe tarikay se jayega)
        $db->beginTransaction(); 

        $username = !empty($data->username) ? trim($data->username) : null;
        $password = !empty($data->password) ? password_hash($data->password, PASSWORD_DEFAULT) : null;

        // 1. Pehli entry Staff Table me (Main Data)
        $query1 = "INSERT INTO staff (name, role, phone, salary, status, shift_status, username, password, shift) 
                   VALUES (:name, :role, :phone, :salary, 'Active', 'Offline', :username, :password, 'Morning')";
        
        $stmt1 = $db->prepare($query1);
        $stmt1->execute([
            ':name' => trim($data->name),
            ':role' => trim($data->role),
            ':phone' => trim($data->phone),
            ':salary' => $data->salary,
            ':username' => $username,
            ':password' => $password
        ]);
        
        // 🔥 Naye add hone wale staff ki ID nikal li
        $staff_id = $db->lastInsertId(); 

        // 2. Agar banda Rider hy, toh uski extra details Rider Table me dalo
        if(trim($data->role) === 'Rider') {
            
            // Frontend se aanay wali nayi fields ko catch kiya
            $bike_number = !empty($data->bike_number) ? trim($data->bike_number) : 'Bike';
            $license_number = !empty($data->license_number) ? trim($data->license_number) : null;

            $query2 = "INSERT INTO rider (staff_id, vehicle, license_number, trips_completed) 
                       VALUES (:staff_id, :vehicle, :license_number, 0)";
            $stmt2 = $db->prepare($query2);
            $stmt2->execute([
                ':staff_id' => $staff_id,
                ':vehicle' => $bike_number,
                ':license_number' => $license_number
            ]);
        }

        // 3. Permanently save custom / assigned role in staff_roles table
        $assignedRole = trim($data->role);
        if (!empty($assignedRole)) {
            $db->exec("CREATE TABLE IF NOT EXISTS staff_roles (
                id INT AUTO_INCREMENT PRIMARY KEY,
                role_name VARCHAR(100) UNIQUE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

            $roleStmt = $db->prepare("INSERT IGNORE INTO staff_roles (role_name) VALUES (:role_name)");
            $roleStmt->execute([':role_name' => $assignedRole]);
        }

        // 🔥 Transaction Complete (Sab kuch perfect ho gaya toh Save kar do)
        $db->commit(); 

        echo json_encode(["success" => true, "message" => "New staff member added successfully."]);
        exit(); 
        
    } catch(PDOException $e) {
        // 🔥 Agar DB me koi error aya, toh aadhi adhuri entry delete kardo (Safe mode)
        $db->rollBack(); 
        
        if($e->getCode() == 23000) { 
            echo json_encode(["success" => false, "message" => "This username is already taken!"]);
        } else {
            echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
        }
        exit();
    }
} else {
    echo json_encode(["success" => false, "message" => "Incomplete details provided."]);
    exit();
}
?>