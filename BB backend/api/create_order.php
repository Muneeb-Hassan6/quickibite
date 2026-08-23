<?php
include_once __DIR__ . '/../config/cors_headers.php';
include_once __DIR__ . '/../config/Database.php';

$database = new Database();
$db = $database->getConnection();

// ─── AUTO-MIGRATE: Ensure payment_method & payment_status columns exist ───
try {
    $checkCol = $db->prepare("SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                               WHERE TABLE_SCHEMA = DATABASE() 
                               AND TABLE_NAME = 'orders' 
                               AND COLUMN_NAME = 'payment_method'");
    $checkCol->execute();
    if ($checkCol->fetchColumn() == 0) {
        $db->exec("ALTER TABLE `orders` ADD COLUMN `payment_method` VARCHAR(50) NOT NULL DEFAULT 'cod' AFTER `status`");
    }

    $checkCol2 = $db->prepare("SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                                WHERE TABLE_SCHEMA = DATABASE() 
                                AND TABLE_NAME = 'orders' 
                                AND COLUMN_NAME = 'payment_status'");
    $checkCol2->execute();
    if ($checkCol2->fetchColumn() == 0) {
        $db->exec("ALTER TABLE `orders` ADD COLUMN `payment_status` VARCHAR(50) NOT NULL DEFAULT 'Pending' AFTER `payment_method`");
    }
} catch (PDOException $migErr) {
    // Silently continue — migration may have already been applied
    error_log("Auto-migrate notice: " . $migErr->getMessage());
}

$data = json_decode(file_get_contents("php://input"));

// ─── DEBUG LOGGING ───
error_log("Order Payload: " . json_encode($data));

// 🔥 Time Validation Logic
$settingsQuery = "SELECT setting_key, setting_value FROM settings WHERE setting_key IN ('restaurant_open_time', 'restaurant_close_time')";
$settingsStmt = $db->prepare($settingsQuery);
$settingsStmt->execute();
$timings = [];
while ($row = $settingsStmt->fetch(PDO::FETCH_ASSOC)) {
    $timings[$row['setting_key']] = $row['setting_value'];
}

$open_time_str = $timings['restaurant_open_time'] ?? '00:00';
$close_time_str = $timings['restaurant_close_time'] ?? '23:59';

date_default_timezone_set('Asia/Karachi'); // Assuming PKT timezone
$current_time_str = date('H:i');

$open_ts = strtotime($open_time_str);
$close_ts = strtotime($close_time_str);
$curr_ts = strtotime($current_time_str);

$is_open = false;

if ($close_ts > $open_ts) {
    if ($curr_ts >= $open_ts && $curr_ts <= $close_ts) {
        $is_open = true;
    }
} else {
    if ($curr_ts >= $open_ts || $curr_ts <= $close_ts) {
        $is_open = true;
    }
}

if (!$is_open) {
    echo json_encode([
        "success" => false, 
        "message" => "Restaurant is currently closed. Operating hours are from " . date("h:i A", $open_ts) . " to " . date("h:i A", $close_ts) . ".",
        "code" => "RESTAURANT_CLOSED"
    ]);
    exit();
}

$order_total = 0;
$addon_ids = [];
$menu_item_ids = [];

if (!empty($data->cart) && is_array($data->cart)) {
    foreach($data->cart as $item) {
        if (!empty($item->is_addon) && !empty($item->addon_data)) {
            $addon_id = intval($item->addon_data->id ?? 0);
            if ($addon_id > 0) $addon_ids[] = $addon_id;
        } else {
            $menu_item_id = isset($item->menuItemId) ? intval($item->menuItemId) : 0;
            if ($menu_item_id <= 0 && isset($item->id)) {
                $parts = explode('-', strval($item->id));
                if (is_numeric($parts[0])) $menu_item_id = intval($parts[0]);
            }
            if ($menu_item_id > 0) $menu_item_ids[] = $menu_item_id;
        }
    }
}

// BULK FETCH PRICES
$addon_prices = [];
if (!empty($addon_ids)) {
    $ids_str = implode(',', array_fill(0, count($addon_ids), '?'));
    $stmt = $db->prepare("SELECT id, price FROM menu_addons WHERE id IN ($ids_str)");
    $stmt->execute($addon_ids);
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $addon_prices[$row['id']] = floatval($row['price']);
    }
}

$menu_item_prices = [];
$menu_variant_prices = [];
if (!empty($menu_item_ids)) {
    $ids_str = implode(',', array_fill(0, count($menu_item_ids), '?'));
    $stmt = $db->prepare("SELECT id, price FROM menu_items WHERE id IN ($ids_str)");
    $stmt->execute($menu_item_ids);
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $menu_item_prices[$row['id']] = floatval($row['price']);
    }
    
    $stmt = $db->prepare("SELECT menu_id, size_name, price FROM menu_variants WHERE menu_id IN ($ids_str)");
    $stmt->execute($menu_item_ids);
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $menu_variant_prices[$row['menu_id'] . '_' . $row['size_name']] = floatval($row['price']);
    }
}

