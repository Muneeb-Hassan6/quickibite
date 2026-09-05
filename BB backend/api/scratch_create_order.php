<?php
include_once __DIR__ . '/../config/Database.php';
$db = (new Database())->getConnection();
$cols = $db->query("DESCRIBE payments")->fetchAll(PDO::FETCH_ASSOC);
echo json_encode(["payments_columns" => $cols]);
?>
