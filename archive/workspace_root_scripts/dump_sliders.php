<?php
$db = new mysqli('127.0.0.1', 'root', '', 'restaurant_db');
$res = $db->query("SELECT id, title, section_type, slider_type FROM homepage_sections");
while($row = $res->fetch_assoc()) {
    echo $row['id'] . " | " . $row['title'] . " | " . $row['section_type'] . " | " . $row['slider_type'] . "\n";
}
?>
