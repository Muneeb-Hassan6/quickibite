<?php
include_once __DIR__ . '/../config/cors_headers.php';

include_once '../config/Database.php';

$database = new Database();
$db = $database->getConnection();
$data = json_decode(file_get_contents("php://input"));

if(!empty($data->phone) && !empty($data->password)) {
    // 🔥 FIX: Sirf 'role' column check karega, designation hata diya hai
    $query = "SELECT id, name, phone, vehicle, trips_completed FROM staff 
              WHERE phone = :phone AND password = :password 
              AND LOWER(role) = 'rider'";
              
    $stmt = $db->prepare($query);
    $stmt->bindParam(":phone", $data->phone);
    $stmt->bindParam(":password", $data->password); 
    $stmt->execute();

    if($stmt->rowCount() > 0) {
        $rider = $stmt->fetch(PDO::FETCH_ASSOC);
        echo json_encode(["success" => true, "rider" => $rider, "message" => "Login successful"]);
    } else {
        echo json_encode(["success" => false, "message" => "Invalid phone/password or not a rider."]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Incomplete data."]);
}
?>