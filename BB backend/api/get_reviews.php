<?php
include_once __DIR__ . '/../config/cors_headers.php';
include_once __DIR__ . '/../config/Database.php';

$database = new Database();
$db = $database->getConnection();

$menuId = isset($_GET['menu_id']) ? (int)$_GET['menu_id'] : 0;
$featured = isset($_GET['featured']) ? (int)$_GET['featured'] : 0;
$orderId = isset($_GET['order_id']) ? (int)$_GET['order_id'] : 0;
$limit = isset($_GET['limit']) ? min((int)$_GET['limit'], 100) : 50;

try {
    // If querying specific order review
    if ($orderId > 0) {
        $stmt = $db->prepare("SELECT * FROM order_reviews WHERE order_id = :oid LIMIT 1");
        $stmt->execute([':oid' => $orderId]);
        $rev = $stmt->fetch(PDO::FETCH_ASSOC);
        echo json_encode([
            'success' => true,
            'has_reviewed' => !empty($rev),
            'review' => $rev ? $rev : null
        ]);
        exit();
    }

    // Build general query for approved reviews
    $sql = "SELECT r.*, o.order_type, o.created_at AS order_date 
            FROM order_reviews r
            LEFT JOIN orders o ON r.order_id = o.id
            WHERE r.status = 'approved'";
    $params = [];

    if ($featured) {
        $sql .= " AND r.is_featured = 1";
    }

    $sql .= " ORDER BY r.is_featured DESC, r.id DESC LIMIT " . $limit;
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $reviews = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Filter by menu item in PHP if menu_id requested
    if ($menuId > 0) {
        $filtered = [];
        foreach ($reviews as $rev) {
            if (!empty($rev['item_ratings'])) {
                $items = json_decode($rev['item_ratings'], true);
                if (is_array($items)) {
                    foreach ($items as $it) {
                        if ((int)($it['menu_id'] ?? 0) === $menuId) {
                            $filtered[] = $rev;
                            break;
                        }
                    }
                }
            } else {
                $filtered[] = $rev; // Include general store reviews
            }
        }
        $reviews = $filtered;
    }

    // Calculate global metrics & menu ratings map
    $statsQuery = $db->query("SELECT 
                                COUNT(*) AS total_reviews,
                                COALESCE(AVG(rating), 5.0) AS average_rating,
                                SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) AS count_5,
                                SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) AS count_4,
                                SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) AS count_3,
                                SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) AS count_2,
                                SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) AS count_1
                             FROM order_reviews WHERE status = 'approved'");
    $stats = $statsQuery->fetch(PDO::FETCH_ASSOC);

    // Build item-level rating cache from recent 200 reviews
    $allReviewsQuery = $db->query("SELECT item_ratings, rating FROM order_reviews WHERE status = 'approved' AND item_ratings IS NOT NULL ORDER BY id DESC LIMIT 200");
    $menuRatingsMap = [];

    if ($allReviewsQuery) {
        while ($row = $allReviewsQuery->fetch(PDO::FETCH_ASSOC)) {
            $parsed = json_decode($row['item_ratings'], true);
            if (is_array($parsed)) {
                foreach ($parsed as $it) {
                    $mId = (int)($it['menu_id'] ?? 0);
                    $mRating = floatval($it['rating'] ?? $row['rating']);
                    if ($mId > 0 && $mRating >= 1) {
                        if (!isset($menuRatingsMap[$mId])) {
                            $menuRatingsMap[$mId] = ['sum' => 0, 'count' => 0];
                        }
                        $menuRatingsMap[$mId]['sum'] += $mRating;
                        $menuRatingsMap[$mId]['count'] += 1;
                    }
                }
            }
        }
    }

    $finalMenuRatings = [];
    foreach ($menuRatingsMap as $mId => $data) {
        $finalMenuRatings[$mId] = [
            'rating' => round($data['sum'] / max(1, $data['count']), 1),
            'count' => $data['count']
        ];
    }

    echo json_encode([
        'success' => true,
        'reviews' => $reviews,
        'stats' => [
            'total_reviews' => (int)($stats['total_reviews'] ?? 0),
            'average_rating' => round(floatval($stats['average_rating'] ?? 5.0), 1),
            'rating_breakdown' => [
                '5' => (int)($stats['count_5'] ?? 0),
                '4' => (int)($stats['count_4'] ?? 0),
                '3' => (int)($stats['count_3'] ?? 0),
                '2' => (int)($stats['count_2'] ?? 0),
                '1' => (int)($stats['count_1'] ?? 0),
            ]
        ],
        'menu_ratings' => $finalMenuRatings
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
