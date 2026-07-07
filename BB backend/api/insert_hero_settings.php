<?php
include_once 'c:/xampp/htdocs/BB backend/config/Database.php';
$db = (new Database())->getConnection();

$keys = [
    'hero_title' => 'WELCOME TO <span style="color:#ef4444;">BIG BITE!</span>',
    'hero_subtitle' => 'Fresh Food, Delivered Hot & Fast.',
    'hero_search_placeholder' => 'Search your favorite food...'
];

foreach ($keys as $key => $val) {
    // Check if exists
    $stmt = $db->prepare('SELECT COUNT(*) FROM settings WHERE setting_key = ?');
    $stmt->execute([$key]);
    if ($stmt->fetchColumn() == 0) {
        $stmt = $db->prepare('INSERT INTO settings (setting_key, setting_value) VALUES (?, ?)');
        $stmt->execute([$key, $val]);
    }
}
echo 'Success';
?>
