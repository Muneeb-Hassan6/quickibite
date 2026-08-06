<?php error_reporting(0);
include_once __DIR__ . '/../config/cors_headers.php';
include_once __DIR__ . '/../config/Database.php';

$database = new Database();
$db = $database->getConnection();

// Fetch Hero Sliders
$query_hero = "SELECT id, image_url, title, subtitle, link_url, sort_order FROM hero_sliders WHERE is_active = 1 ORDER BY sort_order ASC";
$stmt_hero = $db->prepare($query_hero);
$stmt_hero->execute();
$hero_sliders = $stmt_hero->fetchAll(PDO::FETCH_ASSOC);

// Fetch Homepage Sections Layout
$query_sections = "SELECT id, section_type, title, subtitle, image_url, link_url, content_data, slider_type, sort_order FROM homepage_sections WHERE is_active = 1 ORDER BY sort_order ASC";
$stmt_sections = $db->prepare($query_sections);
$stmt_sections->execute();
$homepage_sections = $stmt_sections->fetchAll(PDO::FETCH_ASSOC);

// Fetch Settings for homepage (hero position and empty message)
$query_settings = "SELECT setting_key, setting_value FROM settings WHERE setting_key IN ('hero_section_sort_order', 'empty_homepage_message')";
$stmt_settings = $db->prepare($query_settings);
$stmt_settings->execute();
$settings_result = $stmt_settings->fetchAll(PDO::FETCH_ASSOC);

$homepage_settings = [
    'hero_section_sort_order' => '0',
    'empty_homepage_message' => 'Homepage is currently empty. Add sections from the Admin Panel.'
];

foreach ($settings_result as $row) {
    if ($row['setting_key'] === 'hero_section_sort_order') {
        $homepage_settings['hero_section_sort_order'] = $row['setting_value'];
    }
    if ($row['setting_key'] === 'empty_homepage_message') {
        $homepage_settings['empty_homepage_message'] = $row['setting_value'];
    }
}

echo json_encode([
    "success" => true,
    "data" => [
        "hero_sliders" => $hero_sliders,
        "sections" => $homepage_sections,
        "settings" => $homepage_settings
    ]
]);
?>
