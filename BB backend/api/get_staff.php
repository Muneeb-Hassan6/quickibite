<?php
include_once __DIR__ . '/../config/cors_headers.php';

include_once __DIR__ . '/../config/auth_middleware.php';
require_role(['Admin', 'Manager', 'Dispatcher']);

include_once '../config/Database.php';
$database = new Database();
$db = $database->getConnection();

try {
    $query = "SELECT s.id, s.name, s.role, s.phone, s.salary, s.status, s.shift_status, s.username, s.shift, s.hire_date AS created_at,
                     r.vehicle, r.lat, r.lng, r.trips_completed, r.license_number 
              FROM staff s 
              LEFT JOIN rider r ON s.id = r.staff_id
              ORDER BY s.id DESC";
              
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $staff = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode(["success" => true, "data" => $staff]);
} catch(PDOException $e) {
    echo json_encode(["success" => false, "message" => "Database Error: " . $e->getMessage()]);
}
?>