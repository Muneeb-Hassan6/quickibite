<?php
require_once __DIR__ . '/../config/cors_headers.php';
require_once __DIR__ . '/../config/Database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        throw new Exception("Database connection failed.");
    }

    $data = json_decode(file_get_contents('php://input'), true);
    $code = trim($data['code'] ?? '');
    $subtotal = floatval($data['subtotal'] ?? 0);

    if (empty($code)) {
        echo json_encode(['success' => false, 'message' => 'Please enter a promo code.']);
        exit();
    }

    $stmt = $db->prepare("SELECT * FROM coupons WHERE BINARY code = :code AND is_active = 1 LIMIT 1");
    $stmt->execute([':code' => $code]);
    $coupon = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$coupon) {
        echo json_encode(['success' => false, 'message' => 'Invalid or expired promo code.']);
        exit();
    }

    if (!empty($coupon['expiry_date']) && strtotime($coupon['expiry_date']) < time()) {
        echo json_encode(['success' => false, 'message' => 'This promo code has expired.']);
        exit();
    }

    if (!is_null($coupon['usage_limit']) && intval($coupon['times_used']) >= intval($coupon['usage_limit'])) {
        echo json_encode(['success' => false, 'message' => 'This promo code usage limit has been reached.']);
        exit();
    }

    if ($subtotal < floatval($coupon['min_spend'])) {
        echo json_encode([
            'success' => false, 
            'message' => 'Minimum order amount for this code is Rs. ' . number_format($coupon['min_spend'], 0)
        ]);
        exit();
    }

    $discount = 0.00;
    if ($coupon['discount_type'] === 'percentage') {
        $discount = ($subtotal * floatval($coupon['discount_value'])) / 100;
        if (!empty($coupon['max_discount']) && $discount > floatval($coupon['max_discount'])) {
            $discount = floatval($coupon['max_discount']);
        }
    } else {
        $discount = floatval($coupon['discount_value']);
    }

    // Ensure discount does not exceed subtotal
    $discount = min($discount, $subtotal);

    echo json_encode([
        'success' => true,
        'code' => $coupon['code'],
        'discount_type' => $coupon['discount_type'],
        'discount_value' => floatval($coupon['discount_value']),
        'discount_amount' => round($discount, 2),
        'message' => 'Promo code applied successfully!'
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>
