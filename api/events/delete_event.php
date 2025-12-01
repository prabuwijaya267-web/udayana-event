<?php
// ===== DELETE_EVENT.PHP - Delete event and its image file =====

require_once '../config.php';

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

// Validate required field
if (!isset($input['event_id'])) {
    sendResponse(false, 'Event ID diperlukan');
}

$eventId = (int)$input['event_id'];

// Get event data including image path before deleting
$checkSql = "SELECT image, user_id FROM events WHERE id = ?";
$checkStmt = $conn->prepare($checkSql);
$checkStmt->bind_param("i", $eventId);
$checkStmt->execute();
$result = $checkStmt->get_result();

if ($result->num_rows === 0) {
    sendResponse(false, 'Event tidak ditemukan');
}

$event = $result->fetch_assoc();
$imagePath = $event['image'];

// Delete from database
$sql = "DELETE FROM events WHERE id = ?";
$stmt = $conn->prepare($sql);

if (!$stmt) {
    sendResponse(false, 'Database error: ' . $conn->error);
}

$stmt->bind_param("i", $eventId);

if ($stmt->execute()) {
    // Delete image file if exists
    if ($imagePath) {
        $fullImagePath = "../../{$imagePath}";
        if (file_exists($fullImagePath)) {
            if (unlink($fullImagePath)) {
                error_log("Image file deleted: {$imagePath}");
            } else {
                error_log("Failed to delete image file: {$imagePath}");
            }
        }
    }
    
    error_log("Event deleted successfully: ID {$eventId}");
    sendResponse(true, 'Event berhasil dihapus');
} else {
    sendResponse(false, 'Gagal menghapus event: ' . $stmt->error);
}

$stmt->close();
$checkStmt->close();
$conn->close();
?>