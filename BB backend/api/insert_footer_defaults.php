<?php
include '../config/Database.php';
$db = (new Database())->getConnection();
$settings = [
    'footer_tagline' => 'Fresh Food, Delivered Hot & Fast. Experience the best taste in town with our premium quality ingredients.',
    'footer_facebook' => 'https://facebook.com',
    'footer_twitter' => 'https://twitter.com',
    'footer_instagram' => 'https://instagram.com',
    'footer_youtube' => 'https://youtube.com',
    'footer_phone' => '+1 234 567 8900',
    'footer_email' => 'support@bigbite.com'
];
foreach ($settings as $k => $v) {
    $stmt = $db->prepare('INSERT IGNORE INTO settings (setting_key, setting_value) VALUES (?, ?)');
    $stmt->execute([$k, $v]);
}
echo 'Done';
?>
