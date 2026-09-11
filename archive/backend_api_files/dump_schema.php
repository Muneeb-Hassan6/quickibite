<?php
$conn = new mysqli('127.0.0.1', 'root', '', 'restaurant_db');
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$tables = [];
$res = $conn->query("SHOW TABLES");
while ($row = $res->fetch_row()) {
    $tables[] = $row[0];
}

foreach (['menu_addons', 'inventory'] as $table) {
    if (in_array($table, $tables)) {
        echo "TABLE: $table\n";
        $res = $conn->query("DESCRIBE $table");
        while ($row = $res->fetch_assoc()) {
            echo "  {$row['Field']} ({$row['Type']})\n";
        }
        echo "\n";
    }
}
$conn->close();
?>
