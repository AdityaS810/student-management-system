<?php
header('Content-Type: application/json');
session_start();
require_once 'db.php';

$data = json_decode(file_get_contents("php://input"), true);
$username = trim($data['username'] ?? '');
$password = trim($data['password'] ?? '');

if (!$username || !$password) {
    echo json_encode(['success' => false, 'message' => 'Username and password are required.']);
    exit;
}

$stmt = $conn->prepare("SELECT id, password FROM users WHERE username = ?");
$stmt->bind_param('s', $username);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'Invalid username or password.']);
    exit;
}

$stmt->bind_result($user_id, $hashed_password);
$stmt->fetch();

if (password_verify($password, $hashed_password)) {
    $_SESSION['user_id'] = $user_id;
    $_SESSION['username'] = $username;
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid username or password.']);
}

$stmt->close();
$conn->close();
?>
