<?php
// ===== GET_EVENTS.PHP - Get approved and non-expired events for public view =====

require_once '../config.php';

// Get only approved events that are NOT expired
$sql = "SELECT e.*, u.username 
        FROM events e 
        LEFT JOIN users u ON e.user_id = u.id 
        WHERE e.status = 'approved' AND e.expired = 0
        ORDER BY e.date ASC, e.time ASC, e.created_at DESC";

$result = $conn->query($sql);

$events = [];
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $events[] = $row;
    }
}

// Log untuk debugging
error_log("GET_EVENTS: Found " . count($events) . " approved and non-expired events");

// Return response
sendResponse(true, 'Events loaded successfully', [
    'events' => $events
]);

$conn->close();
?>