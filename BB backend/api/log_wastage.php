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
    $action = !empty($data->action) ? trim($data->action) : 'report_kitchen_burn';
    $order_id = !empty($data->order_id) ? intval($data->order_id) : 0;
    $reported_by = !empty($data->reported_by) ? trim($data->reported_by) : 'Staff';
    $reason = !empty($data->reason) ? trim($data->reason) : 'Food loss reported';
    $notes = !empty($data->notes) ? trim($data->notes) : '';

    if ($order_id <= 0) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Valid Order ID is required."]);
        exit();
    }

    // 1. Fetch order details & items
    $orderStmt = $db->prepare("SELECT id, status, total_price, customer_name FROM orders WHERE id = ?");
    $orderStmt->execute([$order_id]);
    $order = $orderStmt->fetch(PDO::FETCH_ASSOC);

    if (!$order) {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "Order #{$order_id} not found."]);
        exit();
    }

    $itemsStmt = $db->prepare("SELECT id, title, size, quantity, addons_json FROM order_items WHERE order_id = ?");
    $itemsStmt->execute([$order_id]);
    $orderItems = $itemsStmt->fetchAll(PDO::FETCH_ASSOC);

    // Fetch recipes & inventory pricing
    $recipeStmt = $db->query("
        SELECT r.menu_id, r.variant_name, r.inventory_id, r.quantity, m.name as menu_name,
               i.name as inventory_name, i.unit as inventory_unit, i.price as unit_cost
        FROM menu_recipes r
        JOIN menu_items m ON r.menu_id = m.id
        JOIN inventory i ON r.inventory_id = i.id
    ");
    $recipes = $recipeStmt->fetchAll(PDO::FETCH_ASSOC);
    $recipesMap = [];
    foreach ($recipes as $r) {
        $key = strtolower(trim($r['menu_name'])) . '_' . strtolower(trim($r['variant_name']));
        $recipesMap[$key][] = $r;
    }

    // Fetch addons & inventory pricing
    $addonStmt = $db->query("
        SELECT p.id, p.title, p.inventory_id, p.qty_to_deduct,
               i.name as inventory_name, i.unit as inventory_unit, i.price as unit_cost
        FROM product_custom_addons p
        JOIN inventory i ON p.inventory_id = i.id
    ");
    $addons = $addonStmt->fetchAll(PDO::FETCH_ASSOC);
    $addonsMap = [];
    foreach ($addons as $a) {
        $addonsMap[strtolower(trim($a['title']))] = $a;
    }

    $db->beginTransaction();

    $wastageInserts = [];
    $totalLostCost = 0.0;

    $stage = 'kitchen';
    $notifType = 'remake';
    $notifTitle = "Kitchen Remake for Order #{$order_id}";

    if ($action === 'report_delivery_failure') {
        $stage = 'rider';
        $notifType = 'delivery_failed';
        $notifTitle = "Delivery Failed - Order #{$order_id}";

        // Update order status to delivery_failed
        $updOrder = $db->prepare("UPDATE orders SET status = 'delivery_failed' WHERE id = ?");
        $updOrder->execute([$order_id]);
    } elseif ($action === 'report_cashier_wastage') {
        $stage = 'cashier';
        $notifType = 'wastage';
        $notifTitle = "Mid-Prep Cancellation Loss - Order #{$order_id}";

        $updOrder = $db->prepare("UPDATE orders SET status = 'cancelled_with_wastage' WHERE id = ?");
        $updOrder->execute([$order_id]);
    } else {
        // Kitchen remake
        $stage = 'kitchen';
        $notifType = 'remake';
        $notifTitle = "Kitchen Burn / Remake - Order #{$order_id}";
    }

    $wastageStmt = $db->prepare("
        INSERT INTO inventory_wastage (order_id, inventory_id, quantity, unit, cost_lost, stage, reported_by, reason, is_verified)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
    ");

    foreach ($orderItems as $item) {
        $itemQty = intval($item['quantity'] ?: 1);
        $title = trim($item['title']);
        $size = trim($item['size'] ?: 'Regular');
        $key = strtolower($title) . '_' . strtolower($size);

        // Recipe items
        if (isset($recipesMap[$key])) {
            foreach ($recipesMap[$key] as $ing) {
                $invId = intval($ing['inventory_id']);
                $qty = floatval($ing['quantity']) * $itemQty;
                $unitCost = floatval($ing['unit_cost'] ?: 0.0);
                $costLost = $qty * $unitCost;

                $totalLostCost += $costLost;
                $wastageStmt->execute([
                    $order_id,
                    $invId,
                    $qty,
                    $ing['inventory_unit'] ?: 'g',
                    $costLost,
                    $stage,
                    $reported_by,
                    $reason
                ]);
                $wastageInserts[] = [
                    'inventory_name' => $ing['inventory_name'],
                    'qty' => $qty,
                    'unit' => $ing['inventory_unit'],
                    'cost_lost' => $costLost
                ];
            }
        }

        // Custom add-ons
        if (!empty($item['addons_json'])) {
            $parsedAddons = json_decode($item['addons_json'], true);
            if (is_array($parsedAddons)) {
                foreach ($parsedAddons as $addObj) {
                    $addTitle = strtolower(trim($addObj['title'] ?? ($addObj['name'] ?? '')));
                    if (isset($addonsMap[$addTitle])) {
                        $addMatch = $addonsMap[$addTitle];
                        $invId = intval($addMatch['inventory_id']);
                        $qty = floatval($addMatch['qty_to_deduct'] ?: 1.0) * $itemQty;
                        $unitCost = floatval($addMatch['unit_cost'] ?: 0.0);
                        $costLost = $qty * $unitCost;

                        $totalLostCost += $costLost;
                        $wastageStmt->execute([
                            $order_id,
                            $invId,
                            $qty,
                            $addMatch['inventory_unit'] ?: 'g',
                            $costLost,
                            $stage,
                            $reported_by,
                            $reason
                        ]);
                        $wastageInserts[] = [
                            'inventory_name' => $addMatch['inventory_name'],
                            'qty' => $qty,
                            'unit' => $addMatch['inventory_unit'],
                            'cost_lost' => $costLost
                        ];
                    }
                }
            }
        }
    }

    // Insert staff notification
    $notifMsg = "{$reported_by} reported {$reason} for Order #{$order_id}. Estimated raw material loss: Rs " . number_format($totalLostCost, 2);
    if ($notes) {
        $notifMsg .= " (Notes: {$notes})";
    }

    $notifStmt = $db->prepare("
        INSERT INTO staff_notifications (type, title, message, order_id, is_read)
        VALUES (?, ?, ?, ?, 0)
    ");
    $notifStmt->execute([$notifType, $notifTitle, $notifMsg, $order_id]);

    $db->commit();

    echo json_encode([
        "success" => true,
        "message" => "Wastage and staff alert logged successfully.",
        "order_id" => $order_id,
        "stage" => $stage,
        "total_cost_lost" => $totalLostCost,
        "records_logged" => count($wastageInserts),
        "details" => $wastageInserts
    ]);
} catch (Exception $e) {
    if (isset($db) && $db->inTransaction()) {
        $db->rollBack();
    }
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Failed to log wastage: " . $e->getMessage()
    ]);
}
?>
