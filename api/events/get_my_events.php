<?php
// ===== GET_MY_EVENTS.PHP - Get events created by specific user =====

require_once '../config.php';

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['user_id'])) {
    sendResponse(false, 'User ID required!');
}

$userId = intval($input['user_id']);

// Get user's events
$stmt = $conn->prepare("SELECT e.*, u.username 
                        FROM events e 
                        LEFT JOIN users u ON e.user_id = u.id 
                        WHERE e.user_id = ? 
                        ORDER BY e.created_at DESC");
$stmt->bind_param("i", $userId);
$stmt->execute();
$result = $stmt->get_result();

$events = [];
while ($row = $result->fetch_assoc()) {
    $events[] = $row;
}

sendResponse(true, 'User events loaded', [
    'events' => $events
]);

$stmt->close();
$conn->close();
?>