<?php
// ===== LOGIN.PHP - User Login =====

require_once '../config.php';

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

// Validate input
$error = validateRequired($input, ['username', 'password']);
if ($error) {
    sendResponse(false, $error);
}

$username = trim($input['username']);
$password = $input['password'];

// Check if username is email
$isEmail = filter_var($username, FILTER_VALIDATE_EMAIL);

// Prepare query based on input type
if ($isEmail) {
    $stmt = $conn->prepare("SELECT id, username, email, password, role FROM users WHERE email = ?");
} else {
    $stmt = $conn->prepare("SELECT id, username, email, password, role FROM users WHERE username = ?");
}

$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    sendResponse(false, 'Username atau email tidak ditemukan!');
}

$user = $result->fetch_assoc();

// Verify password
if (!password_verify($password, $user['password'])) {
    sendResponse(false, 'Password salah!');
}

// Remove password from response
unset($user['password']);

// Login successful
sendResponse(true, 'Login berhasil!', [
    'user' => $user
]);

$stmt->close();
$conn->close();
?>