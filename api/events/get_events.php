<?php
// ===== GET_EVENTS.PHP - Get approved and non-expired events (FIXED) =====

require_once '../config.php';

// Set timezone ke WITA
date_default_timezone_set('Asia/Makassar');

// Log untuk debugging
error_log("=== GET_EVENTS.PHP CALLED ===");
error_log("Current DateTime (WITA): " . date('Y-m-d H:i:s'));

// STEP 1: Update expired events terlebih dahulu
$currentDateTime = date('Y-m-d H:i:s');
$currentDate = date('Y-m-d');
$currentTime = date('H:i:s');

$updateSql = "UPDATE events 
              SET expired = 1 
              WHERE expired = 0 
              AND (
                  date < ? 
                  OR (date = ? AND time < ?)
              )";

$updateStmt = $conn->prepare($updateSql);
if ($updateStmt) {
    $updateStmt->bind_param("sss", $currentDate, $currentDate, $currentTime);
    $updateStmt->execute();
    $updatedCount = $updateStmt->affected_rows;
    error_log("Updated $updatedCount events to expired");
    $updateStmt->close();
}

// STEP 2: Get approved and non-expired events
$sql = "SELECT e.*, u.username 
        FROM events e 
        LEFT JOIN users u ON e.user_id = u.id 
        WHERE e.status = 'approved' AND e.expired = 0
        ORDER BY e.date ASC, e.time ASC";

error_log("SQL Query: " . $sql);

$result = $conn->query($sql);

if (!$result) {
    error_log("SQL Error: " . $conn->error);
    sendResponse(false, 'Database query error: ' . $conn->error);
}

$events = [];
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $events[] = $row;
    }
}

error_log("Found " . count($events) . " approved and non-expired events");

// Log sample data
if (count($events) > 0) {
    error_log("Sample event: " . json_encode($events[0]));
}

// Get total events for debugging
$totalSql = "SELECT 
    COUNT(*) as total,
    SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
    SUM(CASE WHEN expired = 0 THEN 1 ELSE 0 END) as not_expired,
    SUM(CASE WHEN status = 'approved' AND expired = 0 THEN 1 ELSE 0 END) as approved_not_expired
    FROM events";
$totalResult = $conn->query($totalSql);
$totals = $totalResult->fetch_assoc();

error_log("Database Stats:");
error_log("  Total events: " . $totals['total']);
error_log("  Approved: " . $totals['approved']);
error_log("  Not expired: " . $totals['not_expired']);
error_log("  Approved & Not expired: " . $totals['approved_not_expired']);

// Return response
sendResponse(true, 'Events loaded successfully', [
    'events' => $events,
    'count' => count($events),
    'current_datetime' => $currentDateTime,
    'timezone' => date_default_timezone_get()
]);

$conn->close();
?>