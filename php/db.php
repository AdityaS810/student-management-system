<?php
$db_host = 'sql109.infinityfree.com';
$db_user = 'if0_39664741';
$db_pass = 'jGPyAInQI3gQM'; 
$db_name = 'if0_39664741_Student_management';

$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$conn->set_charset("utf8mb4");
?>
