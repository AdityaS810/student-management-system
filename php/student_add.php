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
$roll = trim($data['roll'] ?? '');
$name = trim($data['name'] ?? '');
$course = trim($data['course'] ?? '');
$year = (int) ($data['year'] ?? 0);
$email = trim($data['email'] ?? '');

if (!$roll || !$name || !$course || !$year || !$email) {
    echo json_encode(['success' => false, 'message' => 'Please fill all fields.']);
    exit;
}

if ($year < 2020 || $year > 2025) {
    echo json_encode(['success' => false, 'message' => 'Year must be between 2020 and 2025.']);
    exit;
}

$stmt = $conn->prepare("SELECT id FROM students WHERE user_id = ? AND (roll = ? OR email = ?)");
$stmt->bind_param('iss', $user_id, $roll, $email);
$stmt->execute();
$stmt->store_result();
if ($stmt->num_rows > 0) {
    echo json_encode(['success' => false, 'message' => 'Roll number or email already exists.']);
    exit;
}
$stmt->close();

$stmt = $conn->prepare("INSERT INTO students (user_id, roll, name, course, year, email) VALUES (?, ?, ?, ?, ?, ?)");
$stmt->bind_param('isssis', $user_id, $roll, $name, $course, $year, $email);
$success = $stmt->execute();

if ($success) {
    echo json_encode(['success' => true, 'message' => 'Student added successfully.']);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to add student.']);
}
$stmt->close();
$conn->close();
?>
