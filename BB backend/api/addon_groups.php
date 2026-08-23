<?php
include_once __DIR__ . '/../config/cors_headers.php';
include_once '../config/Database.php';

$database = new Database();
$db = $database->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    if (isset($_GET['action']) && $_GET['action'] === 'get_for_product') {
        // Fetch addon categories for a specific product category
        $category = $_GET['category'] ?? '';
        $query = "SELECT id, addon_category as name, custom_label, selection_type as type, is_required 
                  FROM category_addons 
                  WHERE target_category = ?";
        $stmt = $db->prepare($query);
        $stmt->execute([$category]);
        $groups = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($groups as &$group) {
            $addonCat = $group['name'];
            $itemQuery = "SELECT id, title as item_name, price, image as img FROM menu_items WHERE category = ?";
            $itemStmt = $db->prepare($itemQuery);
            $itemStmt->execute([$addonCat]);
            
            // Format to match old addon group items structure
            $items = $itemStmt->fetchAll(PDO::FETCH_ASSOC);
            $formattedItems = [];
            foreach ($items as $item) {
                $formattedItems[] = [
                    'id' => $item['id'], // Menu Item ID
                    'item_name' => $item['item_name'],
                    'price' => floatval($item['price']),
                    'img' => $item['img'],
                    'is_menu_item' => true // Flag for cart logic
                ];
            }
            $group['items'] = $formattedItems;
        }

        echo json_encode(['status' => 'success', 'addon_groups' => $groups]);
    } else {
        // Fetch all category mappings for admin panel
        $query = "SELECT * FROM category_addons ORDER BY target_category";
        $stmt = $db->prepare($query);
        $stmt->execute();
        $mappings = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Group by target_category
        $grouped = [];
        foreach ($mappings as $map) {
            $target = $map['target_category'];
            if (!isset($grouped[$target])) {
                $grouped[$target] = [
                    'target_category' => $target,
                    'addons' => []
                ];
            }
            $grouped[$target]['addons'][] = [
                'id' => $map['id'],
                'addon_category' => $map['addon_category'],
                'custom_label' => $map['custom_label'],
                'selection_type' => $map['selection_type'],
                'is_required' => $map['is_required'] == 1
            ];
        }

        echo json_encode(['status' => 'success', 'category_addons' => array_values($grouped)]);
    }
} elseif ($method === 'POST') {
    // Admin creates/updates a category mapping
    $data = json_decode(file_get_contents("php://input"), true);
    $action = $data['action'] ?? '';

    if ($action === 'save_mapping') {
        $db->beginTransaction();
        try {
            $targetCategory = $data['target_category'];
            $addons = $data['addons'] ?? [];

            // First, delete existing mappings for this target_category
            $delStmt = $db->prepare("DELETE FROM category_addons WHERE target_category = ?");
            $delStmt->execute([$targetCategory]);

            // Then insert new mappings
            if (!empty($addons)) {
                $insStmt = $db->prepare("INSERT INTO category_addons (target_category, addon_category, custom_label, selection_type, is_required) VALUES (?, ?, ?, ?, ?)");
                foreach ($addons as $addon) {
                    $insStmt->execute([
                        $targetCategory, 
                        $addon['addon_category'], 
                        $addon['custom_label'] ?? null,
                        $addon['selection_type'], 
                        $addon['is_required'] ? 1 : 0
                    ]);
                }
            }

            $db->commit();
            echo json_encode(['status' => 'success', 'message' => 'Category addons saved successfully.']);
        } catch (Exception $e) {
            $db->rollBack();
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    } elseif ($action === 'delete_mapping') {
        // Delete all mappings for a target category
        $targetCategory = $data['target_category'];
        $stmt = $db->prepare("DELETE FROM category_addons WHERE target_category = ?");
        if ($stmt->execute([$targetCategory])) {
            echo json_encode(['status' => 'success', 'message' => 'Mapping deleted.']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Failed to delete.']);
        }
    }
}
?>
