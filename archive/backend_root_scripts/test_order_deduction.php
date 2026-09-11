<?php
require 'config/Database.php';
$db = new Database();
$conn = $db->getConnection();

echo "=== PRE-ORDER STOCK CHECK ===\n";
$stmt = $conn->query("SELECT stock FROM inventory WHERE id = 5");
$before = $stmt->fetchColumn();
echo "Pizza Dough (ID 5) Stock BEFORE: $before\n\n";

echo "=== SIMULATING FRONTEND ORDER API REQUEST ===\n";
$orderData = [
    "cart" => [
        [
            "id" => "25-Small",
            "menuItemId" => 25,
            "name" => "Malai Boti",
            "size" => "Small",
            "qty" => 1,
            "price" => 500
        ]
    ],
    "totalAmount" => 500,
    "orderType" => "Takeaway",
    "customerName" => "API Test User",
    "customerMobile" => "1234567890"
];

$ch = curl_init('http://localhost/BB%20backend/api/create_order.php');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($orderData));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
$response = curl_exec($ch);
curl_close($ch);

echo "API Response: $response\n\n";

echo "=== POST-ORDER STOCK CHECK ===\n";
$stmt2 = $conn->query("SELECT stock FROM inventory WHERE id = 5");
$after = $stmt2->fetchColumn();
echo "Pizza Dough (ID 5) Stock AFTER: $after\n";

$diff = $before - $after;
echo "Deducted Amount: $diff\n";

?>
