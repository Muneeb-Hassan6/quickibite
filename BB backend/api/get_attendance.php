<?php
include_once __DIR__ . '/../config/cors_headers.php';

include_once '../config/Database.php';
$database = new Database();
$db = $database->getConnection();

try {
    // Current month ki report nikalne ki query
    $query = "SELECT 
                s.id, 
                s.name, 
                SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) as present,
                SUM(CASE WHEN a.status = 'Absent' THEN 1 ELSE 0 END) as absent,
                SUM(CASE WHEN a.status = 'Late' THEN 1 ELSE 0 END) as late
              FROM staff s
              LEFT JOIN attendance a ON s.id = a.staff_id AND MONTH(a.date) = MONTH(CURRENT_DATE()) AND YEAR(a.date) = YEAR(CURRENT_DATE())
              GROUP BY s.id, s.name";

    $stmt = $db->prepare($query);
    $stmt->execute();
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["success" => true, "data" => $results]);

} catch(PDOException $e) {
    echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
}
?>