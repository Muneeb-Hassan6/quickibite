<?php
include_once __DIR__ . '/../config/cors_headers.php';
include_once __DIR__ . '/../config/auth_middleware.php';
require_role(['Admin', 'Manager']);

include_once __DIR__ . '/../config/Database.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));
if (!$data || !isset($data->action)) {
    echo json_encode(["success" => false, "message" => "No action specified"]);
    exit;
}

$action = $data->action;

if ($action === 'update_order') {
    // Expecting $data->sections = [{id: 1, sort_order: 1}, ...]
    if (isset($data->sections)) {
        foreach ($data->sections as $sec) {
            $stmt = $db->prepare("UPDATE homepage_sections SET sort_order = :sort WHERE id = :id");
            $stmt->bindParam(':sort', $sec->sort_order);
            $stmt->bindParam(':id', $sec->id);
            $stmt->execute();
        }
    }
    if (isset($data->hero_sliders)) {
        foreach ($data->hero_sliders as $slide) {
            $stmt = $db->prepare("UPDATE hero_sliders SET sort_order = :sort WHERE id = :id");
            $stmt->bindParam(':sort', $slide->sort_order);
            $stmt->bindParam(':id', $slide->id);
            $stmt->execute();
        }
    }
    echo json_encode(["success" => true, "message" => "Order updated successfully"]);
}
elseif ($action === 'add_section') {
    $stmt = $db->prepare("INSERT INTO homepage_sections (section_type, title, subtitle, image_url, link_url, content_data, sort_order, slider_type) VALUES (:type, :title, :subtitle, :image, :link, :content, :sort, :slider_type)");
    $stmt->bindParam(':type', $data->section_type);
    $stmt->bindParam(':title', $data->title);
    $stmt->bindParam(':subtitle', $data->subtitle);
    $stmt->bindParam(':image', $data->image_url);
    $stmt->bindParam(':link', $data->link_url);
    $stmt->bindParam(':content', $data->content_data);
    $stmt->bindParam(':sort', $data->sort_order);
    $slider_type = isset($data->slider_type) ? $data->slider_type : 'regular';
    $stmt->bindParam(':slider_type', $slider_type);
    
    if($stmt->execute()){
        echo json_encode(["success" => true, "id" => $db->lastInsertId()]);
    } else {
        echo json_encode(["success" => false, "error" => $stmt->errorInfo()]);
    }
}
elseif ($action === 'delete_section') {
    $stmt = $db->prepare("DELETE FROM homepage_sections WHERE id = :id");
    $stmt->bindParam(':id', $data->id);
    $stmt->execute();
    echo json_encode(["success" => true]);
}
elseif ($action === 'add_hero') {
    $stmt = $db->prepare("INSERT INTO hero_sliders (image_url, title, subtitle, link_url, sort_order) VALUES (:image, :title, :subtitle, :link, :sort)");
    $stmt->bindParam(':image', $data->image_url);
    $stmt->bindParam(':title', $data->title);
    $stmt->bindParam(':subtitle', $data->subtitle);
    $stmt->bindParam(':link', $data->link_url);
    $stmt->bindParam(':sort', $data->sort_order);
    
    if($stmt->execute()){
        echo json_encode(["success" => true, "id" => $db->lastInsertId()]);
    } else {
        echo json_encode(["success" => false, "error" => $stmt->errorInfo()]);
    }
}
elseif ($action === 'delete_hero') {
    $stmt = $db->prepare("DELETE FROM hero_sliders WHERE id = :id");
    $stmt->bindParam(':id', $data->id);
    $stmt->execute();
    echo json_encode(["success" => true]);
}
elseif ($action === 'update_section') {
    $stmt = $db->prepare("UPDATE homepage_sections SET section_type=:type, title=:title, subtitle=:subtitle, image_url=:image, link_url=:link, content_data=:content, sort_order=:sort, slider_type=:slider_type WHERE id=:id");
    $stmt->bindParam(':type', $data->section_type);
    $stmt->bindParam(':title', $data->title);
    $stmt->bindParam(':subtitle', $data->subtitle);
    $stmt->bindParam(':image', $data->image_url);
    $stmt->bindParam(':link', $data->link_url);
    $stmt->bindParam(':content', $data->content_data);
    $stmt->bindParam(':sort', $data->sort_order);
    $slider_type = isset($data->slider_type) ? $data->slider_type : 'regular';
    $stmt->bindParam(':slider_type', $slider_type);
    $stmt->bindParam(':id', $data->id);
    
    if($stmt->execute()){
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["success" => false, "error" => $stmt->errorInfo()]);
    }
}
elseif ($action === 'update_hero') {
    $stmt = $db->prepare("UPDATE hero_sliders SET image_url=:image, title=:title, subtitle=:subtitle, link_url=:link, sort_order=:sort WHERE id=:id");
    $stmt->bindParam(':image', $data->image_url);
    $stmt->bindParam(':title', $data->title);
    $stmt->bindParam(':subtitle', $data->subtitle);
    $stmt->bindParam(':link', $data->link_url);
    $stmt->bindParam(':sort', $data->sort_order);
    $stmt->bindParam(':id', $data->id);
    
    if($stmt->execute()){
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["success" => false, "error" => $stmt->errorInfo()]);
    }
}
else {
    echo json_encode(["success" => false, "message" => "Unknown action"]);
}
?>
