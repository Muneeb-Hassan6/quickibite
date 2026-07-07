<?php error_reporting(0);
include_once __DIR__ . '/../config/cors_headers.php';
include_once __DIR__ . '/../config/Database.php';

$database = new Database();
$db = $database->getConnection();

// Fetch Hero Sliders
$query_hero = "SELECT id, image_url, title, subtitle, link_url FROM hero_sliders WHERE is_active = 1 ORDER BY sort_order ASC";
$stmt_hero = $db->prepare($query_hero);
$stmt_hero->execute();
$hero_sliders = $stmt_hero->fetchAll(PDO::FETCH_ASSOC);

// Fetch Homepage Sections Layout
$query_sections = "SELECT id, section_type, title, subtitle, image_url, link_url, content_data, slider_type FROM homepage_sections WHERE is_active = 1 ORDER BY sort_order ASC";
$stmt_sections = $db->prepare($query_sections);
$stmt_sections->execute();
$homepage_sections = $stmt_sections->fetchAll(PDO::FETCH_ASSOC);

echo json_encode([
    "success" => true,
    "data" => [
        "hero_sliders" => $hero_sliders,
        "sections" => $homepage_sections
    ]
]);
?>