// CALCULATE TOTAL
if (!empty($data->cart) && is_array($data->cart)) {
    foreach($data->cart as $item) {
        $order_qty = intval($item->qty ?? 1);
        if (!empty($item->is_addon) && !empty($item->addon_data)) {
            $addon_id = intval($item->addon_data->id ?? 0);
            if ($addon_id > 0 && isset($addon_prices[$addon_id])) {
                $order_total += $addon_prices[$addon_id] * $order_qty;
            } else {
                $order_total += floatval($item->price ?? 0) * $order_qty;
            }
        } else {
            $menu_item_id = isset($item->menuItemId) ? intval($item->menuItemId) : 0;
            if ($menu_item_id <= 0 && isset($item->id)) {
                $parts = explode('-', strval($item->id));
                if (is_numeric($parts[0])) $menu_item_id = intval($parts[0]);
            }
            $variant_name = $item->size ?? 'Regular';
            
            if ($menu_item_id > 0) {
                $key = $menu_item_id . '_' . $variant_name;
                $dbPrice = 0;
                if (isset($menu_variant_prices[$key]) && $menu_variant_prices[$key] > 0) {
                    $dbPrice = $menu_variant_prices[$key];
                } elseif (isset($menu_item_prices[$menu_item_id])) {
                    $dbPrice = $menu_item_prices[$menu_item_id];
                }
                $order_total += $dbPrice * $order_qty;
            } else {
                $order_total += floatval($item->price ?? 0) * $order_qty;
            }
        }
    }
}

$order_type = !empty($data->order_type) ? $data->order_type : (!empty($data->orderType) ? $data->orderType : "Takeaway");
if (strtolower($order_type) === 'delivery') {
    $order_total += 150;
}

