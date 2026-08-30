<?php
if (!ob_get_level()) {
    ob_start();
}

$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';

// Allow any port on localhost or 127.0.0.1 dynamically via regex
if (preg_match('/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/', $origin)) {
    header("Access-Control-Allow-Origin: " . $origin);
    header("Access-Control-Allow-Credentials: true");
} elseif (!empty($origin)) {
    header("Access-Control-Allow-Origin: " . $origin);
    header("Access-Control-Allow-Credentials: true");
} else {
    header("Access-Control-Allow-Origin: *");
}

header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-Auth-Token");

// Handle preflight OPTIONS request
if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    if (ob_get_level()) ob_clean();
    exit();
}

header("Content-Type: application/json; charset=UTF-8");
?>
