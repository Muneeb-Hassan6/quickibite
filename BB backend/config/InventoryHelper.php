<?php
class InventoryHelper {

    private static $logsTableChecked = false;

    /**
     * Ensure the order_inventory_logs table exists for atomic deduction & restock tracking.
     * Guarded to NEVER execute DDL inside an active transaction (prevents MySQL implicit commit).
     */
    public static function ensureLogsTable(PDO $db) {
        if (self::$logsTableChecked) return;

        // Never execute DDL (CREATE TABLE) inside an active transaction in MySQL!
        if ($db->inTransaction()) {
            self::$logsTableChecked = true;
            return;
        }

        try {
            $sql = "CREATE TABLE IF NOT EXISTS order_inventory_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id INT NOT NULL,
                inventory_id INT NOT NULL,
                quantity DECIMAL(10,2) NOT NULL,
                is_restored TINYINT(1) DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX (order_id),
                INDEX (inventory_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";
            $db->exec($sql);
            self::$logsTableChecked = true;
        } catch (\Throwable $e) {
            // Already exists or creation failed safely
        }
    }

    /**
     * Deduct inventory stock for an order based on recipes and addons
     * @param int $order_id
     * @param array $cart_items
     * @param PDO $db
     * @return array Array of [inventory_id => total_deducted]
     */
    public static function deductOrderInventory($order_id, $cart_items, PDO $db) {
        self::ensureLogsTable($db);

        $inventory_deductions = []; // [inv_id => total_qty]

        // 1. Gather all menu_item_ids from cart items
        $menu_item_ids = [];
        foreach ($cart_items as $item) {
            $mId = self::resolveMenuItemId($item);
            if ($mId > 0) {
                $menu_item_ids[$mId] = true;
            }
        }

        // 2. Fetch all recipes for these menu items
        $recipes_map = [];
        if (!empty($menu_item_ids)) {
            $ids = array_keys($menu_item_ids);
            $inStr = implode(',', array_fill(0, count($ids), '?'));
            $stmt = $db->prepare("SELECT menu_item_id, variant_name, inventory_id, quantity_to_deduct FROM recipes WHERE menu_item_id IN ($inStr)");
            $stmt->execute($ids);
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $mId = intval($row['menu_item_id']);
                $vName = strtolower(trim($row['variant_name'] ?? ''));
                $key = $mId . '_' . $vName;
                if (!isset($recipes_map[$key])) $recipes_map[$key] = [];
                $recipes_map[$key][] = [
                    'inventory_id' => intval($row['inventory_id']),
                    'quantity' => floatval($row['quantity_to_deduct'])
                ];
            }
        }

        // 3. Process each cart item
        foreach ($cart_items as $item) {
            $order_qty = max(1, intval($item->qty ?? ($item->quantity ?? 1)));
            $mId = self::resolveMenuItemId($item);
            $size = strtolower(trim($item->size ?? 'regular'));

            // Excluded ingredients
            $excluded = [];
            if (!empty($item->excluded_ingredients) && is_array($item->excluded_ingredients)) {
                foreach ($item->excluded_ingredients as $exId) $excluded[] = intval($exId);
            }

            // A. Deduct recipe ingredients for menu item
            $recipeKey = $mId . '_' . $size;
            $fallbackKey = $mId . '_';
            $matchedRecipes = $recipes_map[$recipeKey] ?? ($recipes_map[$fallbackKey] ?? []);

            // If no size-specific match, check if any recipe exists for this menu_item_id
            if (empty($matchedRecipes) && $mId > 0) {
                foreach ($recipes_map as $rk => $rList) {
                    if (strpos($rk, $mId . '_') === 0 && !empty($rList)) {
                        $matchedRecipes = $rList;
                        break;
                    }
                }
            }

            foreach ($matchedRecipes as $ing) {
                $invId = intval($ing['inventory_id']);
                if (in_array($invId, $excluded)) continue;
                $deduct = floatval($ing['quantity']) * $order_qty;
                if ($deduct > 0 && $invId > 0) {
                    if (!isset($inventory_deductions[$invId])) $inventory_deductions[$invId] = 0;
                    $inventory_deductions[$invId] += $deduct;
                }
            }

            // B. Deduct add-ons (custom addons + category upsells)
            $item_addons = self::extractAddons($item);
            foreach ($item_addons as $addObj) {
                $addInvId = !empty($addObj['inventory_id']) ? intval($addObj['inventory_id']) : 0;
                $addQty = !empty($addObj['qty_to_deduct']) ? floatval($addObj['qty_to_deduct']) : (!empty($addObj['qty']) ? floatval($addObj['qty']) : 0);
                $addId = !empty($addObj['id']) ? intval($addObj['id']) : 0;
                $addTitle = trim($addObj['title'] ?? ($addObj['name'] ?? ''));

                // If inventory_id not provided, look up in product_custom_addons or menu_addons
                if ($addInvId <= 0) {
                    // Try product_custom_addons by ID or title
                    if ($addId > 0) {
                        $fStmt = $db->prepare("SELECT inventory_id, qty_to_deduct FROM product_custom_addons WHERE id = ? LIMIT 1");
                        $fStmt->execute([$addId]);
                        $found = $fStmt->fetch(PDO::FETCH_ASSOC);
                        if ($found && !empty($found['inventory_id'])) {
                            $addInvId = intval($found['inventory_id']);
                            if ($addQty <= 0) $addQty = floatval($found['qty_to_deduct'] ?: 1);
                        }
                    }

                    if ($addInvId <= 0 && $mId > 0 && !empty($addTitle)) {
                        $fStmt2 = $db->prepare("SELECT inventory_id, qty_to_deduct FROM product_custom_addons WHERE menu_item_id = ? AND title = ? LIMIT 1");
                        $fStmt2->execute([$mId, $addTitle]);
                        $found2 = $fStmt2->fetch(PDO::FETCH_ASSOC);
                        if ($found2 && !empty($found2['inventory_id'])) {
                            $addInvId = intval($found2['inventory_id']);
                            if ($addQty <= 0) $addQty = floatval($found2['qty_to_deduct'] ?: 1);
                        }
                    }

                    // Try menu_addons
                    if ($addInvId <= 0 && !empty($addTitle)) {
                        $fStmt3 = $db->prepare("SELECT inventory_id, qty_to_deduct FROM menu_addons WHERE addon_name = ? LIMIT 1");
                        $fStmt3->execute([$addTitle]);
                        $found3 = $fStmt3->fetch(PDO::FETCH_ASSOC);
                        if ($found3 && !empty($found3['inventory_id'])) {
                            $addInvId = intval($found3['inventory_id']);
                            if ($addQty <= 0) $addQty = floatval($found3['qty_to_deduct'] ?: 1);
                        }
                    }

                    // Try matching direct inventory item by name (e.g. Can drink or sauce)
                    if ($addInvId <= 0 && !empty($addTitle)) {
                        $fStmt4 = $db->prepare("SELECT id FROM inventory WHERE LOWER(name) = LOWER(?) LIMIT 1");
                        $fStmt4->execute([$addTitle]);
                        $found4 = $fStmt4->fetch(PDO::FETCH_ASSOC);
                        if ($found4 && !empty($found4['id'])) {
                            $addInvId = intval($found4['id']);
                            if ($addQty <= 0) $addQty = 1.0;
                        }
                    }
                }

                if ($addInvId > 0) {
                    if ($addQty <= 0) $addQty = 1.0;
                    $total_add_deduct = $addQty * $order_qty;
                    if (!isset($inventory_deductions[$addInvId])) $inventory_deductions[$addInvId] = 0;
                    $inventory_deductions[$addInvId] += $total_add_deduct;
                }
            }
        }

        // 4. Fetch inventory prices for cost_price calculations
        $needed_inv_ids = array_keys($inventory_deductions);
        $inventory_prices = [];
        if (!empty($needed_inv_ids)) {
            $inPricesStr = implode(',', array_fill(0, count($needed_inv_ids), '?'));
            $prStmt = $db->prepare("SELECT id, price FROM inventory WHERE id IN ($inPricesStr)");
            $prStmt->execute($needed_inv_ids);
            while ($pRow = $prStmt->fetch(PDO::FETCH_ASSOC)) {
                $inventory_prices[intval($pRow['id'])] = floatval($pRow['price']);
            }
        }

        // Calculate and update order_items cost_price if order_item_id is attached
        $costUpdateStmt = $db->prepare("UPDATE order_items SET cost_price = :cost WHERE id = :oiid");
        foreach ($cart_items as $item) {
            $oiid = is_object($item) ? ($item->order_item_id ?? null) : ($item['order_item_id'] ?? null);
            if (!$oiid) continue;

            $unit_cost = 0;
            $mId = self::resolveMenuItemId($item);
            $size = strtolower(trim($item->size ?? ($item['size'] ?? 'regular')));

            $recipeKey = $mId . '_' . $size;
            $fallbackKey = $mId . '_';
            $matchedRecipes = $recipes_map[$recipeKey] ?? ($recipes_map[$fallbackKey] ?? []);
            if (empty($matchedRecipes) && $mId > 0) {
                foreach ($recipes_map as $rk => $rList) {
                    if (strpos($rk, $mId . '_') === 0 && !empty($rList)) {
                        $matchedRecipes = $rList;
                        break;
                    }
                }
            }

            $excluded = [];
            $rawEx = is_object($item) ? ($item->excluded_ingredients ?? []) : ($item['excluded_ingredients'] ?? []);
            if (!empty($rawEx) && is_array($rawEx)) {
                foreach ($rawEx as $exId) $excluded[] = intval($exId);
            }

            foreach ($matchedRecipes as $ing) {
                $invId = intval($ing['inventory_id']);
                if (in_array($invId, $excluded)) continue;
                $p = $inventory_prices[$invId] ?? 0;
                $unit_cost += (floatval($ing['quantity']) * $p);
            }

            $item_addons = self::extractAddons($item);
            foreach ($item_addons as $addObj) {
                $addInvId = !empty($addObj['inventory_id']) ? intval($addObj['inventory_id']) : 0;
                $addQty = !empty($addObj['qty_to_deduct']) ? floatval($addObj['qty_to_deduct']) : (!empty($addObj['qty']) ? floatval($addObj['qty']) : 1.0);
                if ($addInvId > 0) {
                    $p = $inventory_prices[$addInvId] ?? 0;
                    $unit_cost += ($addQty * $p);
                }
            }

            if ($unit_cost > 0) {
                try {
                    $costUpdateStmt->execute([':cost' => $unit_cost, ':oiid' => $oiid]);
                } catch (\Throwable $ce) {
                    // Ignore if column doesn't exist
                }
            }
        }

        // 5. Apply deductions to inventory and record in order_inventory_logs
        if (!empty($inventory_deductions)) {
            $deductStmt = $db->prepare("UPDATE inventory SET stock = GREATEST(stock - :deduct, 0) WHERE id = :id");
            $logStmt = $db->prepare("INSERT INTO order_inventory_logs (order_id, inventory_id, quantity, is_restored) VALUES (:oid, :iid, :qty, 0)");

            foreach ($inventory_deductions as $invId => $totalDeduct) {
                if ($totalDeduct > 0) {
                    $deductStmt->execute([':deduct' => $totalDeduct, ':id' => $invId]);
                    $logStmt->execute([':oid' => $order_id, ':iid' => $invId, ':qty' => $totalDeduct]);
                }
            }

            // 6. Check if any inventory dropped to 0 or below threshold and alert staff
            self::checkLowStockAlerts(array_keys($inventory_deductions), $db);
        }

        return $inventory_deductions;
    }

