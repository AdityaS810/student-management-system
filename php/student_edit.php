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
$roll = trim($data['roll'] ?? '');
$name = trim($data['name'] ?? '');
$course = trim($data['course'] ?? '');
$year = (int) ($data['year'] ?? 0);
$email = trim($data['email'] ?? '');

if (!$id || !$roll || !$name || !$course || !$year || !$email) {
    echo json_encode(['success' => false, 'message' => 'Please fill all fields.']);
    exit;
}

if ($year < 2020 || $year > 2025) {
    echo json_encode(['success' => false, 'message' => 'Year must be between 2020 and 2025.']);
    exit;
}

$stmt = $conn->prepare("SELECT id FROM students WHERE user_id = ? AND (roll = ? OR email = ?) AND id <> ?");
$stmt->bind_param('issi', $user_id, $roll, $email, $id);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows > 0) {
    echo json_encode(['success' => false, 'message' => 'Roll number or email already exists.']);
    exit;
}
$stmt->close();

$stmt = $conn->prepare("UPDATE students SET roll = ?, name = ?, course = ?, year = ?, email = ? WHERE id = ? AND user_id = ?");
$stmt->bind_param('sssisis', $roll, $name, $course, $year, $email, $id, $user_id);
$success = $stmt->execute();

if ($success) {
    echo json_encode(['success' => true, 'message' => 'Student updated successfully.']);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to update student.']);
}
$stmt->close();
$conn->close();
?>
