<?php
require 'config/Database.php';
$db = new Database();
$conn = $db->getConnection();

$tables = ['inventory', 'recipes', 'menu_items', 'orders', 'order_items'];
foreach($tables as $t) {
    try {
        $stmt = $conn->query("DESCRIBE $t");
        echo "TABLE $t:\n";
        print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
        echo "\n";
    } catch(Exception $e) {}
}
?>