    /**
     * Restock inventory for a cancelled or declined order
     * @param int $order_id
     * @param PDO $db
     * @param string $reason
     * @return int Number of inventory items restocked
     */
    public static function restockOrderInventory($order_id, PDO $db, $reason = '') {
        self::ensureLogsTable($db);
        $order_id = intval($order_id);
        if ($order_id <= 0) return 0;

        // 1. Check if logged deductions exist that haven't been restored yet
        $checkStmt = $db->prepare("SELECT inventory_id, SUM(quantity) as total_qty FROM order_inventory_logs WHERE order_id = ? AND is_restored = 0 GROUP BY inventory_id");
        $checkStmt->execute([$order_id]);
        $logsToRestore = $checkStmt->fetchAll(PDO::FETCH_ASSOC);

        $restoredCount = 0;

        if (!empty($logsToRestore)) {
            $restockStmt = $db->prepare("UPDATE inventory SET stock = stock + :qty WHERE id = :id");
            $markRestoredStmt = $db->prepare("UPDATE order_inventory_logs SET is_restored = 1 WHERE order_id = ?");

            foreach ($logsToRestore as $row) {
                $qty = floatval($row['total_qty']);
                $invId = intval($row['inventory_id']);
                if ($qty > 0 && $invId > 0) {
                    $restockStmt->execute([':qty' => $qty, ':id' => $invId]);
                    $restoredCount++;
                }
            }

            $markRestoredStmt->execute([$order_id]);
            return $restoredCount;
        }

        // Fallback for legacy orders created before order_inventory_logs:
        // Calculate from order_items
        $itemsStmt = $db->prepare("SELECT id, title, size, qty, selected_addons_json FROM order_items WHERE order_id = ?");
        $itemsStmt->execute([$order_id]);
        $orderItems = $itemsStmt->fetchAll(PDO::FETCH_ASSOC);

        if (empty($orderItems)) return 0;

        $recipeStmt = $db->query("
            SELECT r.menu_item_id, r.variant_name, r.inventory_id, r.quantity_to_deduct as quantity, m.name as menu_name 
            FROM recipes r
            JOIN menu_items m ON r.menu_item_id = m.id
        ");
        $recipes = $recipeStmt ? $recipeStmt->fetchAll(PDO::FETCH_ASSOC) : [];
        $recipesMap = [];
        foreach ($recipes as $r) {
            $key = strtolower(trim($r['menu_name'])) . '_' . strtolower(trim($r['variant_name'] ?: 'regular'));
            if (!isset($recipesMap[$key])) $recipesMap[$key] = [];
            $recipesMap[$key][] = $r;
        }

        $restorations = [];

        foreach ($orderItems as $item) {
            $itemQty = intval($item['qty'] ?? 1);
            $title = strtolower(trim($item['title'] ?? ''));
            $size = strtolower(trim($item['size'] ?: 'regular'));
            $key = $title . '_' . $size;

            if (isset($recipesMap[$key])) {
                foreach ($recipesMap[$key] as $ing) {
                    $invId = intval($ing['inventory_id']);
                    $qty = floatval($ing['quantity']) * $itemQty;
                    if (!isset($restorations[$invId])) $restorations[$invId] = 0;
                    $restorations[$invId] += $qty;
                }
            }
        }

        if (!empty($restorations)) {
            $restockStmt = $db->prepare("UPDATE inventory SET stock = stock + :qty WHERE id = :id");
            foreach ($restorations as $invId => $qty) {
                if ($qty > 0) {
                    $restockStmt->execute([':qty' => $qty, ':id' => $invId]);
                    $restoredCount++;
                }
            }
        }

        return $restoredCount;
    }

    /**
     * Resolve menu_item_id from cart item object or array
     */
    private static function resolveMenuItemId($item) {
        $mId = 0;
        if (is_object($item)) {
            $mId = isset($item->menuItemId) ? intval($item->menuItemId) : (isset($item->menu_item_id) ? intval($item->menu_item_id) : 0);
            if ($mId <= 0 && isset($item->id)) {
                $rawId = strval($item->id);
                $cleanId = preg_replace('/^(prod-|deal-)/', '', $rawId);
                $parts = explode('-', $cleanId);
                if (is_numeric($parts[0])) $mId = intval($parts[0]);
            }
        } else if (is_array($item)) {
            $mId = isset($item['menuItemId']) ? intval($item['menuItemId']) : (isset($item['menu_item_id']) ? intval($item['menu_item_id']) : 0);
            if ($mId <= 0 && isset($item['id'])) {
                $rawId = strval($item['id']);
                $cleanId = preg_replace('/^(prod-|deal-)/', '', $rawId);
                $parts = explode('-', $cleanId);
                if (is_numeric($parts[0])) $mId = intval($parts[0]);
            }
        }
        return $mId;
    }

    /**
     * Extract normalized add-ons list from cart item
     */
    private static function extractAddons($item) {
        $raw = null;
        if (is_object($item)) {
            $raw = $item->selected_addons ?? ($item->addons ?? null);
        } else if (is_array($item)) {
            $raw = $item['selected_addons'] ?? ($item['addons'] ?? null);
        }

        if (empty($raw)) return [];
        if (is_string($raw)) {
            $decoded = json_decode($raw, true);
            return is_array($decoded) ? $decoded : [];
        }
        return json_decode(json_encode($raw), true) ?: [];
    }

    /**
     * Trigger alerts in staff_notifications for low or depleted inventory
     */
    private static function checkLowStockAlerts(array $inventory_ids, PDO $db) {
        if (empty($inventory_ids)) return;
        try {
            $inStr = implode(',', array_fill(0, count($inventory_ids), '?'));
            $stmt = $db->prepare("SELECT id, name, stock, unit, threshold FROM inventory WHERE id IN ($inStr)");
            $stmt->execute($inventory_ids);
            $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $notifStmt = $db->prepare("INSERT INTO staff_notifications (type, title, message, is_read) VALUES ('inventory', :title, :msg, 0)");

            foreach ($items as $it) {
                $stock = floatval($it['stock']);
                $threshold = floatval($it['threshold'] ?? 5);
                $name = $it['name'];
                $unit = $it['unit'] ?: 'units';

                if ($stock <= 0) {
                    $title = "OUT OF STOCK: {$name}";
                    $msg = "Inventory item '{$name}' is completely depleted (0 {$unit}). Recipes using this item cannot be prepared.";
                    $notifStmt->execute([':title' => $title, ':msg' => $msg]);
                } else if ($stock <= $threshold) {
                    $title = "Low Stock Alert: {$name}";
                    $msg = "Inventory item '{$name}' has dropped to {$stock} {$unit} (Threshold: {$threshold} {$unit}).";
                    $notifStmt->execute([':title' => $title, ':msg' => $msg]);
                }
            }
        } catch (\Throwable $e) {
            error_log("Low stock alert error: " . $e->getMessage());
        }
    }
}
?>
