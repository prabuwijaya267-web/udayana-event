<?php
// ===== GET_PENDING_EVENTS.PHP - Get events waiting for approval =====

require_once '../config.php';

// Get pending events
$sql = "SELECT e.*, u.username, u.email 
        FROM events e 
        LEFT JOIN users u ON e.user_id = u.id 
        WHERE e.status = 'pending' 
        ORDER BY e.created_at ASC";

$result = $conn->query($sql);

$events = [];
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $events[] = $row;
    }
}

sendResponse(true, 'Pending events loaded', [
    'events' => $events
]);

$conn->close();
?>