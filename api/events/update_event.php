<?php
// ===== UPDATE_EVENT.PHP - Update existing event =====

require_once '../config.php';

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

// Validate required fields
$requiredFields = ['id', 'title', 'date', 'time', 'location', 'category', 'description', 'organizer', 'capacity'];
$error = validateRequired($input, $requiredFields);
if ($error) {
    sendResponse(false, $error);
}

$eventId = intval($input['id']);
$title = trim($input['title']);
$date = $input['date'];
$time = $input['time'];
$location = trim($input['location']);
$category = $input['category'];
$description = trim($input['description']);
$organizer = trim($input['organizer']);
$capacity = intval($input['capacity']);
$image = isset($input['image']) ? trim($input['image']) : null;

// Check if event exists and is pending (only pending events can be edited)
$stmt = $conn->prepare("SELECT status FROM events WHERE id = ?");
$stmt->bind_param("i", $eventId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    sendResponse(false, 'Event tidak ditemukan!');
}

$event = $result->fetch_assoc();
if ($event['status'] !== 'pending') {
    sendResponse(false, 'Hanya event dengan status pending yang bisa diedit!');
}

// Update event
$stmt = $conn->prepare("UPDATE events SET title = ?, date = ?, time = ?, location = ?, category = ?, description = ?, organizer = ?, capacity = ?, image = ? WHERE id = ?");
$stmt->bind_param("sssssssssi", $title, $date, $time, $location, $category, $description, $organizer, $capacity, $image, $eventId);

if ($stmt->execute()) {
    sendResponse(true, 'Event berhasil diupdate!');
} else {
    sendResponse(false, 'Gagal mengupdate event! ' . $stmt->error);
}

$stmt->close();
$conn->close();
?>