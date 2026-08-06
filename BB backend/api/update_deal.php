<?php
include_once __DIR__ . '/../config/cors_headers.php';
include_once __DIR__ . '/../config/auth_middleware.php';
include_once '../config/Database.php';
$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->id) && !empty($data->title) && !empty($data->price)) {
    try {
        $db->beginTransaction();

        // 1. Deal ka main data update karein
        $query = "UPDATE deals SET title=:title, price=:price, img=:img, is_permanent=:is_p, start_time=:s_time, end_time=:e_time WHERE id=:id";
        $stmt = $db->prepare($query);
        $stmt->execute([
            ':title' => $data->title,
            ':price' => $data->price,
            ':img'   => $data->img,
            ':is_p'  => $data->is_permanent ? 1 : 0,
            ':s_time'=> $data->is_permanent ? null : $data->start_time,
            ':e_time'=> $data->is_permanent ? null : $data->end_time,
            ':id'    => $data->id
        ]);

        // 2. Deal Items update karein (Pehle purane delete, phir naye insert)
        if(isset($data->items)) {
            $delQuery = "DELETE FROM deal_items WHERE deal_id = :id";
            $delStmt = $db->prepare($delQuery);
            $delStmt->execute([':id' => $data->id]);

            if(count($data->items) > 0) {
                $itemQuery = "INSERT INTO deal_items (deal_id, menu_item_id, quantity) VALUES (:deal_id, :m_id, :qty)";
                $itemStmt = $db->prepare($itemQuery);
                foreach ($data->items as $item) {
                    $itemStmt->execute([
                        ':deal_id' => $data->id,
                        ':m_id'    => $item->menu_item_id,
                        ':qty'     => $item->qty ?? 1
                    ]);
                }
            }
        }

        $db->commit();
        echo json_encode(["success" => true, "message" => "Deal Updated Successfully!"]);
    } catch (Exception $e) {
        $db->rollBack();
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Incomplete data"]);
}
?>