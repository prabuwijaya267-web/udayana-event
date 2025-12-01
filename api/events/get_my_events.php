<?php
// ===== GET_MY_EVENTS.PHP - Get events created by specific user =====

require_once '../config.php';

// Get user_id from GET or POST
$userId = null;

// Try GET parameter first
if (isset($_GET['user_id'])) {
    $userId = (int)$_GET['user_id'];
} 
// Try POST JSON
else {
    $input = json_decode(file_get_contents('php://input'), true);
    if (isset($input['user_id'])) {
        $userId = (int)$input['user_id'];
    }
}

// Validate user_id
if (!$userId) {
    sendResponse(false, 'User ID required!');
}

// Get user's events
$stmt = $conn->prepare("SELECT e.*, u.username 
                        FROM events e 
                        LEFT JOIN users u ON e.user_id = u.id 
                        WHERE e.user_id = ? 
                        ORDER BY e.created_at DESC");

if (!$stmt) {
    sendResponse(false, 'Database error: ' . $conn->error);
}

$stmt->bind_param("i", $userId);
$stmt->execute();
$result = $stmt->get_result();

$events = [];
while ($row = $result->fetch_assoc()) {
    $events[] = $row;
}

error_log("GET_MY_EVENTS: Found " . count($events) . " events for user " . $userId);

sendResponse(true, 'User events loaded', [
    'events' => $events
]);

$stmt->close();
$conn->close();
?>