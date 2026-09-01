<?php
require_once __DIR__ . '/../config/cors_headers.php';
require_once __DIR__ . '/../config/Database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        throw new Exception("Unable to connect to database.");
    }

    $data = json_decode(file_get_contents("php://input"));
    $order_id = !empty($data->order_id) ? intval($data->order_id) : (!empty($data->id) ? intval($data->id) : 0);
    $is_staff_override = !empty($data->is_staff_override);
    $cancel_reason = !empty($data->reason) ? trim($data->reason) : 'Customer cancelled within window';

    if ($order_id <= 0) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Valid order ID is required."]);
        exit();
    }

    // 1. Fetch order status and created_at
    $orderStmt = $db->prepare("SELECT id, status, created_at, total_price, customer_name, customer_phone FROM orders WHERE id = ?");
    $orderStmt->execute([$order_id]);
    $order = $orderStmt->fetch(PDO::FETCH_ASSOC);

    if (!$order) {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "Order not found."]);
        exit();
    }

    $currentStatus = strtolower(trim($order['status']));
    $createdTime = strtotime($order['created_at']);
    $currentTime = time();
    $elapsedSeconds = $currentTime - $createdTime;

    // Strict validation:
    // If not staff override, customer can only cancel if status is 'pending' AND elapsed <= 120s (with a slight 15s grace margin for network lag = 135s)
    if (!$is_staff_override) {
        if ($currentStatus !== 'pending') {
            http_response_code(400);
            echo json_encode([
                "success" => false,
                "message" => "Chef has already started preparation. Please call restaurant support to modify or cancel."
            ]);
            exit();
        }

        if ($elapsedSeconds > 135) {
            http_response_code(400);
            echo json_encode([
                "success" => false,
                "message" => "The 2-minute cancellation window has expired. Kitchen is already prepping your order."
            ]);
            exit();
        }
    }

    $db->beginTransaction();

    // 2. Fetch order items to calculate inventory restoration
    $itemsStmt = $db->prepare("SELECT id, title, size, quantity, addons_json FROM order_items WHERE order_id = ?");
    $itemsStmt->execute([$order_id]);
    $orderItems = $itemsStmt->fetchAll(PDO::FETCH_ASSOC);

    // Fetch all recipes
    $recipeStmt = $db->query("
        SELECT r.menu_id, r.variant_name, r.inventory_id, r.quantity, m.name as menu_name 
        FROM menu_recipes r
        JOIN menu_items m ON r.menu_id = m.id
    ");
    $recipes = $recipeStmt->fetchAll(PDO::FETCH_ASSOC);
    $recipesMap = [];
    foreach ($recipes as $r) {
        $key = strtolower(trim($r['menu_name'])) . '_' . strtolower(trim($r['variant_name']));
        $recipesMap[$key][] = $r;
    }

    // Fetch custom addons catalog
    $addonStmt = $db->query("SELECT id, menu_item_id, title, inventory_id, qty_to_deduct FROM product_custom_addons");
    $addonsCatalog = $addonStmt->fetchAll(PDO::FETCH_ASSOC);
    $addonsMap = [];
    foreach ($addonsCatalog as $a) {
        $addonsMap[strtolower(trim($a['title']))] = $a;
    }

    $restorations = [];

    foreach ($orderItems as $item) {
        $itemQty = intval($item['quantity'] ?: 1);
        $title = trim($item['title']);
        $size = trim($item['size'] ?: 'Regular');
        $key = strtolower($title) . '_' . strtolower($size);

        // A. Restore recipe ingredients
        if (isset($recipesMap[$key])) {
            foreach ($recipesMap[$key] as $ing) {
                $invId = intval($ing['inventory_id']);
                $qty = floatval($ing['quantity']) * $itemQty;
                if (!isset($restorations[$invId])) $restorations[$invId] = 0;
                $restorations[$invId] += $qty;
            }
        }

        // B. Restore custom addons
        if (!empty($item['addons_json'])) {
            $parsedAddons = json_decode($item['addons_json'], true);
            if (is_array($parsedAddons)) {
                foreach ($parsedAddons as $addObj) {
                    $invId = !empty($addObj['inventory_id']) ? intval($addObj['inventory_id']) : 0;
                    $deductQty = !empty($addObj['qty_to_deduct']) ? floatval($addObj['qty_to_deduct']) : (!empty($addObj['qty']) ? floatval($addObj['qty']) : 1.0);

                    if ($invId <= 0) {
                        $addTitle = strtolower(trim($addObj['title'] ?? ($addObj['name'] ?? '')));
                        if (isset($addonsMap[$addTitle])) {
                            $invId = intval($addonsMap[$addTitle]['inventory_id']);
                            if ($deductQty <= 0) $deductQty = floatval($addonsMap[$addTitle]['qty_to_deduct'] ?: 1.0);
                        }
                    }

                    if ($invId > 0) {
                        $totalRestore = $deductQty * $itemQty;
                        if (!isset($restorations[$invId])) $restorations[$invId] = 0;
                        $restorations[$invId] += $totalRestore;
                    }
                }
            }
        }
    }

    // 3. Update stock in inventory
    $restoreStmt = $db->prepare("UPDATE inventory SET stock = stock + :qty WHERE id = :id");
    foreach ($restorations as $invId => $restoreQty) {
        if ($restoreQty > 0) {
            $restoreStmt->execute([
                ':qty' => $restoreQty,
                ':id'  => $invId
            ]);
        }
    }

    // 4. Update order status
    $newStatus = 'cancelled';
    $updateOrderStmt = $db->prepare("UPDATE orders SET status = ?, cancel_reason = ? WHERE id = ?");
    // Check if cancel_reason column exists, otherwise fallback
    try {
        $updateOrderStmt->execute([$newStatus, $cancel_reason, $order_id]);
    } catch (Exception $colErr) {
        $fallbackStmt = $db->prepare("UPDATE orders SET status = ? WHERE id = ?");
        $fallbackStmt->execute([$newStatus, $order_id]);
    }

    // 5. Insert staff notification
    $notifStmt = $db->prepare("
        INSERT INTO staff_notifications (type, title, message, order_id, is_read)
        VALUES ('cancellation', ?, ?, ?, 0)
    ");
    $notifTitle = "Order #{$order_id} Cancelled";
    $notifMsg = "Order #{$order_id} was cancelled ({$cancel_reason}). Inventory stock was automatically restored.";
    $notifStmt->execute([$notifTitle, $notifMsg, $order_id]);

    $db->commit();

    echo json_encode([
        "success" => true,
        "message" => "Order #{$order_id} cancelled successfully. Inventory restored.",
        "order_id" => $order_id,
        "status" => "cancelled",
        "items_restored" => count($restorations)
    ]);
} catch (Exception $e) {
    if (isset($db) && $db->inTransaction()) {
        $db->rollBack();
    }
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Failed to cancel order: " . $e->getMessage()
    ]);
}
?>
