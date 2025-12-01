<?php
// ===== UPDATE_EVENT.PHP - Update existing event with optional new image =====

require_once '../config.php';

// Validate request method
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Invalid request method');
}

// Get data from form
$input = $_POST;

// Validate required fields
$requiredFields = ['event_id', 'user_id', 'title', 'date', 'time', 'location', 'category', 'description', 'organizer', 'capacity'];
$error = validateRequired($input, $requiredFields);

if ($error) {
    sendResponse(false, $error);
}

// Sanitize inputs
$eventId = (int)sanitizeInput($input['event_id']);
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

// Verify event ownership
$checkSql = "SELECT image FROM events WHERE id = ? AND user_id = ?";
$checkStmt = $conn->prepare($checkSql);
$checkStmt->bind_param("ii", $eventId, $userId);
$checkStmt->execute();
$result = $checkStmt->get_result();

if ($result->num_rows === 0) {
    sendResponse(false, 'Event tidak ditemukan atau Anda tidak memiliki akses');
}

$currentEvent = $result->fetch_assoc();
$oldImagePath = $currentEvent['image'];

// Handle new image upload
$imagePath = $oldImagePath; // Keep old image by default

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
        sendResponse(false, 'Format gambar tidak didukung');
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
    
    // Delete old image if exists and different
    if ($oldImagePath && $oldImagePath !== $imagePath) {
        $oldImageFullPath = "../../{$oldImagePath}";
        if (file_exists($oldImageFullPath)) {
            unlink($oldImageFullPath);
            error_log("Old image deleted: {$oldImagePath}");
        }
    }
    
    error_log("New image uploaded: {$imagePath}");
}

// Update event in database
$sql = "UPDATE events 
        SET title = ?, date = ?, time = ?, location = ?, category = ?, 
            description = ?, organizer = ?, faculty = ?, study_program = ?, 
            capacity = ?, image = ?, status = 'pending'
        WHERE id = ? AND user_id = ?";

$stmt = $conn->prepare($sql);

if (!$stmt) {
    sendResponse(false, 'Database error: ' . $conn->error);
}

$stmt->bind_param(
    "sssssssssisii",
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
    $imagePath,
    $eventId,
    $userId
);

if ($stmt->execute()) {
    error_log("Event updated successfully: ID {$eventId}");
    
    sendResponse(true, 'Event berhasil diupdate dan menunggu approval ulang', [
        'event_id' => $eventId,
        'image_path' => $imagePath
    ]);
} else {
    // Delete new uploaded image if database update fails
    if ($imagePath !== $oldImagePath && $imagePath && file_exists("../../{$imagePath}")) {
        unlink("../../{$imagePath}");
    }
    
    sendResponse(false, 'Gagal mengupdate event: ' . $stmt->error);
}

$stmt->close();
$checkStmt->close();
$conn->close();
?>