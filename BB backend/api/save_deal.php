<?php
include_once __DIR__ . '/../config/cors_headers.php';
include_once __DIR__ . '/../config/auth_middleware.php';
include_once '../config/Database.php';

$database = new Database();
$db = $database->getConnection();

// Auto-migrate columns if missing
try {
    $cols = [
        'promo_banner_image' => 'VARCHAR(255) NULL',
        'is_featured_banner' => 'TINYINT(1) DEFAULT 0',
        'banner_order' => 'INT DEFAULT 0'
    ];
    foreach ($cols as $col => $def) {
        $c = $db->query("SHOW COLUMNS FROM deals LIKE '$col'")->fetch();
        if (!$c) {
            $db->exec("ALTER TABLE deals ADD COLUMN `$col` $def");
        }
    }
} catch (Exception $e) {}

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->title) && !empty($data->price)) {
    try {
        $db->beginTransaction();

        $badgeTag = $data->badge_tag ?? $data->tag ?? 'VALUE PACK';
        $promoBannerImage = $data->promo_banner_image ?? null;
        $isFeaturedBanner = !empty($data->is_featured_banner) ? 1 : 0;
        $bannerOrder = intval($data->banner_order ?? 0);

        // Deal Insert
        $query = "INSERT INTO deals (title, description, price, original_price, badge_tag, tag, img, promo_banner_image, is_featured_banner, banner_order, is_permanent, start_time, end_time, is_active) 
                  VALUES (:title, :description, :price, :original_price, :badge_tag, :tag, :img, :promo_img, :is_featured, :b_order, :is_p, :s_time, :e_time, 1)";
        $stmt = $db->prepare($query);
        
        $stmt->execute([
            ':title' => $data->title,
            ':description' => $data->description ?? '',
            ':price' => $data->price,
            ':original_price' => $data->original_price ?? null,
            ':badge_tag' => $badgeTag,
            ':tag' => $badgeTag,
            ':img'   => $data->img ?? '',
            ':promo_img' => $promoBannerImage,
            ':is_featured' => $isFeaturedBanner,
            ':b_order' => $bannerOrder,
            ':is_p'  => !empty($data->is_permanent) ? 1 : 0,
            ':s_time'=> !empty($data->is_permanent) ? null : ($data->start_time ?? null),
            ':e_time'=> !empty($data->is_permanent) ? null : ($data->end_time ?? null)
        ]);
        
        $deal_id = $db->lastInsertId();

        // Deal items Insert
        if (!empty($data->items) && is_array($data->items)) {
            $itemQuery = "INSERT INTO deal_items 
                          (deal_id, item_title, quantity, is_customizable, choice_group_name, options_json) 
                          VALUES (:deal_id, :item_title, :qty, :is_customizable, :choice_group_name, :options_json)";
            $itemStmt = $db->prepare($itemQuery);

            foreach ($data->items as $item) {
                $item = (object)$item;
                $optionsJson = null;
                if (!empty($item->options)) {
                    $optionsJson = is_array($item->options) ? json_encode($item->options) : json_encode(array_map('trim', explode(',', $item->options)));
                }

                $itemStmt->execute([
                    ':deal_id' => $deal_id,
                    ':item_title' => $item->item_title ?? $item->name ?? 'Included Item',
                    ':qty' => intval($item->quantity ?? $item->qty ?? 1),
                    ':is_customizable' => !empty($item->is_customizable) ? 1 : 0,
                    ':choice_group_name' => !empty($item->choice_group_name) ? $item->choice_group_name : null,
                    ':options_json' => $optionsJson
                ]);
            }
        }

        $db->commit();
        echo json_encode(["success" => true, "message" => "Deal Created Successfully!", "deal_id" => $deal_id]);

    } catch (Exception $e) {
        $db->rollBack();
        echo json_encode(["success" => false, "message" => "DB Error: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Deal Title and Price are required!"]);
}
?>