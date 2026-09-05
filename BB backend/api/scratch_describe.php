<?php
$conn = new mysqli('127.0.0.1', 'root', '', 'restaurant_db');
$res = $conn->query("SELECT s.id, s.name, s.role, s.shift_status, r.staff_id, r.lat, r.lng, r.trips_completed FROM staff s LEFT JOIN rider r ON s.id = r.staff_id WHERE s.role = 'Rider'");
while ($row = $res->fetch_assoc()) {
    echo json_encode($row) . "\n";
}
$conn->close();
?>
