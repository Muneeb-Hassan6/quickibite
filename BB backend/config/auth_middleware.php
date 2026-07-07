<?php
/**
 * Auth Middleware - JWT Token Verification
 * Include this file at the top of any protected API endpoint.
 * It will automatically reject requests without a valid token.
 * 
 * After including this file, the variable $auth_user will be available
 * containing the decoded token payload (user_id, role, name).
 */
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// central CORS preflight handling for authenticated routes
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once __DIR__ . '/JwtHelper.php';

$auth_user = null;

// 1. Extract Bearer Token from Authorization header
$headers = function_exists('getallheaders') ? getallheaders() : [];
$authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : 
              (isset($headers['authorization']) ? $headers['authorization'] : null);

if (!$authHeader && isset($_SERVER['HTTP_AUTHORIZATION'])) {
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
}

if (!$authHeader || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
    http_response_code(401);
    echo json_encode([
        "success" => false, 
        "message" => "Access denied. No authentication token provided.",
        "code" => "NO_TOKEN"
    ]);
    exit();
}

$token = $matches[1];

// 2. Verify the token
$decoded = JwtHelper::verifyToken($token);

if (!$decoded) {
    http_response_code(401);
    echo json_encode([
        "success" => false, 
        "message" => "Invalid or expired token. Please login again.",
        "code" => "INVALID_TOKEN"
    ]);
    exit();
}

// 3. Make user data available to the API endpoint
$auth_user = $decoded;

/**
 * Enforce RBAC: Verify if the current user has one of the allowed roles
 * @param array $allowed_roles - Array of string roles allowed to access the endpoint
 */
function require_role($allowed_roles) {
    global $auth_user;
    if (!$auth_user) {
        http_response_code(403);
        echo json_encode([
            "success" => false, 
            "message" => "Access denied. You do not have the required permissions.",
            "code" => "FORBIDDEN"
        ]);
        exit();
    }
    $user_role = strtolower($auth_user['role']);
    $allowed_lowercase = array_map('strtolower', $allowed_roles);
    if (!in_array($user_role, $allowed_lowercase)) {
        http_response_code(403);
        echo json_encode([
            "success" => false, 
            "message" => "Access denied. You do not have the required permissions.",
            "code" => "FORBIDDEN"
        ]);
        exit();
    }
}
?>
