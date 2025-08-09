<?php
header('Content-Type: application/json');
session_start();
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}
require_once 'db.php';

$data = json_decode(file_get_contents("php://input"), true);
$user_id = $_SESSION['user_id'];
$id = (int) ($data['id'] ?? 0);

if (!$id) {
    echo json_encode(['success' => false, 'message' => 'Invalid student ID.']);
    exit;
}

$stmt = $conn->prepare("DELETE FROM students WHERE id = ? AND user_id = ?");
$stmt->bind_param('ii', $id, $user_id);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Student deleted successfully.']);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to delete student.']);
}
$stmt->close();
$conn->close();
?>
