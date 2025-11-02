<?php
// ===== APPROVE_EVENT.PHP - Approve event (Admin only) =====

require_once '../config.php';

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['id'])) {
    sendResponse(false, 'Event ID required!');
}

$eventId = intval($input['id']);

// Update event status to approved
$stmt = $conn->prepare("UPDATE events SET status = 'approved', rejected_reason = NULL WHERE id = ?");
$stmt->bind_param("i", $eventId);

if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        sendResponse(true, 'Event berhasil disetujui!');
    } else {
        sendResponse(false, 'Event tidak ditemukan!');
    }
} else {
    sendResponse(false, 'Gagal menyetujui event! ' . $stmt->error);
}

$stmt->close();
$conn->close();
?>