if(!empty($data->cart) && $order_total > 0) {
    try {
        $db->beginTransaction();

        $customer_name   = !empty($data->customer_name) ? $data->customer_name : (!empty($data->customerName) ? $data->customerName : "Walk-in");
        $customer_mobile = !empty($data->customer_mobile) ? $data->customer_mobile : (!empty($data->customerMobile) ? $data->customerMobile : null);
        $table_num       = !empty($data->table_number) ? $data->table_number : (!empty($data->tableNumber) ? $data->tableNumber : null);
        $cust_addr = !empty($data->customer_address) ? $data->customer_address : (!empty($data->customerAddress) ? $data->customerAddress : "");
        $full_addr = $cust_addr ? $cust_addr : trim(($data->house_no ?? "")." ".($data->street ?? "")." ".($data->area ?? ""));

        $payment_method = !empty($data->paymentMethod) ? $data->paymentMethod : (!empty($data->payment_method) ? $data->payment_method : "Cash on Delivery");
        $payment_status = !empty($data->paymentStatus) ? $data->paymentStatus : (!empty($data->payment_status) ? $data->payment_status : "Pending");

        $query = "INSERT INTO orders (order_type, customer_name, customer_mobile, customer_address, house_no, street, area, table_number, total, status, payment_method, payment_status) 
                  VALUES (:type, :name, :mobile, :address, :house, :street, :area, :table, :total, 'Pending', :pmethod, :pstatus)";
        $stmt = $db->prepare($query);
        $stmt->execute([
            ':type'    => $order_type,
            ':name'    => $customer_name,
            ':mobile'  => $customer_mobile,
            ':address' => $full_addr,
            ':house'   => $data->house_no ?? null,
            ':street'  => $data->street ?? null,
            ':area'    => $data->area ?? null,
            ':table'   => $table_num,
            ':total'   => $order_total,
            ':pmethod' => $payment_method,
            ':pstatus' => $payment_status
        ]);
        $order_id = $db->lastInsertId();

        // FETCH ALL RECIPES
        $recipes_map = [];
        if (!empty($menu_item_ids)) {
            $ids_str = implode(',', array_fill(0, count($menu_item_ids), '?'));
            $stmt = $db->prepare("SELECT menu_item_id, variant_name, inventory_id, quantity_to_deduct FROM recipes WHERE menu_item_id IN ($ids_str)");
            $stmt->execute($menu_item_ids);
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $key = $row['menu_item_id'] . '_' . $row['variant_name'];
                if (!isset($recipes_map[$key])) $recipes_map[$key] = [];
                $recipes_map[$key][] = [
                    'inventory_id' => intval($row['inventory_id']),
                    'quantity' => floatval($row['quantity_to_deduct'])
                ];
            }
        }

        // FETCH ALL INVENTORY PRICES
        $needed_inv_ids = [];
        foreach($data->cart as $item) {
            if (!empty($item->is_addon) && !empty($item->addon_data)) {
                $addon_inv_id = intval($item->addon_data->inventory_id ?? 0);
                if ($addon_inv_id > 0) $needed_inv_ids[$addon_inv_id] = true;
            } else {
                $menu_item_id = isset($item->menuItemId) ? intval($item->menuItemId) : 0;
                if ($menu_item_id <= 0 && isset($item->id)) {
                    $parts = explode('-', strval($item->id));
                    if (is_numeric($parts[0])) $menu_item_id = intval($parts[0]);
                }
                $variant_name = $item->size ?? 'Regular';
                $key = $menu_item_id . '_' . $variant_name;
                if (isset($recipes_map[$key])) {
                    foreach ($recipes_map[$key] as $r) {
                        $needed_inv_ids[$r['inventory_id']] = true;
                    }
                }
            }
        }

        $inventory_prices = [];
        if (!empty($needed_inv_ids)) {
            $ids = array_keys($needed_inv_ids);
            $ids_str = implode(',', array_fill(0, count($ids), '?'));
            $stmt = $db->prepare("SELECT id, price FROM inventory WHERE id IN ($ids_str)");
            $stmt->execute($ids);
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $inventory_prices[$row['id']] = floatval($row['price']);
            }
        }

        // INSERT ORDER ITEMS & CALCULATE DEDUCTIONS
        $itemQuery = "INSERT INTO order_items (order_id, title, size, note, qty, price) VALUES (:oid, :title, :size, :note, :qty, :price)";
        $itemStmt = $db->prepare($itemQuery);

        $inventory_deductions = [];
        $cost_updates = [];

        foreach($data->cart as $item) {
            $itemStmt->execute([
                ':oid'   => $order_id,
                ':title' => $item->name ?? ($item->title ?? 'Unknown Item'),
                ':size'  => $item->size ?? 'Regular',
                ':note'  => $item->note ?? '',
                ':qty'   => $item->qty ?? 1,
                ':price' => $item->price ?? 0
            ]);
            $order_item_id = $db->lastInsertId();

            $order_qty = intval($item->qty ?? 1);
            $unit_cost = 0;

            if (!empty($item->is_addon) && !empty($item->addon_data)) {
                $addon_inv_id = intval($item->addon_data->inventory_id ?? 0);
                $addon_deduct = floatval($item->addon_data->qty ?? 0);
                if ($addon_inv_id > 0 && $addon_deduct > 0) {
                    $invPrice = $inventory_prices[$addon_inv_id] ?? 0;
                    $unit_cost += ($addon_deduct * $invPrice);
                    if (!isset($inventory_deductions[$addon_inv_id])) $inventory_deductions[$addon_inv_id] = 0;
                    $inventory_deductions[$addon_inv_id] += ($addon_deduct * $order_qty);
                }
            } else {
                $menu_item_id = isset($item->menuItemId) ? intval($item->menuItemId) : 0;
                if ($menu_item_id <= 0 && isset($item->id)) {
                    $parts = explode('-', strval($item->id));
                    if (is_numeric($parts[0])) $menu_item_id = intval($parts[0]);
                }
                $variant_name = $item->size ?? 'Regular';
                
                $excluded = [];
                if (!empty($item->excluded_ingredients) && is_array($item->excluded_ingredients)) {
                    foreach ($item->excluded_ingredients as $exId) $excluded[] = intval($exId);
                }

                $key = $menu_item_id . '_' . $variant_name;
                if (isset($recipes_map[$key])) {
                    foreach ($recipes_map[$key] as $ing) {
                        $inv_id = intval($ing['inventory_id']);
                        if (in_array($inv_id, $excluded)) continue;
                        
                        $qty_to_deduct = $ing['quantity'];
                        $invPrice = $inventory_prices[$inv_id] ?? 0;
                        $unit_cost += ($qty_to_deduct * $invPrice);
                        
                        $total_deduct = $qty_to_deduct * $order_qty;
                        if ($total_deduct > 0) {
                            if (!isset($inventory_deductions[$inv_id])) $inventory_deductions[$inv_id] = 0;
                            $inventory_deductions[$inv_id] += $total_deduct;
                        }
                    }
                }
            }
            
            if ($unit_cost > 0) {
                $cost_updates[$order_item_id] = $unit_cost;
            }
        }

        if (!empty($inventory_deductions)) {
            $deductQuery = "UPDATE inventory SET stock = GREATEST(stock - :deduct, 0) WHERE id = :iid";
            $dStmt = $db->prepare($deductQuery);
            foreach ($inventory_deductions as $iid => $total_deduct) {
                $dStmt->execute([':deduct' => $total_deduct, ':iid' => $iid]);
            }
        }

        if (!empty($cost_updates)) {
            $updateCostQuery = "UPDATE order_items SET cost_price = :cost WHERE id = :oiid";
            $ucStmt = $db->prepare($updateCostQuery);
            foreach ($cost_updates as $oiid => $cost) {
                $ucStmt->execute([':cost' => $cost, ':oiid' => $oiid]);
            }
        }

        $db->commit();
        echo json_encode([
            "success"       => true, 
            "message"       => "Order saved successfully!", 
            "order_id"      => $order_id,
            "database_used" => "restaurant_db"
        ]);
    } catch(Exception $e) {
        $db->rollBack();
        echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Invalid Request Data"]);
}
?>