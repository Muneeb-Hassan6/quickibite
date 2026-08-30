<?php
include_once __DIR__ . '/../config/cors_headers.php';
include_once __DIR__ . '/../config/Database.php';

$database = new Database();
$db = $database->getConnection();

// ─── AUTO-MIGRATE: Ensure payment_method, payment_status, and coordinate columns exist ───
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

    $checkLat = $db->prepare("SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                               WHERE TABLE_SCHEMA = DATABASE() 
                               AND TABLE_NAME = 'orders' 
                               AND COLUMN_NAME = 'customer_lat'");
    $checkLat->execute();
    if ($checkLat->fetchColumn() == 0) {
        $db->exec("ALTER TABLE `orders` ADD COLUMN `customer_lat` DECIMAL(10, 8) NULL DEFAULT NULL AFTER `customer_address`");
    }

    $checkLng = $db->prepare("SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                               WHERE TABLE_SCHEMA = DATABASE() 
                               AND TABLE_NAME = 'orders' 
                               AND COLUMN_NAME = 'customer_lng'");
    $checkLng->execute();
    if ($checkLng->fetchColumn() == 0) {
        $db->exec("ALTER TABLE `orders` ADD COLUMN `customer_lng` DECIMAL(11, 8) NULL DEFAULT NULL AFTER `customer_lat`");
    }

    $checkLat2 = $db->prepare("SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                                WHERE TABLE_SCHEMA = DATABASE() 
                                AND TABLE_NAME = 'orders' 
                                AND COLUMN_NAME = 'latitude'");
    $checkLat2->execute();
    if ($checkLat2->fetchColumn() == 0) {
        $db->exec("ALTER TABLE `orders` ADD COLUMN `latitude` DECIMAL(10, 8) NULL DEFAULT NULL AFTER `customer_lng`");
    }

    $checkLng2 = $db->prepare("SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                                 WHERE TABLE_SCHEMA = DATABASE() 
                                 AND TABLE_NAME = 'orders' 
                                 AND COLUMN_NAME = 'longitude'");
    $checkLng2->execute();
    if ($checkLng2->fetchColumn() == 0) {
        $db->exec("ALTER TABLE `orders` ADD COLUMN `longitude` DECIMAL(11, 8) NULL DEFAULT NULL AFTER `latitude`");
    }

    $checkHouse = $db->prepare("SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                                 WHERE TABLE_SCHEMA = DATABASE() 
                                 AND TABLE_NAME = 'orders' 
                                 AND COLUMN_NAME = 'house_info'");
    $checkHouse->execute();
    if ($checkHouse->fetchColumn() == 0) {
        $db->exec("ALTER TABLE `orders` ADD COLUMN `house_info` VARCHAR(255) NULL DEFAULT NULL AFTER `house_no`");
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

// Safely extract cart items from either 'cart' or 'items'
$cart_items = !empty($data->cart) && is_array($data->cart) ? $data->cart : (!empty($data->items) && is_array($data->items) ? $data->items : []);

if (!empty($cart_items)) {
    foreach($cart_items as $item) {
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
if (!empty($cart_items)) {
    foreach($cart_items as $item) {
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

// Fallback to client total if server calculation was 0 but client sent a valid total
if ($order_total <= 0 && !empty($data->total)) {
    $order_total = floatval($data->total);
}

$raw_order_type = !empty($data->order_type) ? $data->order_type : (!empty($data->orderType) ? $data->orderType : (!empty($data->type) ? $data->type : "Takeaway"));
if (strtolower($raw_order_type) === 'delivery') {
    $order_type = "Delivery";
    // Only add delivery fee if not already accounted for
    if (empty($data->deliveryFee) && empty($data->delivery_fee)) {
        $order_total += 150;
    }
} elseif (strtolower($raw_order_type) === 'dine_in' || strtolower($raw_order_type) === 'dine-in') {
    $order_type = "Dine-In";
} else {
    $order_type = "Takeaway";
}

if(!empty($cart_items) && $order_total > 0) {
    try {
        $db->beginTransaction();

        $customer_name = !empty($data->customer_name) ? trim($data->customer_name) : 
                         (!empty($data->customerName) ? trim($data->customerName) : 
                         (!empty($data->name) ? trim($data->name) : 
                         (!empty($data->fullName) ? trim($data->fullName) : "Walk-in")));

        $customer_mobile = !empty($data->customer_mobile) ? trim($data->customer_mobile) : 
                           (!empty($data->customerMobile) ? trim($data->customerMobile) : 
                           (!empty($data->mobile) ? trim($data->mobile) : 
                           (!empty($data->phone) ? trim($data->phone) : 
                           (!empty($data->contact) ? trim($data->contact) : null))));

        $table_num = !empty($data->table_number) ? trim($data->table_number) : 
                     (!empty($data->tableNumber) ? trim($data->tableNumber) : null);

        $cust_addr = !empty($data->customer_address) ? trim($data->customer_address) : 
                     (!empty($data->customerAddress) ? trim($data->customerAddress) : 
                     (!empty($data->address) ? trim($data->address) : 
                     (!empty($data->street_address) ? trim($data->street_address) : "")));

        $full_addr = $cust_addr ? $cust_addr : trim(($data->house_no ?? "")." ".($data->street ?? "")." ".($data->area ?? ""));

        $payment_method = !empty($data->paymentMethod) ? $data->paymentMethod : (!empty($data->payment_method) ? $data->payment_method : "Cash on Delivery");
        $payment_status = !empty($data->paymentStatus) ? $data->paymentStatus : (!empty($data->payment_status) ? $data->payment_status : "Pending");

        $cust_lat = !empty($data->customer_lat) ? floatval($data->customer_lat) : 
                    (!empty($data->target_lat) ? floatval($data->target_lat) : 
                    (!empty($data->latitude) ? floatval($data->latitude) : 
                    (!empty($data->lat) ? floatval($data->lat) : null)));

        $cust_lng = !empty($data->customer_lng) ? floatval($data->customer_lng) : 
                    (!empty($data->target_lng) ? floatval($data->target_lng) : 
                    (!empty($data->longitude) ? floatval($data->longitude) : 
                    (!empty($data->lng) ? floatval($data->lng) : null)));

        $house_val = !empty($data->house_info) ? trim($data->house_info) : (!empty($data->house_no) ? trim($data->house_no) : null);

        $query = "INSERT INTO orders (order_type, customer_name, customer_mobile, customer_address, customer_lat, customer_lng, latitude, longitude, house_no, house_info, street, area, table_number, total, status, payment_method, payment_status) 
                  VALUES (:type, :name, :mobile, :address, :cust_lat, :cust_lng, :lat, :lng, :house, :house_info, :street, :area, :table, :total, 'Pending', :pmethod, :pstatus)";
        $stmt = $db->prepare($query);
        $stmt->execute([
            ':type'       => $order_type,
            ':name'       => $customer_name,
            ':mobile'     => $customer_mobile,
            ':address'    => $full_addr,
            ':cust_lat'   => $cust_lat,
            ':cust_lng'   => $cust_lng,
            ':lat'        => $cust_lat,
            ':lng'        => $cust_lng,
            ':house'      => $house_val,
            ':house_info' => $house_val,
            ':street'     => $data->street ?? null,
            ':area'       => $data->area ?? null,
            ':table'      => $table_num,
            ':total'      => $order_total,
            ':pmethod'    => $payment_method,
            ':pstatus'    => $payment_status
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
        foreach($cart_items as $item) {
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

        foreach($cart_items as $item) {
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