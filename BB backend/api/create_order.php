<?php
include_once __DIR__ . '/../config/cors_headers.php';
include_once __DIR__ . '/../config/Database.php';

$database = new Database();
$db = $database->getConnection();

// ─── AUTO-MIGRATE: Ensure payment_method, payment_status, and coordinate columns exist ───
try {
    $checkCustId = $db->prepare("SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                                  WHERE TABLE_SCHEMA = DATABASE() 
                                  AND TABLE_NAME = 'orders' 
                                  AND COLUMN_NAME = 'customer_id'");
    $checkCustId->execute();
    if ($checkCustId->fetchColumn() == 0) {
        $db->exec("ALTER TABLE `orders` ADD COLUMN `customer_id` INT NULL AFTER `id`");
    }

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
$raw_items = !empty($data->cart) && is_array($data->cart) ? $data->cart : (!empty($data->items) && is_array($data->items) ? $data->items : []);

// Sanitize and filter items to only allow valid positive quantities (1 to 100)
$cart_items = [];
foreach ($raw_items as $raw_item) {
    if (is_object($raw_item)) {
        $qty = intval($raw_item->qty ?? 1);
        if ($qty > 0 && $qty <= 100) {
            $raw_item->qty = $qty;
            $cart_items[] = $raw_item;
        }
    }
}

if (empty($cart_items)) {
    http_response_code(400);
    echo json_encode([
        "success" => false, 
        "message" => "Cart is empty or contains invalid item quantities."
    ]);
    exit();
}

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

$subtotal = $order_total;
$raw_order_type = !empty($data->order_type) ? $data->order_type : (!empty($data->orderType) ? $data->orderType : (!empty($data->type) ? $data->type : (!empty($data->order_mode) ? $data->order_mode : "delivery")));
$order_mode = "delivery";
$order_type = "Delivery";

if (strtolower($raw_order_type) === 'dine_in' || strtolower($raw_order_type) === 'dine-in') {
    $order_mode = "dine_in";
    $order_type = "Dine-In";
} elseif (strtolower($raw_order_type) === 'takeaway' || strtolower($raw_order_type) === 'pickup') {
    $order_mode = "takeaway";
    $order_type = "Takeaway";
} else {
    $order_mode = "delivery";
    $order_type = "Delivery";
}

$rider_tip = 0.00;
$delivery_fee = 0.00;
$discount_amount = 0.00;
$coupon_code = !empty($data->coupon_code) ? trim($data->coupon_code) : (!empty($data->couponCode) ? trim($data->couponCode) : (!empty($data->promo_code) ? trim($data->promo_code) : null));

// Extract customer info early for coupon security validation
$customer_mobile = !empty($data->customer_mobile) ? trim($data->customer_mobile) : 
                  (!empty($data->customerMobile) ? trim($data->customerMobile) : 
                  (!empty($data->mobile) ? trim($data->mobile) : 
                  (!empty($data->phone) ? trim($data->phone) : 
                  (!empty($data->contact) ? trim($data->contact) : null))));

$customer_id = !empty($data->customer_id) ? intval($data->customer_id) : (!empty($data->customerId) ? intval($data->customerId) : null);
if (!$customer_id && !empty($customer_mobile)) {
    $cleanPh = preg_replace('/[^0-9]/', '', $customer_mobile);
    $findCust = $db->prepare("SELECT id FROM customer_users WHERE phone = :ph OR phone = :ph2 LIMIT 1");
    $findCust->execute([':ph' => $customer_mobile, ':ph2' => $cleanPh]);
    $cRow = $findCust->fetch(PDO::FETCH_ASSOC);
    if ($cRow) {
        $customer_id = intval($cRow['id']);
    }
}
if (!$customer_id && !empty($data->customer_email ?? ($data->email ?? null))) {
    $em = trim($data->customer_email ?? $data->email);
    $findCustEm = $db->prepare("SELECT id FROM customer_users WHERE email = :em LIMIT 1");
    $findCustEm->execute([':em' => $em]);
    $cRowEm = $findCustEm->fetch(PDO::FETCH_ASSOC);
    if ($cRowEm) {
        $customer_id = intval($cRowEm['id']);
    }
}

// 1. Enforce Delivery Fee & Delivery Radius Boundary Check based on Order Mode
if ($order_mode === 'delivery') {
    // Dynamic Delivery Settings
    $delivSettingsQuery = $db->query("SELECT setting_key, setting_value FROM settings WHERE setting_key IN ('free_delivery_threshold', 'default_delivery_fee', 'delivery_fee', 'delivery_radius', 'restaurant_lat', 'restaurant_lng')");
    $delivSettings = [];
    if ($delivSettingsQuery) {
        while ($row = $delivSettingsQuery->fetch(PDO::FETCH_ASSOC)) {
            $delivSettings[$row['setting_key']] = $row['setting_value'];
        }
    }
    $dbThreshold = isset($delivSettings['free_delivery_threshold']) ? floatval($delivSettings['free_delivery_threshold']) : 1500.00;
    $dbDefaultFee = isset($delivSettings['default_delivery_fee']) ? floatval($delivSettings['default_delivery_fee']) : (isset($delivSettings['delivery_fee']) ? floatval($delivSettings['delivery_fee']) : 150.00);
    $delivery_fee = ($subtotal >= $dbThreshold) ? 0.00 : $dbDefaultFee;

    // Delivery Radius Boundary Guard (Haversine Formula)
    $restaurantLat = isset($delivSettings['restaurant_lat']) && floatval($delivSettings['restaurant_lat']) != 0 ? floatval($delivSettings['restaurant_lat']) : 31.5204;
    $restaurantLng = isset($delivSettings['restaurant_lng']) && floatval($delivSettings['restaurant_lng']) != 0 ? floatval($delivSettings['restaurant_lng']) : 74.3587;
    $maxDeliveryRadiusKm = isset($delivSettings['delivery_radius']) && floatval($delivSettings['delivery_radius']) > 0 ? floatval($delivSettings['delivery_radius']) : 10.0;

    $reqLat = !empty($data->customer_lat) ? floatval($data->customer_lat) : 
              (!empty($data->target_lat) ? floatval($data->target_lat) : 
              (!empty($data->latitude) ? floatval($data->latitude) : 
              (!empty($data->lat) ? floatval($data->lat) : null)));

    $reqLng = !empty($data->customer_lng) ? floatval($data->customer_lng) : 
              (!empty($data->target_lng) ? floatval($data->target_lng) : 
              (!empty($data->longitude) ? floatval($data->longitude) : 
              (!empty($data->lng) ? floatval($data->lng) : null)));

    if ($reqLat !== null && $reqLng !== null && ($reqLat != 0 || $reqLng != 0)) {
        $earthRadius = 6371; // Earth's radius in km
        $dLat = deg2rad($reqLat - $restaurantLat);
        $dLon = deg2rad($reqLng - $restaurantLng);
        $a = sin($dLat / 2) * sin($dLat / 2) +
             cos(deg2rad($restaurantLat)) * cos(deg2rad($reqLat)) *
             sin($dLon / 2) * sin($dLon / 2);
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
        $distanceKm = $earthRadius * $c;

        if ($distanceKm > $maxDeliveryRadiusKm) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => "Delivery location exceeds our maximum delivery radius of " . number_format($maxDeliveryRadiusKm, 0) . " km.",
                'distance_km' => round($distanceKm, 2),
                'max_radius_km' => $maxDeliveryRadiusKm
            ]);
            exit();
        }
    }
} else {
    // Mode is Takeaway or Dine-In: Strictly zero out delivery fees
    $delivery_fee = 0.00;
}

