<?php
// ===== CONFIG.PHP - Database Connection & Helper Functions =====

// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// CORS Headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Database Configuration
$host = 'localhost';
$dbname = 'udayana_event';
$db_username = 'root';
$db_password = '';

// Create MySQLi connection
$conn = new mysqli($host, $db_username, $db_password, $dbname);

// Check connection
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Koneksi database gagal: ' . $conn->connect_error
    ]);
    exit;
}

// Set charset
$conn->set_charset("utf8mb4");

// ===== HELPER FUNCTIONS =====

/**
 * Send JSON response
 */
function sendResponse($success, $message, $data = []) {
    http_response_code($success ? 200 : 400);
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * Validate required fields
 */
function validateRequired($input, $requiredFields) {
    if (!is_array($input)) {
        return "Input tidak valid";
    }
    
    foreach ($requiredFields as $field) {
        if (!isset($input[$field]) || trim($input[$field]) === '') {
            return "Field '$field' wajib diisi!";
        }
    }
    return null;
}

/**
 * Sanitize input
 */
function sanitizeInput($data) {
    global $conn;
    return $conn->real_escape_string(trim($data));
}
?>