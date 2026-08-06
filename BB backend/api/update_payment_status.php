<?php
include_once __DIR__ . '/../config/cors_headers.php';
include_once __DIR__ . '/../config/auth_middleware.php';
include_once '../config/Database.php';
$database = new Database();
$db = $database->getConnection();
$data = json_decode(file_get_contents("php://input"));

// 🔥 'empty()' ki jagah 'isset()' lagaya hai aur Debugging add ki hai
if(isset($data->id) && isset($data->status) && $data->id !== "" && $data->status !== "") {
    try {
        $query = "UPDATE orders SET payment_status = :status WHERE id = :id";
        $stmt = $db->prepare($query);
        
        $stmt->bindParam(':status', $data->status);
        $stmt->bindParam(':id', $data->id);
        
        if($stmt->execute()) {
            echo json_encode(["success" => true, "message" => "Payment status updated successfully."]);
        } else {
            echo json_encode(["success" => false, "message" => "Failed to update payment status."]);
        }
    } catch(PDOException $e) {
        echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
    }
} else {
    // 🔥 DEBUGGING: Ab yeh batayega ke usko mila kya hai!
    echo json_encode([
        "success" => false, 
        "message" => "Order ID and status required.",
        "received_data" => $data // Yeh line humein masla bata degi
    ]);
}
?>