// 2. Server-Side Coupon Re-validation
$couponIdToUpdate = null;
if (!empty($coupon_code)) {
    $cStmt = $db->prepare("SELECT * FROM coupons WHERE BINARY code = :code AND is_active = 1 LIMIT 1");
    $cStmt->execute([':code' => $coupon_code]);
    $validCoupon = $cStmt->fetch(PDO::FETCH_ASSOC);

    if ($validCoupon) {
        $minSpend = floatval($validCoupon['min_spend'] ?? 0);
        $isNotExpired = empty($validCoupon['expiry_date']) || strtotime($validCoupon['expiry_date']) >= time();
        $hasUsageLeft = is_null($validCoupon['usage_limit']) || intval($validCoupon['times_used']) < intval($validCoupon['usage_limit']);

        if (!$isNotExpired || !$hasUsageLeft || $subtotal < $minSpend) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'The applied promo code is no longer valid or minimum spend requirement is not met.'
            ]);
            exit();
        }

        // Rule B (Per-Customer Multi-Use Prevention)
        if (!empty($customer_id) || !empty($customer_mobile)) {
            $whereParts = [];
            $params = [':code' => $coupon_code];

            if (!empty($customer_id)) {
                $whereParts[] = "customer_id = :cid";
                $params[':cid'] = $customer_id;
            }
            if (!empty($customer_mobile)) {
                $whereParts[] = "customer_mobile = :mobile";
                $params[':mobile'] = $customer_mobile;
            }

            $whereClause = implode(" OR ", $whereParts);
            $usageCheckStmt = $db->prepare("SELECT COUNT(*) FROM orders WHERE coupon_code = :code AND ({$whereClause}) AND status != 'Cancelled'");
            $usageCheckStmt->execute($params);
            if (intval($usageCheckStmt->fetchColumn()) > 0) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'You have already redeemed this promo code on a previous order.'
                ]);
                exit();
            }
        }

        // Rule A (Welcome & First-Order Coupons)
        $isFirstOrderOnly = ($coupon_code === 'WELCOME50' || !empty($validCoupon['is_first_order_only']));
        if ($isFirstOrderOnly) {
            if (empty($customer_id)) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => "The {$validCoupon['code']} coupon is exclusive to registered members. Please log in or create an account to claim."
                ]);
                exit();
            }

            $priorStmt = $db->prepare("SELECT COUNT(*) FROM orders WHERE customer_id = :cid AND status != 'Cancelled'");
            $priorStmt->execute([':cid' => $customer_id]);
            if (intval($priorStmt->fetchColumn()) > 0) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'This welcome promo is valid on your first order only.'
                ]);
                exit();
            }
        }

        if ($validCoupon['discount_type'] === 'percentage') {
            $discount_amount = ($subtotal * floatval($validCoupon['discount_value'])) / 100;
            if (!empty($validCoupon['max_discount'])) {
                $discount_amount = min($discount_amount, floatval($validCoupon['max_discount']));
            }
        } else {
            $discount_amount = floatval($validCoupon['discount_value']);
        }
        $discount_amount = min($discount_amount, $subtotal);
        $couponIdToUpdate = $validCoupon['id'];
    } else {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Invalid or expired promo code.'
        ]);
        exit();
    }
}

