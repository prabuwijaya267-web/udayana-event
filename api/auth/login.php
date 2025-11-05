<?php
// ===== LOGIN.PHP - User Login =====

require_once '../config.php';

// Get JSON input
$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput, true);

// Log untuk debugging
error_log("Login Input: " . $rawInput);

// Validate input
$error = validateRequired($input, ['username', 'password']);
if ($error) {
    sendResponse(false, $error);
}

$username = sanitizeInput($input['username']);
$password = $input['password'];

// Check if username is email
$isEmail = filter_var($username, FILTER_VALIDATE_EMAIL);

// Prepare query based on input type
if ($isEmail) {
    $stmt = $conn->prepare("SELECT id, username, email, password, role FROM users WHERE email = ?");
} else {
    $stmt = $conn->prepare("SELECT id, username, email, password, role FROM users WHERE username = ?");
}

if (!$stmt) {
    sendResponse(false, 'Database error: ' . $conn->error);
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

// ✅ KONSISTEN: Langsung return user tanpa nested data
sendResponse(true, 'Login berhasil!', [
    'user' => $user
]);

$stmt->close();
$conn->close();
?>