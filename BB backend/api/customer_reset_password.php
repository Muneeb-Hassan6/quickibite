<?php
include_once __DIR__ . '/../config/cors_headers.php';
include_once __DIR__ . '/../config/Database.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents('php://input'), true);
if (!$data) {
    $data = $_POST;
}

$action = $data['action'] ?? 'request'; // 'request' | 'reset'
$identifier = trim($data['identifier'] ?? ($data['phone'] ?? ($data['email'] ?? '')));

if (empty($identifier)) {
    echo json_encode(['success' => false, 'message' => 'Phone or Email is required.']);
    exit();
}

try {
    if ($action === 'request') {
        $stmt = $db->prepare("SELECT id, full_name, email, phone FROM customer_users WHERE phone = :id OR email = :id LIMIT 1");
        $stmt->execute([':id' => $identifier]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            echo json_encode(['success' => false, 'message' => 'No account found with this phone/email.']);
            exit();
        }

        // Generate 6-digit verification code or token
        $otp = strval(rand(100000, 999999));
        $expires = date('Y-m-d H:i:s', strtotime('+15 minutes'));

        $up = $db->prepare("UPDATE customer_users SET reset_token = :token, reset_expires = :expires WHERE id = :id");
        $up->execute([
            ':token' => $otp,
            ':expires' => $expires,
            ':id' => $user['id']
        ]);

        echo json_encode([
            'success' => true,
            'message' => 'Reset code generated successfully! (In sandbox mode, use code: ' . $otp . ')',
            'reset_code' => $otp,
            'customer_id' => (int)$user['id']
        ]);
        exit();
    } elseif ($action === 'reset') {
        $otp = trim($data['reset_code'] ?? ($data['otp'] ?? ($data['token'] ?? '')));
        $newPassword = $data['new_password'] ?? ($data['password'] ?? '');

        if (empty($otp) || empty($newPassword)) {
            echo json_encode(['success' => false, 'message' => 'Reset code and new password are required.']);
            exit();
        }

        $stmt = $db->prepare("SELECT id, reset_expires FROM customer_users WHERE (phone = :id OR email = :id) AND reset_token = :token LIMIT 1");
        $stmt->execute([':id' => $identifier, ':token' => $otp]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            echo json_encode(['success' => false, 'message' => 'Invalid or expired reset code.']);
            exit();
        }

        if (!empty($user['reset_expires']) && strtotime($user['reset_expires']) < time()) {
            echo json_encode(['success' => false, 'message' => 'Reset code has expired. Please request a new one.']);
            exit();
        }

        $newHash = password_hash($newPassword, PASSWORD_BCRYPT);
        $up = $db->prepare("UPDATE customer_users SET password_hash = :hash, reset_token = NULL, reset_expires = NULL WHERE id = :id");
        $up->execute([':hash' => $newHash, ':id' => $user['id']]);

        echo json_encode([
            'success' => true,
            'message' => 'Password reset successfully! You can now log in with your new password.'
        ]);
        exit();
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
