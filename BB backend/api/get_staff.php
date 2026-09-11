<?php
include_once __DIR__ . '/../config/cors_headers.php';

include_once __DIR__ . '/../config/auth_middleware.php';
require_role(['Admin', 'Manager', 'Dispatcher']);

include_once __DIR__ . '/../config/Database.php';
$database = new Database();
$db = $database->getConnection();

try {
    $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 0;
    $offset = isset($_GET['offset']) ? max(0, intval($_GET['offset'])) : 0;

    $totalStmt = $db->query("SELECT COUNT(*) FROM staff");
    $total_count = intval($totalStmt->fetchColumn());

    $limitSql = "";
    if ($limit > 0) {
        $limitSql = " LIMIT " . intval($limit) . " OFFSET " . intval($offset);
    }

    $query = "SELECT s.id, s.name, s.role, s.phone, s.salary, s.status, s.shift_status, s.username, s.shift, s.hire_date AS created_at,
                     r.vehicle, r.lat, r.lng, r.trips_completed, r.license_number 
              FROM staff s 
              LEFT JOIN rider r ON s.id = r.staff_id
              ORDER BY s.id DESC" . $limitSql;
              
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $staff = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $has_more = ($limit > 0) ? (($offset + count($staff)) < $total_count) : false;
    
    echo json_encode([
        "success" => true, 
        "data" => $staff,
        "total" => $total_count,
        "has_more" => $has_more,
        "limit" => $limit,
        "offset" => $offset
    ]);
} catch(PDOException $e) {
    echo json_encode(["success" => false, "message" => "Database Error: " . $e->getMessage()]);
}
?>