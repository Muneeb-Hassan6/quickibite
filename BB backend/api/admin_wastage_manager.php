<?php
require_once __DIR__ . '/../config/cors_headers.php';
require_once __DIR__ . '/../config/Database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        throw new Exception("Database connection failed.");
    }

    $data = json_decode(file_get_contents("php://input"));
    $action = $_GET['action'] ?? ($data->action ?? 'get_notifications');

    // 1. GET NOTIFICATIONS
    if ($action === 'get_notifications') {
        $stmt = $db->query("
            SELECT id, type, title, message, order_id, is_read, created_at
            FROM staff_notifications
            ORDER BY created_at DESC
            LIMIT 30
        ");
        $notifs = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $unreadStmt = $db->query("SELECT COUNT(*) as unread_count FROM staff_notifications WHERE is_read = 0");
        $unreadCount = intval($unreadStmt->fetch(PDO::FETCH_ASSOC)['unread_count'] ?? 0);

        echo json_encode([
            "success" => true,
            "unread_count" => $unreadCount,
            "notifications" => $notifs
        ]);
        exit();
    }

    // 2. MARK NOTIFICATIONS READ
    if ($action === 'mark_notifications_read') {
        $notifId = !empty($data->id) ? intval($data->id) : 0;
        if ($notifId > 0) {
            $stmt = $db->prepare("UPDATE staff_notifications SET is_read = 1 WHERE id = ?");
            $stmt->execute([$notifId]);
        } else {
            $db->exec("UPDATE staff_notifications SET is_read = 1");
        }

        echo json_encode(["success" => true, "message" => "Notifications marked as read."]);
        exit();
    }

    // 3. GET WASTAGE LOGS
    if ($action === 'get_wastage_logs') {
        $stmt = $db->query("
            SELECT w.id, w.order_id, w.inventory_id, w.quantity, w.unit, w.cost_lost,
                   w.stage, w.reported_by, w.reason, w.is_verified, w.verified_by, w.created_at,
                   i.name as inventory_name, i.price as item_unit_price
            FROM inventory_wastage w
            JOIN inventory i ON w.inventory_id = i.id
            ORDER BY w.created_at DESC
            LIMIT 100
        ");
        $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(["success" => true, "logs" => $logs]);
        exit();
    }

    // 4. VERIFY AUDIT LOG
    if ($action === 'verify_wastage') {
        $logId = !empty($data->id) ? intval($data->id) : 0;
        $verifiedBy = !empty($data->verified_by) ? trim($data->verified_by) : 'Admin';

        if ($logId <= 0) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Valid log ID required."]);
            exit();
        }

        $stmt = $db->prepare("UPDATE inventory_wastage SET is_verified = 1, verified_by = ? WHERE id = ?");
        $stmt->execute([$verifiedBy, $logId]);

        echo json_encode(["success" => true, "message" => "Wastage audit verified successfully."]);
        exit();
    }

    // 5. GET WASTAGE ANALYTICS SUMMARY
    if ($action === 'get_wastage_analytics') {
        // Today's total lost cost
        $todayStmt = $db->query("
            SELECT COALESCE(SUM(cost_lost), 0) as today_lost
            FROM inventory_wastage
            WHERE DATE(created_at) = CURDATE()
        ");
        $todayLost = floatval($todayStmt->fetch(PDO::FETCH_ASSOC)['today_lost'] ?? 0);

        // Pending audits count
        $pendingStmt = $db->query("
            SELECT COUNT(*) as pending_count
            FROM inventory_wastage
            WHERE is_verified = 0
        ");
        $pendingCount = intval($pendingStmt->fetch(PDO::FETCH_ASSOC)['pending_count'] ?? 0);

        // Top wasted item
        $topStmt = $db->query("
            SELECT i.name, SUM(w.quantity) as total_qty, w.unit, SUM(w.cost_lost) as total_cost
            FROM inventory_wastage w
            JOIN inventory i ON w.inventory_id = i.id
            GROUP BY w.inventory_id
            ORDER BY total_cost DESC
            LIMIT 1
        ");
        $topItem = $topStmt->fetch(PDO::FETCH_ASSOC);

        // Stage breakdown
        $stageStmt = $db->query("
            SELECT stage, COUNT(*) as report_count, COALESCE(SUM(cost_lost), 0) as total_cost
            FROM inventory_wastage
            GROUP BY stage
        ");
        $stageBreakdown = $stageStmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            "success" => true,
            "today_lost_cost" => $todayLost,
            "pending_audits" => $pendingCount,
            "top_wasted_item" => $topItem ?: ["name" => "None", "total_cost" => 0, "total_qty" => 0],
            "stage_breakdown" => $stageBreakdown
        ]);
        exit();
    }

    echo json_encode(["success" => false, "message" => "Invalid action."]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
