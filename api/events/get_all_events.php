<?php
// ===== GET_ALL_EVENTS.PHP - Get all events (for admin) =====

require_once '../config.php';

// Get all events regardless of status
$sql = "SELECT e.*, u.username 
        FROM events e 
        LEFT JOIN users u ON e.user_id = u.id 
        ORDER BY 
            CASE 
                WHEN e.status = 'pending' THEN 1
                WHEN e.status = 'approved' THEN 2
                WHEN e.status = 'rejected' THEN 3
            END,
            e.created_at DESC";

$result = $conn->query($sql);

$events = [];
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $events[] = $row;
    }
}

sendResponse(true, 'All events loaded', [
    'events' => $events
]);

$conn->close();
?>