<?php
include_once 'BB backend/config/Database.php';
$db = (new Database())->getConnection();
$stmt = $db->query("DESCRIBE orders");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
?>
