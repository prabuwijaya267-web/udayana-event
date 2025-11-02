<?php
// ===== ADD_EVENT.PHP - Create new event =====

require_once '../config.php';

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

// Validate required fields
$requiredFields = ['user_id', 'title', 'date', 'time', 'location', 'category', 'description', 'organizer', 'capacity'];
$error = validateRequired($input, $requiredFields);
if ($error) {
    sendResponse(false, $error);
}

$userId = intval($input['user_id']);
$title = trim($input['title']);
$date = $input['date'];
$time = $input['time'];
$location = trim($input['location']);
$category = $input['category'];
$description = trim($input['description']);
$organizer = trim($input['organizer']);
$capacity = intval($input['capacity']);
$image = isset($input['image']) ? trim($input['image']) : null;

// Validate category
$validCategories = ['seminar', 'workshop', 'kompetisi', 'festival', 'olahraga', 'seni'];
if (!in_array($category, $validCategories)) {
    sendResponse(false, 'Kategori tidak valid!');
}

// Validate date
$eventDate = strtotime($date);
$today = strtotime(date('Y-m-d'));
if ($eventDate < $today) {
    sendResponse(false, 'Tanggal event tidak boleh di masa lalu!');
}

// Insert event
$stmt = $conn->prepare("INSERT INTO events (user_id, title, date, time, location, category, description, organizer, capacity, image, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')");
$stmt->bind_param("isssssssss", $userId, $title, $date, $time, $location, $category, $description, $organizer, $capacity, $image);

if ($stmt->execute()) {
    sendResponse(true, 'Event berhasil dibuat dan menunggu persetujuan admin!', [
        'event_id' => $stmt->insert_id
    ]);
} else {
    sendResponse(false, 'Gagal membuat event! ' . $stmt->error);
}

$stmt->close();
$conn->close();
?>