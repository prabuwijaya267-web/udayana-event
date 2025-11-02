<?php
// ===== REGISTER.PHP - User Registration =====

require_once '../config.php';

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

// Validate input
$error = validateRequired($input, ['username', 'email', 'password']);
if ($error) {
    sendResponse(false, $error);
}

$username = trim($input['username']);
$email = trim($input['email']);
$password = $input['password'];

// Validate username length
if (strlen($username) < 4) {
    sendResponse(false, 'Username minimal 4 karakter!');
}

// Validate email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    sendResponse(false, 'Format email tidak valid!');
}

// Validate password length
if (strlen($password) < 6) {
    sendResponse(false, 'Password minimal 6 karakter!');
}

// Check if username already exists
$stmt = $conn->prepare("SELECT id FROM users WHERE username = ?");
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    sendResponse(false, 'Username sudah digunakan!');
}

// Check if email already exists
$stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    sendResponse(false, 'Email sudah terdaftar!');
}

// Hash password
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

// Insert new user
$stmt = $conn->prepare("INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, 'user')");
$stmt->bind_param("sss", $username, $email, $hashedPassword);

if ($stmt->execute()) {
    sendResponse(true, 'Registrasi berhasil! Silakan login.', [
        'user_id' => $stmt->insert_id
    ]);
} else {
    sendResponse(false, 'Registrasi gagal! ' . $stmt->error);
}

$stmt->close();
$conn->close();
?>