<?php
// ===== DELETE_EVENT.PHP - Delete event =====

require_once '../config.php';

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['id'])) {
    sendResponse(false, 'Event ID required!');
}

$eventId = intval($input['id']);

// Check if event exists
$stmt = $conn->prepare("SELECT id FROM events WHERE id = ?");
$stmt->bind_param("i", $eventId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    sendResponse(false, 'Event tidak ditemukan!');
}

// Delete event
$stmt = $conn->prepare("DELETE FROM events WHERE id = ?");
$stmt->bind_param("i", $eventId);

if ($stmt->execute()) {
    sendResponse(true, 'Event berhasil dihapus!');
} else {
    sendResponse(false, 'Gagal menghapus event! ' . $stmt->error);
}

$stmt->close();
$conn->close();
?>