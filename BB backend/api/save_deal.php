<?php
include_once __DIR__ . '/../config/cors_headers.php';
include_once __DIR__ . '/../config/auth_middleware.php';
// 3. Database Connection
include_once '../config/Database.php';
$database = new Database();
$db = $database->getConnection();

// 4. Get React Data
$data = json_decode(file_get_contents("php://input"));

if (!empty($data->title) && !empty($data->price)) {
    try {
        $db->beginTransaction();

        // Deal Insert
        $query = "INSERT INTO deals (title, price, img, is_permanent, start_time, end_time) 
                  VALUES (:title, :price, :img, :is_p, :s_time, :e_time)";
        $stmt = $db->prepare($query);
        
        $stmt->execute([
            ':title' => $data->title,
            ':price' => $data->price,
            ':img'   => $data->img,
            ':is_p'  => $data->is_permanent ? 1 : 0,
            ':s_time'=> $data->is_permanent ? null : $data->start_time,
            ':e_time'=> $data->is_permanent ? null : $data->end_time
        ]);
        
        $deal_id = $db->lastInsertId();

        // Deal k andar shamil Items Insert
        if(!empty($data->items)){
            $itemQuery = "INSERT INTO deal_items (deal_id, menu_item_id, variant_id, quantity) 
                          VALUES (:deal_id, :m_id, :v_id, :qty)";
            $itemStmt = $db->prepare($itemQuery);

            foreach ($data->items as $item) {
                $itemStmt->execute([
                    ':deal_id' => $deal_id,
                    ':m_id'    => $item->menu_item_id,
                    ':v_id'    => $item->variant_id ?? null,
                    ':qty'     => $item->qty ?? 1
                ]);
            }
        }

        $db->commit();
        echo json_encode(["success" => true, "message" => "Deal Saved Successfully!"]);

    } catch (Exception $e) {
        $db->rollBack();
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Title and Price are required!"]);
}
?>