<?php
include_once __DIR__ . '/../config/cors_headers.php';
include_once __DIR__ . '/../config/auth_middleware.php';
require_role(['Admin', 'Manager']);
include_once __DIR__ . '/../config/Database.php';

$database = new Database();
$conn = $database->getConnection(); 

if (!$conn) {
    echo json_encode(["success" => false, "message" => "Database connection failed."]);
    exit();
}

$data = json_decode(file_get_contents("php://input"));

if(!empty($data->id) && !empty($data->name) && !empty($data->variants)) {
    $id = $data->id;
    $name = $data->name;
    $description = isset($data->description) ? $data->description : '';
    $category = isset($data->category) ? $data->category : '';
    $img = isset($data->img) ? $data->img : '';
    $isAvailable = !empty($data->isAvailable) ? 1 : 0;
    $isTopDeal = !empty($data->isTopDeal) ? 1 : 0;
    $isBestSeller = !empty($data->isBestSeller) ? 1 : 0;
    
    $slider_placements = isset($data->slider_placements) && is_array($data->slider_placements) ? $data->slider_placements : [];

    try {
        // 1. Update Main Item
        $query1 = "UPDATE menu_items SET name=?, description=?, category=?, img=?, isAvailable=?, isTopDeal=?, isBestSeller=? WHERE id=?";
        $stmt1 = $conn->prepare($query1);
        $stmt1->execute([$name, $description, $category, $img, $isAvailable, $isTopDeal, $isBestSeller, $id]);

        // 2. Delete Old Variants
        $delQuery = "DELETE FROM menu_variants WHERE menu_id=?";
        $delStmt = $conn->prepare($delQuery);
        $delStmt->execute([$id]);

        // 3. Insert New Variants (🔥 NAYI TABDEELI YAHAN HAI)
        $query2 = "INSERT INTO menu_variants (menu_id, size_name, price, in_stock) VALUES (?, ?, ?, ?)";
        $stmt2 = $conn->prepare($query2);
        
        foreach ($data->variants as $variant) {
            // 🔥 React se true/false aayega, usay MySQL ke liye 1 ya 0 mein badla
            $inStock = (isset($variant->inStock) && $variant->inStock !== false) ? 1 : 0;
            
            $stmt2->execute([$id, $variant->size, $variant->price, $inStock]);
        }

        // 4. Update Custom Sliders (slider_placements)
        // Fetch all custom product sliders
        $sliderQuery = "SELECT id, content_data FROM homepage_sections WHERE section_type = 'product_slider' AND content_data LIKE 'custom:%'";
        $sliderStmt = $conn->prepare($sliderQuery);
        $sliderStmt->execute();
        $customSliders = $sliderStmt->fetchAll(PDO::FETCH_ASSOC);

        $updateSliderStmt = $conn->prepare("UPDATE homepage_sections SET content_data = ? WHERE id = ?");

        foreach ($customSliders as $slider) {
            // e.g. "custom:1,4,10" -> "1,4,10" -> array(1, 4, 10)
            $contentStr = str_replace('custom:', '', $slider['content_data']);
            $currentIds = $contentStr !== '' ? explode(',', $contentStr) : [];
            $currentIds = array_map('intval', $currentIds);

            $sliderId = (int)$slider['id'];
            $shouldInclude = in_array($sliderId, $slider_placements);
            $currentIndex = array_search((int)$id, $currentIds);
            
            if ($shouldInclude && $currentIndex === false) {
                // Add product to slider
                $currentIds[] = (int)$id;
            } elseif (!$shouldInclude && $currentIndex !== false) {
                // Remove product from slider
                unset($currentIds[$currentIndex]);
                $currentIds = array_values($currentIds); // Re-index array
            }

            // Always recreate the string and update
            $newContentData = 'custom:' . implode(',', $currentIds);
            $updateSliderStmt->execute([$newContentData, $sliderId]);
        }

        echo json_encode(["success" => true, "message" => "Item updated successfully."]);
    } catch (PDOException $e) {
        echo json_encode(["success" => false, "message" => "Database Error: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Incomplete data."]);
}
$conn = null;
?>