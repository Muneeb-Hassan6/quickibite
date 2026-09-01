<?php
require_once __DIR__ . '/../config/cors_headers.php';
require_once __DIR__ . '/../config/Database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        throw new Exception("Database connection failed.");
    }

    $stmt = $db->query("
        SELECT 
            id, 
            code, 
            discount_type, 
            discount_value, 
            min_spend, 
            max_discount, 
            usage_limit, 
            times_used, 
            expiry_date, 
            is_active, 
            created_at 
        FROM coupons 
        ORDER BY id DESC
    ");
    $coupons = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'data' => $coupons
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}
?>
