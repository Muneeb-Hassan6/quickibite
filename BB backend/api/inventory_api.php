<?php
include_once __DIR__ . '/../config/auth_middleware.php';

// Enforce authentication for all requests (except OPTIONS which CORS headers handles)
if ($_SERVER['REQUEST_METHOD'] !== 'OPTIONS') {
    if (in_array($_SERVER['REQUEST_METHOD'], ['POST', 'PUT', 'DELETE'])) {
        require_role(['Admin', 'Manager']);
    }
}

include_once '../config/Database.php';
$database = new Database();
$db = $database->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        $query = "SELECT * FROM inventory ORDER BY id DESC";
        $stmt = $db->prepare($query);
        $stmt->execute();
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"));
        if(!empty($data->name) && isset($data->price) && isset($data->stock)) {
            $query = "INSERT INTO inventory (name, price, stock, unit, threshold) VALUES (:name, :price, :stock, :unit, :threshold)";
            $stmt = $db->prepare($query);
            
            $unit = !empty($data->unit) ? $data->unit : 'pcs';
            $threshold = isset($data->threshold) ? $data->threshold : 10;

            $stmt->bindParam(":name", $data->name);
            $stmt->bindParam(":price", $data->price);
            $stmt->bindParam(":stock", $data->stock);
            $stmt->bindParam(":unit", $unit);
            $stmt->bindParam(":threshold", $threshold);
            
            if($stmt->execute()) echo json_encode(["status" => "success", "message" => "Item added.", "id" => $db->lastInsertId()]);
            else echo json_encode(["status" => "error", "message" => "Failed to add item."]);
        }
        break;

    case 'PUT':
        $data = json_decode(file_get_contents("php://input"));
        if(!empty($data->id) && !empty($data->name) && isset($data->price) && isset($data->stock)) {
            $query = "UPDATE inventory SET name=:name, price=:price, stock=:stock, unit=:unit, threshold=:threshold WHERE id=:id";
            $stmt = $db->prepare($query);
            
            $unit = !empty($data->unit) ? $data->unit : 'pcs';
            $threshold = isset($data->threshold) ? $data->threshold : 10;

            $stmt->bindParam(":name", $data->name);
            $stmt->bindParam(":price", $data->price);
            $stmt->bindParam(":stock", $data->stock);
            $stmt->bindParam(":unit", $unit);
            $stmt->bindParam(":threshold", $threshold);
            $stmt->bindParam(":id", $data->id);
            
            if($stmt->execute()) echo json_encode(["status" => "success", "message" => "Item updated."]);
            else echo json_encode(["status" => "error", "message" => "Failed to update item."]);
        }
        break;

    case 'DELETE':
        $id = isset($_GET['id']) ? $_GET['id'] : die();
        $query = "DELETE FROM inventory WHERE id=:id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":id", $id);
        if($stmt->execute()) echo json_encode(["status" => "success"]);
        break;
}
?>