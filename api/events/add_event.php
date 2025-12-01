<?php
// ===== ADD_EVENT.PHP - Create new event with image upload =====

require_once '../config.php';

// Validate request method
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Invalid request method');
}

// Get user from session/token (simplified - in production use JWT)
$user = json_decode(file_get_contents('php://input'), true);

// For multipart/form-data, use $_POST instead
$input = $_POST;

// Validate required fields
$requiredFields = ['user_id', 'title', 'date', 'time', 'location', 'category', 'description', 'organizer', 'capacity'];
$error = validateRequired($input, $requiredFields);

if ($error) {
    sendResponse(false, $error);
}

// Sanitize inputs
$userId = (int)sanitizeInput($input['user_id']);
$title = sanitizeInput($input['title']);
$date = sanitizeInput($input['date']);
$time = sanitizeInput($input['time']);
$location = sanitizeInput($input['location']);
$category = sanitizeInput($input['category']);
$description = sanitizeInput($input['description']);
$organizer = sanitizeInput($input['organizer']);
$capacity = (int)sanitizeInput($input['capacity']);

// Optional fields
$faculty = isset($input['faculty']) ? sanitizeInput($input['faculty']) : null;
$studyProgram = isset($input['study_program']) ? sanitizeInput($input['study_program']) : null;

// Handle image upload
$imagePath = null;

if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
    // Upload directory
    $uploadDir = '../../uploads/events/';
    
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }
    
    $file = $_FILES['image'];
    
    // Validate file type
    $allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    $fileType = mime_content_type($file['tmp_name']);
    
    if (!in_array($fileType, $allowedTypes)) {
        sendResponse(false, 'Format gambar tidak didukung. Gunakan JPG, PNG, GIF, atau WebP');
    }
    
    // Validate file size (max 5MB)
    $maxFileSize = 5 * 1024 * 1024;
    if ($file['size'] > $maxFileSize) {
        sendResponse(false, 'Ukuran gambar maksimal 5MB');
    }
    
    // Validate dimensions
    $imageInfo = getimagesize($file['tmp_name']);
    if ($imageInfo === false) {
        sendResponse(false, 'File bukan gambar yang valid');
    }
    
    list($width, $height) = $imageInfo;
    
    if ($width < 600 || $height < 400) {
        sendResponse(false, 'Dimensi gambar minimal 600x400px');
    }
    
    if ($width > 2000 || $height > 2000) {
        sendResponse(false, 'Dimensi gambar maksimal 2000x2000px');
    }
    
    // Generate unique filename
    $fileExtension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $timestamp = time();
    $randomString = bin2hex(random_bytes(8));
    $newFileName = "event_{$timestamp}_{$randomString}.{$fileExtension}";
    $uploadPath = $uploadDir . $newFileName;
    
    // Move uploaded file
    if (!move_uploaded_file($file['tmp_name'], $uploadPath)) {
        sendResponse(false, 'Gagal menyimpan gambar');
    }
    
    $imagePath = "uploads/events/{$newFileName}";
    
    error_log("Image uploaded: {$imagePath}");
}

// Validate date (must be future date)
$eventDate = strtotime($date);
$today = strtotime(date('Y-m-d'));

if ($eventDate < $today) {
    sendResponse(false, 'Tanggal event harus di masa depan');
}

// Validate capacity
if ($capacity < 1) {
    sendResponse(false, 'Kapasitas minimal 1 orang');
}

// Insert into database
$sql = "INSERT INTO events (user_id, title, date, time, location, category, description, organizer, faculty, study_program, capacity, image, status, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())";

$stmt = $conn->prepare($sql);

if (!$stmt) {
    sendResponse(false, 'Database error: ' . $conn->error);
}

$stmt->bind_param(
    "issssssssis",
    $userId,
    $title,
    $date,
    $time,
    $location,
    $category,
    $description,
    $organizer,
    $faculty,
    $studyProgram,
    $capacity,
    $imagePath
);

if ($stmt->execute()) {
    $eventId = $stmt->insert_id;
    
    error_log("Event created successfully: ID {$eventId}");
    
    sendResponse(true, 'Event berhasil dibuat dan menunggu approval admin', [
        'event_id' => $eventId,
        'image_path' => $imagePath
    ]);
} else {
    // Delete uploaded image if database insert fails
    if ($imagePath && file_exists("../../{$imagePath}")) {
        unlink("../../{$imagePath}");
    }
    
    sendResponse(false, 'Gagal membuat event: ' . $stmt->error);
}

$stmt->close();
$conn->close();
?>