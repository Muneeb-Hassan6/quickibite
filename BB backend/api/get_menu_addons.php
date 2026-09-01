<?php
require_once __DIR__ . '/../config/cors_headers.php';
require_once __DIR__ . '/../config/Database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        throw new Exception("Unable to connect to database.");
    }

    $itemId = isset($_GET['item_id']) ? intval($_GET['item_id']) : (isset($_GET['id']) ? intval($_GET['id']) : 0);
    $category = trim($_GET['category'] ?? ($_GET['category_name'] ?? ''));
    $dealId = isset($_GET['deal_id']) ? intval($_GET['deal_id']) : 0;

    // If item_id is provided but category is empty, fetch category from menu_items
    if ($itemId > 0 && empty($category)) {
        $stmt = $db->prepare("SELECT category FROM menu_items WHERE id = ?");
        $stmt->execute([$itemId]);
        $category = $stmt->fetchColumn() ?: '';
    }

    if ($dealId > 0 || strtolower($category) === 'deal') {
        $category = 'deals';
    }

    $targetCatLower = strtolower($category);

    // ── 1. FETCH PRODUCT-SPECIFIC CUSTOM ADDONS ─────────────────────────────
    $productAddons = [];
    if ($itemId > 0) {
        // Check product_custom_addons table first
        $stmt = $db->prepare("
            SELECT id, title, price, inventory_id, qty_to_deduct 
            FROM product_custom_addons 
            WHERE menu_item_id = ? AND is_active = 1
            ORDER BY id ASC
        ");
        $stmt->execute([$itemId]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (!empty($rows)) {
            foreach ($rows as $r) {
                $productAddons[] = [
                    'id' => intval($r['id']),
                    'title' => $r['title'],
                    'name' => $r['title'],
                    'price' => floatval($r['price']),
                    'inventory_id' => !empty($r['inventory_id']) ? intval($r['inventory_id']) : null,
                    'qty' => !empty($r['qty_to_deduct']) ? floatval($r['qty_to_deduct']) : null,
                    'is_product_addon' => true
                ];
            }
        } else {
            // Fallback to legacy menu_addons table
            $stmt = $db->prepare("
                SELECT id, addon_name as title, addon_price as price, inventory_id, qty_to_deduct 
                FROM menu_addons 
                WHERE menu_item_id = ?
                ORDER BY id ASC
            ");
            $stmt->execute([$itemId]);
            $legacyRows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            foreach ($legacyRows as $r) {
                $productAddons[] = [
                    'id' => intval($r['id']),
                    'title' => $r['title'],
                    'name' => $r['title'],
                    'price' => floatval($r['price']),
                    'inventory_id' => !empty($r['inventory_id']) ? intval($r['inventory_id']) : null,
                    'qty' => !empty($r['qty_to_deduct']) ? floatval($r['qty_to_deduct']) : null,
                    'is_product_addon' => true
                ];
            }
        }
    }

    // ── 2. FETCH MAPPED ADDON GROUPS & LIVE ITEMS ───────────────────────────
    $addonGroups = [];

    // Query dynamic mappings for this category
    $mapStmt = $db->prepare("
        SELECT g.id, g.title, g.subtitle, g.icon_type, g.source_category_id, g.source_category_name
        FROM category_addon_mappings m
        JOIN addon_groups g ON m.addon_group_id = g.id
        WHERE LOWER(m.parent_category_name) = ? AND g.is_active = 1
        ORDER BY g.id ASC
    ");
    $mapStmt->execute([$targetCatLower]);
    $mappedGroups = $mapStmt->fetchAll(PDO::FETCH_ASSOC);

    // Fallback: If no custom mapping in database for this category, check default global groups
    if (empty($mappedGroups) && $targetCatLower !== '') {
        $defaultMapStmt = $db->query("
            SELECT g.id, g.title, g.subtitle, g.icon_type, g.source_category_id, g.source_category_name
            FROM addon_groups g
            WHERE g.is_active = 1
            ORDER BY g.id ASC
        ");
        $allGroups = $defaultMapStmt->fetchAll(PDO::FETCH_ASSOC);

        // Filter out group if the target category itself matches source category
        foreach ($allGroups as $grp) {
            $srcCatLower = strtolower($grp['source_category_name'] ?? '');
            if ($srcCatLower !== $targetCatLower) {
                $mappedGroups[] = $grp;
            }
        }
    }

    // For each mapped group, fetch live menu items from source category
    foreach ($mappedGroups as $grp) {
        $srcCat = $grp['source_category_name'] ?? '';
        $srcCatId = !empty($grp['source_category_id']) ? intval($grp['source_category_id']) : null;

        $itemsQuery = "
            SELECT m.id, m.name as item_name, m.name as title, m.img, m.category, COALESCE(v.price, m.price, 0) as price 
            FROM menu_items m 
            LEFT JOIN (SELECT menu_id, MIN(price) as price FROM menu_variants GROUP BY menu_id) v ON m.id = v.menu_id 
            WHERE (m.isAvailable = 1 OR m.isAvailable IS NULL)
        ";
        $params = [];

        if (!empty($srcCat)) {
            $itemsQuery .= " AND (LOWER(m.category) = ? OR LOWER(m.category) LIKE ?)";
            $params[] = strtolower($srcCat);
            $params[] = '%' . strtolower($srcCat) . '%';
        }

        if ($itemId > 0) {
            $itemsQuery .= " AND m.id != ?";
            $params[] = $itemId;
        }

        $itemsQuery .= " ORDER BY m.id ASC LIMIT 12";

        $iStmt = $db->prepare($itemsQuery);
        $iStmt->execute($params);
        $items = $iStmt->fetchAll(PDO::FETCH_ASSOC);

        if (!empty($items)) {
            $formattedItems = [];
            foreach ($items as $it) {
                $formattedItems[] = [
                    'id' => intval($it['id']),
                    'name' => $it['item_name'],
                    'title' => $it['item_name'],
                    'price' => floatval($it['price']),
                    'img' => $it['img'],
                    'category' => $it['category'],
                    'is_addon' => true
                ];
            }

            $addonGroups[] = [
                'id' => intval($grp['id']),
                'title' => $grp['title'],
                'subtitle' => $grp['subtitle'] ?: 'Select optional add-ons to complete your meal',
                'icon_type' => $grp['icon_type'] ?: 'addon',
                'source_category' => $srcCat,
                'items' => $formattedItems
            ];
        }
    }

    echo json_encode([
        'success' => true,
        'product_addons' => $productAddons,
        'addon_groups' => $addonGroups
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
        'product_addons' => [],
        'addon_groups' => []
    ]);
}
?>
