<?php
include_once __DIR__ . '/../config/cors_headers.php';
include_once __DIR__ . '/../config/auth_middleware.php';
require_role(['Admin', 'Manager']);
include_once '../config/Database.php';
$database = new Database();
$db = $database->getConnection();

// Frontend se aane wala JSON data catch karein
$data = json_decode(file_get_contents("php://input"), true);

if ($data) {
    try {
        $db->beginTransaction();

        $query = "UPDATE settings SET setting_value = :value WHERE setting_key = :key";
        $stmt = $db->prepare($query);

        // Sirf wahi settings update karein jo payload mein bheji gayi hain
        foreach ($data as $key => $value) {
            // "old_logo" jaise extra keys jo database mein nahi hain, unhe ignore kar dein ya handle karein
            if ($key !== 'old_logo') {
                $stmt->bindParam(':value', $value);
                $stmt->bindParam(':key', $key);
                $stmt->execute();
            }
        }

        $db->commit();

        echo json_encode([
            "success" => true, 
            "message" => "Settings updated successfully"
        ]);

    } catch(PDOException $e) {
        // Agar masla aaya toh changes wapis reverse (rollback) kar do
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