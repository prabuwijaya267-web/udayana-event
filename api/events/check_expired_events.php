<?php
// ===== CHECK_EXPIRED_EVENTS.PHP - Auto-update expired events =====

require_once '../config.php';

// Get current date and time
$currentDate = date('Y-m-d');
$currentTime = date('H:i:s');

// Find events that should be expired (date + time has passed)
$sql = "UPDATE events 
        SET expired = 1 
        WHERE expired = 0 
        AND (
            (date < ?) 
            OR (date = ? AND time <= ?)
        )";

$stmt = $conn->prepare($sql);
$stmt->bind_param("sss", $currentDate, $currentDate, $currentTime);
$stmt->execute();

$updatedCount = $stmt->affected_rows;

// Get count of expired events
$sqlCount = "SELECT COUNT(*) as total FROM events WHERE expired = 1";
$resultCount = $conn->query($sqlCount);
$totalExpired = $resultCount->fetch_assoc()['total'];

error_log("CHECK_EXPIRED: Updated $updatedCount events to expired. Total expired: $totalExpired");

sendResponse(true, "Expired events checked", [
    'updated' => $updatedCount,
    'total_expired' => $totalExpired,
    'current_date' => $currentDate,
    'current_time' => $currentTime
]);

$stmt->close();
$conn->close();
?>