<?php
include_once __DIR__ . '/../config/cors_headers.php';
include_once __DIR__ . '/../config/auth_middleware.php';
require_role(['Admin', 'Manager']);


include_once __DIR__ . '/../config/Database.php';
include_once __DIR__ . '/../models/Category.php';

$database = new Database();
$db = $database->getConnection();
$category = new Category($db);

$data = json_decode(file_get_contents("php://input"));

if(!empty($data->id)) {
    $category->id = $data->id;

    // Cloudinary Delete logic ke liye URL nikalna
    $query = "SELECT img FROM categories WHERE id = ?";
    $stmt = $db->prepare($query);
    $stmt->execute([$category->id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    $imageUrl = $row['img'] ?? '';

    // Database se Delete
    if($category->delete()){
        
        // Cloudinary se Delete (PRO LEVEL)
        if (!empty($imageUrl) && strpos($imageUrl, 'cloudinary.com') !== false) {
            // Cloudinary details loaded from env with hardcoded fallbacks
            $cloud_name = getenv('CLOUDINARY_CLOUD_NAME') ?: "dovuegkwa";
            $api_key = getenv('CLOUDINARY_API_KEY') ?: "188259856346934";
            $api_secret = getenv('CLOUDINARY_API_SECRET') ?: "_RWHAQbUhMHVXp4E5IgPIvIDjAI";

            $parts = explode('/', parse_url($imageUrl, PHP_URL_PATH));
            $filename = end($parts);
            $public_id = pathinfo($filename, PATHINFO_FILENAME);

            $timestamp = time();
            $signature = sha1("public_id=" . $public_id . "&timestamp=" . $timestamp . $api_secret);

            // cURL Connection
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, "https://api.cloudinary.com/v1_1/" . $cloud_name . "/image/destroy");
            curl_setopt($ch, CURLOPT_POST, TRUE);
            curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
                "public_id" => $public_id,
                "api_key" => $api_key,
                "timestamp" => $timestamp,
                "signature" => $signature
            ]));
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
            
            // Only bypass SSL validation in local development to prevent MitM in production
            $is_local = in_array($_SERVER['REMOTE_ADDR'] ?? '', ['127.0.0.1', '::1', 'localhost']);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, !$is_local); 
            curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, $is_local ? 0 : 2);

            $response = curl_exec($ch);
            
            // Agar phir bhi koi curl error aaye toh server crash nahi hoga
            if(curl_errno($ch)){
                error_log("cURL Error: " . curl_error($ch));
            }
            curl_close($ch);
        }

        http_response_code(200);
        echo json_encode(["success" => true, "message" => "Category deleted."]);
    } else {
        http_response_code(503);
        echo json_encode(["success" => false, "message" => "Unable to delete category."]);
    }
} else {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Category ID missing."]);
}
?>