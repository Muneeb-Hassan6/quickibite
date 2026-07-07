<?php
require 'config/Database.php';
$db = (new Database())->getConnection();

try {
    $db->beginTransaction();

    // Fetch all order items that have 0 cost
    $stmt = $db->query("SELECT * FROM order_items WHERE cost_price = 0.00");
    $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $updatedCount = 0;

    foreach ($items as $item) {
        $title = $item['title'];
        $size = $item['size'] ?: 'Regular';
        $item_id = $item['id'];

        // Find the menu_item_id
        $mStmt = $db->prepare("SELECT id FROM menu_items WHERE name = :title LIMIT 1");
        $mStmt->execute([':title' => $title]);
        $menu_id = $mStmt->fetchColumn();

        if ($menu_id) {
            // Find recipes
            $rStmt = $db->prepare("SELECT r.quantity_to_deduct, i.price FROM recipes r JOIN inventory i ON r.inventory_id = i.id WHERE r.menu_item_id = :mid AND r.variant_name = :size");
            $rStmt->execute([':mid' => $menu_id, ':size' => $size]);
            $recipes = $rStmt->fetchAll(PDO::FETCH_ASSOC);

            $cost = 0;
            foreach ($recipes as $r) {
                $cost += floatval($r['quantity_to_deduct']) * floatval($r['price']);
            }

            if ($cost > 0) {
                $uStmt = $db->prepare("UPDATE order_items SET cost_price = :cost WHERE id = :id");
                $uStmt->execute([':cost' => $cost, ':id' => $item_id]);
                $updatedCount++;
            }
        }
    }

    $db->commit();
    echo "Successfully backdated cost for $updatedCount order items.\n";
} catch (Exception $e) {
    $db->rollBack();
    echo "Error: " . $e->getMessage() . "\n";
}
?>