// 3. Final Grand Total Calculation
$order_total = max(0, $subtotal - $discount_amount) + $delivery_fee + $rider_tip;

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

        $customer_id = !empty($data->customer_id) ? intval($data->customer_id) : (!empty($data->customerId) ? intval($data->customerId) : null);

        // Fallback: If customer_id is missing, auto-link to customer_users by phone or email
        if (!$customer_id && !empty($customer_mobile)) {
            $cleanPh = preg_replace('/[^0-9]/', '', $customer_mobile);
            $findCust = $db->prepare("SELECT id FROM customer_users WHERE phone = :ph OR phone = :ph2 LIMIT 1");
            $findCust->execute([':ph' => $customer_mobile, ':ph2' => $cleanPh]);
            $cRow = $findCust->fetch(PDO::FETCH_ASSOC);
            if ($cRow) {
                $customer_id = intval($cRow['id']);
            }
        }
        if (!$customer_id && !empty($data->customer_email ?? ($data->email ?? null))) {
            $em = trim($data->customer_email ?? $data->email);
            $findCustEm = $db->prepare("SELECT id FROM customer_users WHERE email = :em LIMIT 1");
            $findCustEm->execute([':em' => $em]);
            $cRowEm = $findCustEm->fetch(PDO::FETCH_ASSOC);
            if ($cRowEm) {
                $customer_id = intval($cRowEm['id']);
            }
        }

        $house_val = !empty($data->house_no) ? trim($data->house_no) : (!empty($data->house_info) ? trim($data->house_info) : (!empty($data->house) ? trim($data->house) : null));

        $query = "INSERT INTO orders (customer_id, order_type, order_mode, customer_name, customer_mobile, customer_address, customer_lat, customer_lng, latitude, longitude, house_no, house_info, street, area, table_number, delivery_fee, rider_tip, coupon_code, discount_amount, total, status, payment_method, payment_status) 
                  VALUES (:cid, :type, :mode, :name, :mobile, :address, :cust_lat, :cust_lng, :lat, :lng, :house, :house_info, :street, :area, :table, :deliv_fee, :tip, :coupon, :discount, :total, 'Pending', :pmethod, :pstatus)";
        $stmt = $db->prepare($query);
        $stmt->execute([
            ':cid'        => $customer_id,
            ':type'       => $order_type,
            ':mode'       => $order_mode,
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
            ':deliv_fee'  => $delivery_fee,
            ':tip'        => $rider_tip,
            ':coupon'     => $coupon_code,
            ':discount'   => $discount_amount,
            ':total'      => $order_total,
            ':pmethod'    => $payment_method,
            ':pstatus'    => $payment_status
        ]);
        $order_id = $db->lastInsertId();

        // Increment coupon times_used if applied
        if ($couponIdToUpdate) {
            $upStmt = $db->prepare("UPDATE coupons SET times_used = times_used + 1 WHERE id = :id");
            $upStmt->execute([':id' => $couponIdToUpdate]);
        }

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
        $itemQuery = "INSERT INTO order_items (order_id, title, size, note, qty, price, spice_level, selected_addons_json) VALUES (:oid, :title, :size, :note, :qty, :price, :spice, :addons_json)";
        $itemStmt = $db->prepare($itemQuery);

        $inventory_deductions = [];
        $cost_updates = [];

        foreach($cart_items as $item) {
            $spice_val = !empty($item->spice_level) ? $item->spice_level : (!empty($item->spiceLevel) ? $item->spiceLevel : 'Medium Spicy');
            $addons_json = null;
            if (!empty($item->selected_addons)) {
                $addons_json = is_string($item->selected_addons) ? $item->selected_addons : json_encode($item->selected_addons);
            } else if (!empty($item->addons)) {
                $addons_json = is_string($item->addons) ? $item->addons : json_encode($item->addons);
            }

            $itemStmt->execute([
                ':oid'         => $order_id,
                ':title'       => $item->name ?? ($item->title ?? 'Unknown Item'),
                ':size'        => $item->size ?? 'Regular',
                ':note'        => $item->note ?? '',
                ':qty'         => $item->qty ?? 1,
                ':price'       => $item->price ?? 0,
                ':spice'       => $spice_val,
                ':addons_json' => $addons_json
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

                // 1. Deduct standard recipe ingredients
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

                // 2. Deduct product custom add-ons
                $item_addons = [];
                if (!empty($item->selected_addons)) {
                    $item_addons = is_string($item->selected_addons) ? json_decode($item->selected_addons, true) : $item->selected_addons;
                } else if (!empty($item->addons)) {
                    $item_addons = is_string($item->addons) ? json_decode($item->addons, true) : $item->addons;
                }

                if (is_array($item_addons) && !empty($item_addons)) {
                    foreach ($item_addons as $addObj) {
                        $addInvId = !empty($addObj['inventory_id']) ? intval($addObj['inventory_id']) : (!empty($addObj->inventory_id) ? intval($addObj->inventory_id) : 0);
                        $addQty = !empty($addObj['qty_to_deduct']) ? floatval($addObj['qty_to_deduct']) : (!empty($addObj['qty']) ? floatval($addObj['qty']) : (!empty($addObj->qty) ? floatval($addObj->qty) : 0));

                        if ($addInvId <= 0 && $menu_item_id > 0) {
                            $addTitle = $addObj['title'] ?? ($addObj['name'] ?? ($addObj->title ?? ($addObj->name ?? '')));
                            if (!empty($addTitle)) {
                                $lookupStmt = $db->prepare("SELECT inventory_id, qty_to_deduct FROM product_custom_addons WHERE menu_item_id = ? AND title = ? LIMIT 1");
                                $lookupStmt->execute([$menu_item_id, $addTitle]);
                                $foundAddon = $lookupStmt->fetch(PDO::FETCH_ASSOC);
                                if ($foundAddon && !empty($foundAddon['inventory_id'])) {
                                    $addInvId = intval($foundAddon['inventory_id']);
                                    if ($addQty <= 0) $addQty = floatval($foundAddon['qty_to_deduct'] ?: 1);
                                }
                            }
                        }

                        if ($addInvId > 0) {
                            if ($addQty <= 0) $addQty = 1.0;
                            $invPrice = $inventory_prices[$addInvId] ?? 0;
                            $unit_cost += ($addQty * $invPrice);

                            $total_add_deduct = $addQty * $order_qty;
                            if (!isset($inventory_deductions[$addInvId])) $inventory_deductions[$addInvId] = 0;
                            $inventory_deductions[$addInvId] += $total_add_deduct;
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