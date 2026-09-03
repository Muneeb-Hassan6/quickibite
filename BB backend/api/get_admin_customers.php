<?php
include_once __DIR__ . '/../config/cors_headers.php';
include_once __DIR__ . '/../config/auth_middleware.php';
require_role(['Admin', 'Manager']);
include_once __DIR__ . '/../config/Database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data) {
        $data = $_POST;
    }

    $cid = (int)($data['customer_id'] ?? ($data['id'] ?? 0));
    $status = isset($data['is_active']) ? (int)$data['is_active'] : 1;

    if (!$cid) {
        echo json_encode(['success' => false, 'message' => 'Customer ID is required.']);
        exit();
    }

    try {
        $stmt = $db->prepare("UPDATE customer_users SET is_active = :st WHERE id = :id");
        $stmt->execute([':st' => $status, ':id' => $cid]);
        echo json_encode(['success' => true, 'message' => 'Customer status updated successfully!']);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error updating customer: ' . $e->getMessage()]);
    }
    exit();
}

try {
    $query = "SELECT u.id, u.full_name, u.phone, u.email, u.avatar_url, u.google_id, u.is_active, u.created_at,
              COUNT(o.id) AS total_orders,
              COALESCE(SUM(o.total), 0) AS lifetime_spend,
              MAX(o.created_at) AS last_order_at
              FROM customer_users u
              LEFT JOIN orders o ON u.id = o.customer_id
              GROUP BY u.id
              ORDER BY u.id DESC";
    $stmt = $db->query($query);
    $customers = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Fetch total summary stats
    $totalCustomers = count($customers);
    $activeCustomers = 0;
    $totalRevenue = 0;
    foreach ($customers as $c) {
        if ((int)$c['is_active'] === 1) $activeCustomers++;
        $totalRevenue += floatval($c['lifetime_spend']);
    }

    echo json_encode([
        'success' => true,
        'customers' => $customers,
        'stats' => [
            'total_customers' => $totalCustomers,
            'active_customers' => $activeCustomers,
            'blocked_customers' => $totalCustomers - $activeCustomers,
            'total_revenue' => $totalRevenue
        ]
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'CRM Query Error: ' . $e->getMessage()]);
}
