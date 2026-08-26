<?php
if (!ob_get_level()) {
    ob_start();
}

include_once __DIR__ . '/../config/cors_headers.php';
include_once __DIR__ . '/../config/Database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        throw new Exception("Unable to connect to database.");
    }

    // Auto-create inventory table if missing
    $tableCheck = "CREATE TABLE IF NOT EXISTS inventory (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        stock DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        unit VARCHAR(50) NOT NULL DEFAULT 'pcs',
        threshold DECIMAL(10,2) NOT NULL DEFAULT 10.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )";
    $db->exec($tableCheck);

    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

    switch ($method) {
        case 'GET':
            $query = "SELECT * FROM inventory ORDER BY id DESC";
            $stmt = $db->prepare($query);
            $stmt->execute();
            $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

            if (ob_get_level()) ob_clean();
            echo json_encode($items ?: []);
            exit();

        case 'POST':
            $rawInput = file_get_contents("php://input");
            $data = json_decode($rawInput, true);
            if (!$data && !empty($_POST)) {
                $data = $_POST;
            }

            $name = trim($data['name'] ?? '');
            $price = isset($data['price']) ? floatval($data['price']) : null;
            $stock = isset($data['stock']) ? floatval($data['stock']) : null;
            $unit = !empty($data['unit']) ? trim($data['unit']) : 'pcs';
            $threshold = isset($data['threshold']) ? floatval($data['threshold']) : 10;

            if (empty($name) || $price === null || $stock === null) {
                throw new Exception("Name, price, and stock are required fields.");
            }

            $query = "INSERT INTO inventory (name, price, stock, unit, threshold) VALUES (:name, :price, :stock, :unit, :threshold)";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":name", $name);
            $stmt->bindParam(":price", $price);
            $stmt->bindParam(":stock", $stock);
            $stmt->bindParam(":unit", $unit);
            $stmt->bindParam(":threshold", $threshold);

            if ($stmt->execute()) {
                if (ob_get_level()) ob_clean();
                echo json_encode([
                    "status" => "success",
                    "message" => "Item added successfully.",
                    "id" => $db->lastInsertId()
                ]);
                exit();
            } else {
                throw new Exception("Failed to add inventory item.");
            }

        case 'PUT':
            $rawInput = file_get_contents("php://input");
            $data = json_decode($rawInput, true);
            if (!$data && !empty($_POST)) {
                $data = $_POST;
            }

            $id = isset($data['id']) ? intval($data['id']) : 0;
            $name = trim($data['name'] ?? '');
            $price = isset($data['price']) ? floatval($data['price']) : null;
            $stock = isset($data['stock']) ? floatval($data['stock']) : null;
            $unit = !empty($data['unit']) ? trim($data['unit']) : 'pcs';
            $threshold = isset($data['threshold']) ? floatval($data['threshold']) : 10;

            if ($id <= 0 || empty($name) || $price === null || $stock === null) {
                throw new Exception("Valid ID, name, price, and stock are required.");
            }

            $query = "UPDATE inventory SET name=:name, price=:price, stock=:stock, unit=:unit, threshold=:threshold WHERE id=:id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":name", $name);
            $stmt->bindParam(":price", $price);
            $stmt->bindParam(":stock", $stock);
            $stmt->bindParam(":unit", $unit);
            $stmt->bindParam(":threshold", $threshold);
            $stmt->bindParam(":id", $id);

            if ($stmt->execute()) {
                if (ob_get_level()) ob_clean();
                echo json_encode([
                    "status" => "success",
                    "message" => "Item updated successfully."
                ]);
                exit();
            } else {
                throw new Exception("Failed to update inventory item.");
            }

        case 'DELETE':
            $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
            if ($id <= 0) {
                // Check JSON body if id is not in query params
                $data = json_decode(file_get_contents("php://input"), true);
                $id = isset($data['id']) ? intval($data['id']) : 0;
            }

            if ($id <= 0) {
                throw new Exception("Valid item ID is required for deletion.");
            }

            $query = "DELETE FROM inventory WHERE id=:id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":id", $id);

            if ($stmt->execute()) {
                if (ob_get_level()) ob_clean();
                echo json_encode([
                    "status" => "success",
                    "message" => "Item deleted successfully."
                ]);
                exit();
            } else {
                throw new Exception("Failed to delete inventory item.");
            }

        default:
            http_response_code(405);
            throw new Exception("Method not allowed.");
    }
} catch (Exception $e) {
    if (ob_get_level()) ob_clean();
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage(),
        "data" => []
    ]);
    exit();
}
?>