<?php
include_once __DIR__ . '/../config/cors_headers.php';
include_once __DIR__ . '/../config/auth_middleware.php';
require_role(['Admin', 'Manager']);
include_once '../config/Database.php';
$database = new Database();
$db = $database->getConnection();
$data = json_decode(file_get_contents("php://input"));

if(isset($data->staff_id) && isset($data->salary) && isset($data->absents) && isset($data->net_pay)) {
    try {
        $month = date('Y-m');
        $deduction = $data->salary - $data->net_pay;

        $stmt = $db->prepare("INSERT INTO payroll (staff_id, month, basic_salary, absents, deduction, net_pay) 
                              VALUES (:staff_id, :month, :salary, :absents, :deduction, :net_pay)");
        
        $stmt->execute([
            ':staff_id' => $data->staff_id,
            ':month' => $month,
            ':salary' => $data->salary,
            ':absents' => $data->absents,
            ':deduction' => $deduction,
            ':net_pay' => $data->net_pay
        ]);
        
        echo json_encode(["success" => true, "message" => "Salary paid successfully!"]);
    } catch(PDOException $e) {
        echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Incomplete data provided."]);
}
?>