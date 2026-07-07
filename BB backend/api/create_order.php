<?php
include_once __DIR__ . '/../config/cors_headers.php';
include_once __DIR__ . '/../config/Database.php';

$database = new Database();
$db = $database->getConnection();
$data = json_decode(file_get_contents("php://input"));

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
    // Normal schedule: e.g., 10:00 to 22:00
    if ($curr_ts >= $open_ts && $curr_ts <= $close_ts) {
        $is_open = true;
    }
} else {
    // Cross midnight: e.g., 18:00 to 02:00
    if ($curr_ts >= $open_ts || $curr_ts <= $close_ts) {
        $is_open = true;
    }
}

// Bypass check if it's placed by Cashier/Admin locally (optional, but strictly following user's prompt to block if closed)
if (!$is_open) {
    echo json_encode([
        "success" => false, 
        "message" => "Restaurant is currently closed. Operating hours are from " . date("h:i A", $open_ts) . " to " . date("h:i A", $close_ts) . ".",
        "code" => "RESTAURANT_CLOSED"
    ]);
    exit();
}

// Recalculate order total from database to prevent parameter/price tampering
$order_total = 0;
if (!empty($data->cart) && is_array($data->cart)) {
    foreach($data->cart as $item) {
        $order_qty = intval($item->qty ?? 1);
        if (!empty($item->is_addon) && !empty($item->addon_data)) {
            $addon_id = intval($item->addon_data->id ?? 0);
            if ($addon_id > 0) {
                $addonQuery = "SELECT price FROM menu_addons WHERE id = :id";
                $adStmt = $db->prepare($addonQuery);
                $adStmt->execute([':id' => $addon_id]);
                $addonPrice = floatval($adStmt->fetchColumn() ?: 0);
                $order_total += $addonPrice * $order_qty;
            } else {
                $order_total += floatval($item->price ?? 0) * $order_qty;
            }
        } else {
            $menu_item_id = isset($item->menuItemId) ? intval($item->menuItemId) : 0;
            if ($menu_item_id <= 0 && isset($item->id)) {
                $id_str = strval($item->id);
                if (is_numeric($id_str)) {
                    $menu_item_id = intval($id_str);
                } else {
                    $parts = explode('-', $id_str);
                    if (is_numeric($parts[0])) {
                        $menu_item_id = intval($parts[0]);
                    }
                }
            }
            $variant_name = $item->size ?? 'Regular';
            
            if ($menu_item_id > 0) {
                $priceQuery = "SELECT price FROM menu_variants WHERE menu_id = :mid AND size_name = :vname";
                $pStmt = $db->prepare($priceQuery);
                $pStmt->execute([':mid' => $menu_item_id, ':vname' => $variant_name]);
                $dbPrice = floatval($pStmt->fetchColumn() ?: 0);
                
                if ($dbPrice <= 0) {
                    $itemQuery = "SELECT price FROM menu_items WHERE id = :id";
                    $itStmt = $db->prepare($itemQuery);
                    $itStmt->execute([':id' => $menu_item_id]);
                    $dbPrice = floatval($itStmt->fetchColumn() ?: 0);
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

        $order_type      = !empty($data->order_type) ? $data->order_type : (!empty($data->orderType) ? $data->orderType : "Takeaway");
        $customer_name   = !empty($data->customer_name) ? $data->customer_name : (!empty($data->customerName) ? $data->customerName : "Walk-in");
        $customer_mobile = !empty($data->customer_mobile) ? $data->customer_mobile : (!empty($data->customerMobile) ? $data->customerMobile : null);
        $table_num       = !empty($data->table_number) ? $data->table_number : (!empty($data->tableNumber) ? $data->tableNumber : null);
        
        $cust_addr = !empty($data->customer_address) ? $data->customer_address : (!empty($data->customerAddress) ? $data->customerAddress : "");
        $full_addr = $cust_addr ? $cust_addr : trim(($data->house_no ?? "")." ".($data->street ?? "")." ".($data->area ?? ""));

        // 1. Insert into 'orders' table
        $query = "INSERT INTO orders (order_type, customer_name, customer_mobile, customer_address, house_no, street, area, table_number, total, status) 
                  VALUES (:type, :name, :mobile, :address, :house, :street, :area, :table, :total, 'Pending')";
                  
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
            ':total'   => $order_total
        ]);

        $order_id = $db->lastInsertId();

        // 2. Insert order items
        $itemQuery = "INSERT INTO order_items (order_id, title, size, note, qty, price) 
                      VALUES (:oid, :title, :size, :note, :qty, :price)";
        $itemStmt = $db->prepare($itemQuery);

        $debugInfo = [];

        foreach($data->cart as $item) {
            $itemStmt->execute([
                ':oid'   => $order_id,
                ':title' => $item->name ?? ($item->title ?? 'Unknown Item'),
                ':size'  => $item->size ?? 'Regular',
                ':note'  => $item->note ?? '',
                ':qty'   => $item->qty ?? 1,
                ':price' => $item->price ?? 0
            ]);

            $order_item_id = $db->lastInsertId(); // Save ID to update cost_price

            // 🔥 INVENTORY DEDUCTION & COST CALCULATION
            $log = "Processing item: " . json_encode($item) . "\n";
            file_put_contents(__DIR__ . '/log.txt', $log, FILE_APPEND);
            
            $menu_item_id = null;
            $order_qty = intval($item->qty ?? 1);
            $unit_cost = 0; // Store calculated cost for one unit

            // Check if this is an addon item
            if (!empty($item->is_addon) && !empty($item->addon_data)) {
                // Addon ke liye directly inventory_id aur qty use karo
                $addon_inv_id = intval($item->addon_data->inventory_id ?? 0);
                $addon_deduct = floatval($item->addon_data->qty ?? 0);
                if ($addon_inv_id > 0 && $addon_deduct > 0) {
                    // Fetch inventory price for cost calculation
                    $invQ = "SELECT price FROM inventory WHERE id = :iid";
                    $invS = $db->prepare($invQ);
                    $invS->execute([':iid' => $addon_inv_id]);
                    $invPrice = floatval($invS->fetchColumn() ?: 0);
                    $unit_cost += ($addon_deduct * $invPrice);

                    $total_deduct = $addon_deduct * $order_qty;
                    $deductQuery = "UPDATE inventory SET stock = GREATEST(stock - :deduct, 0) WHERE id = :iid";
                    $dStmt = $db->prepare($deductQuery);
                    $dStmt->execute([':deduct' => $total_deduct, ':iid' => $addon_inv_id]);
                }
            } else {
                // Normal menu item - menuItemId ya id se recipe dhoondo
                $menu_item_id = isset($item->menuItemId) ? intval($item->menuItemId) : 0;
                
                // Agar menuItemId nahi mila to fallback: id se numeric part nikalo (e.g. "5-Large" => 5)
                if ($menu_item_id <= 0 && isset($item->id)) {
                    $id_str = strval($item->id);
                    if (is_numeric($id_str)) {
                        $menu_item_id = intval($id_str);
                    } else {
                        // "5-Large" jaise format se pehla number nikalo
                        $parts = explode('-', $id_str);
                        if (is_numeric($parts[0])) {
                            $menu_item_id = intval($parts[0]);
                        }
                    }
                }

                $variant_name = $item->size ?? 'Regular';

                if ($menu_item_id > 0) {
                    $debugInfo[] = "Searching recipes for menu_item_id=$menu_item_id, variant=$variant_name";
                    
                    // Excluded ingredients list (customer ne "Without" kiya)
                    $excluded = [];
                    if (!empty($item->excluded_ingredients) && is_array($item->excluded_ingredients)) {
                        foreach ($item->excluded_ingredients as $exId) {
                            $excluded[] = intval($exId);
                        }
                    }

                    // Recipes table se ingredients fetch karo
                    $recipeQuery = "SELECT inventory_id, quantity_to_deduct FROM recipes WHERE menu_item_id = :mid AND variant_name = :vname";
                    $rStmt = $db->prepare($recipeQuery);
                    $rStmt->execute([':mid' => $menu_item_id, ':vname' => $variant_name]);
                    $ingredients = $rStmt->fetchAll(PDO::FETCH_ASSOC);

                    $debugInfo[] = "Found " . count($ingredients) . " ingredients.";

                    foreach ($ingredients as $ing) {
                        $inv_id = intval($ing['inventory_id']);
                        
                        // Agar customer ne ye ingredient exclude kiya hai to skip karo
                        if (in_array($inv_id, $excluded)) {
                            $debugInfo[] = "Skipping inv_id $inv_id (excluded)";
                            continue;
                        }

                        $qty_to_deduct = floatval($ing['quantity_to_deduct']);
                        
                        // Fetch inventory price for cost calculation
                        $invQ = "SELECT price FROM inventory WHERE id = :iid";
                        $invS = $db->prepare($invQ);
                        $invS->execute([':iid' => $inv_id]);
                        $invPrice = floatval($invS->fetchColumn() ?: 0);
                        $unit_cost += ($qty_to_deduct * $invPrice);

                        $total_deduct = $qty_to_deduct * $order_qty;

                        if ($total_deduct > 0) {
                            $deductQuery = "UPDATE inventory SET stock = GREATEST(stock - :deduct, 0) WHERE id = :iid";
                            $dStmt = $db->prepare($deductQuery);
                            $res = $dStmt->execute([':deduct' => $total_deduct, ':iid' => $inv_id]);
                            $debugInfo[] = "Deducting $total_deduct from inv_id $inv_id. Success? " . ($res ? "YES" : "NO");
                        }
                    }
                }
            }
            
            // Save the calculated unit_cost to the order_items table
            if ($unit_cost > 0) {
                $updateCostQuery = "UPDATE order_items SET cost_price = :cost WHERE id = :oiid";
                $ucStmt = $db->prepare($updateCostQuery);
                $ucStmt->execute([':cost' => $unit_cost, ':oiid' => $order_item_id]);
            }
        }
        $db->commit();

        // 🔥 NOTE: Socket notification is now handled by the React frontend
        // after receiving this success response. No more curl call needed here.
        echo json_encode([
            "success"  => true, 
            "message"  => "Order saved successfully!", 
            "order_id" => $order_id,
            "debug"    => $debugInfo
        ]);

    } catch(Exception $e) {
        $db->rollBack();
        echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Invalid Request Data"]);
}
?>