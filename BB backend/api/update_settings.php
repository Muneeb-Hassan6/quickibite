<?php
include_once __DIR__ . '/../config/cors_headers.php';
include_once __DIR__ . '/../config/auth_middleware.php';
require_role(['Admin', 'Manager']);
include_once '../config/Database.php';

$database = new Database();
$db = $database->getConnection();

// Frontend se aane wala JSON data catch karein
$data = json_decode(file_get_contents("php://input"), true);

if ($data && is_array($data)) {
    try {
        $db->beginTransaction();

        $query = "INSERT INTO settings (setting_key, setting_value) VALUES (:key, :val) 
                  ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)";
        $stmt = $db->prepare($query);

        // Sirf wahi settings update/insert karein jo payload mein bheji gayi hain
        foreach ($data as $key => $value) {
            // Ignore extra frontend helper keys
            if (!in_array($key, ['old_logo', 'original_logo'])) {
                $valStr = is_bool($value) ? ($value ? 'true' : 'false') : (string)$value;
                $stmt->bindValue(':key', $key);
                $stmt->bindValue(':val', $valStr);
                $stmt->execute();
            }
        }

        $db->commit();

        echo json_encode([
            "success" => true, 
            "message" => "Settings updated successfully"
        ]);

    } catch(PDOException $e) {
        $db->rollBack();
        echo json_encode([
            "success" => false, 
            "message" => "Database Error: " . $e->getMessage()
        ]);
    }
} else {
    echo json_encode([
        "success" => false, 
        "message" => "Invalid or no data received"
    ]);
}
?>