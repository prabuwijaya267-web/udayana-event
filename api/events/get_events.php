<?php
// ===== GET_EVENTS.PHP - Get all approved events for public view =====

require_once '../config.php';

// Get only approved events
$sql = "SELECT e.*, u.username 
        FROM events e 
        LEFT JOIN users u ON e.user_id = u.id 
        WHERE e.status = 'approved' 
        ORDER BY e.date DESC, e.created_at DESC";

$result = $conn->query($sql);

$events = [];
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $events[] = $row;
    }
}

// Log untuk debugging
error_log("GET_EVENTS: Found " . count($events) . " approved events");

// Return response
sendResponse(true, 'Events loaded successfully', [
    'events' => $events
]);

$conn->close();
?>
