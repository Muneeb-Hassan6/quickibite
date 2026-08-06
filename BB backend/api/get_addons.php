<?php
include_once __DIR__ . '/../config/cors_headers.php';

include_once '../config/Database.php';
$database = new Database();
$db = $database->getConnection();

$menu_item_id = $_GET['menu_item_id'];

$query = "SELECT * FROM menu_addons WHERE menu_item_id = ?";
$stmt = $db->prepare($query);
$stmt->execute([$menu_item_id]);
$addons = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode(["status" => "success", "addons" => $addons]);
?>