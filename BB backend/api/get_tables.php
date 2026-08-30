<?php
require_once __DIR__ . '/../config/cors_headers.php';
require_once __DIR__ . '/../config/Database.php';

header("Content-Type: application/json; charset=UTF-8");

if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    $database = new Database();
    $db = $database->getConnection();

    // Check if restaurant_tables or tables exists
    $tables = [];
    try {
        $stmt = $db->query("SELECT id, table_name, status FROM restaurant_tables WHERE status = 1 OR status = 'available' OR status = 'Active' ORDER BY id ASC");
        $tables = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (Exception $e1) {
        try {
            $stmt = $db->query("SELECT * FROM tables WHERE status = 'available' OR status = 1 ORDER BY id ASC");
            $tables = $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e2) {
            $tables = [];
        }
    }

    echo json_encode([
        "status" => "success",
        "success" => true,
        "data" => $tables ?: []
    ]);
} catch (Exception $e) {
    echo json_encode([
        "status" => "error",
        "success" => false,
        "message" => $e->getMessage(),
        "data" => []
    ]);
}
exit();
