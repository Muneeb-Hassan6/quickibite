<?php
include_once __DIR__ . '/../config/cors_headers.php';

include_once '../config/Database.php';
$database = new Database();
$db = $database->getConnection();

try {
    $stmt = $db->query("SELECT setting_key, setting_value FROM settings");
    $settings = [];
    
    // Array ko format kar rahe hain taake React mein easily use ho
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $settings[$row['setting_key']] = $row['setting_value'];
    }

    echo json_encode(["success" => true, "data" => $settings]);
} catch(PDOException $e) {
    echo json_encode(["success" => false, "message" => "Database Error: " . $e->getMessage()]);
}
?>