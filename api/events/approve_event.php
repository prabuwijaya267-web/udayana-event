<?php
// ===== APPROVE_EVENT.PHP - Approve event (Admin only) =====

require_once '../config.php';

// Get JSON input
$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput, true);

// Log untuk debugging
error_log("APPROVE_EVENT Input: " . $rawInput);

if (!isset($input['id'])) {
    sendResponse(false, 'Event ID required!');
}

$eventId = intval($input['id']);

// Log event ID
error_log("APPROVE_EVENT: Approving event ID " . $eventId);

// Update event status to approved
$stmt = $conn->prepare("UPDATE events SET status = 'approved', rejected_reason = NULL WHERE id = ?");
$stmt->bind_param("i", $eventId);

if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        error_log("APPROVE_EVENT: Event $eventId approved successfully");
        sendResponse(true, 'Event berhasil disetujui!');
    } else {
        error_log("APPROVE_EVENT: Event $eventId not found");
        sendResponse(false, 'Event tidak ditemukan!');
    }
} else {
    error_log("APPROVE_EVENT: Error - " . $stmt->error);
    sendResponse(false, 'Gagal menyetujui event! ' . $stmt->error);
}

$stmt->close();
$conn->close();
?>
```

---

### **4. Test di Console Browser**

Buka Console (F12) dan coba approve event, harus muncul log seperti:
```
Approve event clicked: 1
Event found: {id: 1, title: "Test Event", ...}
Modal opened
Confirming approve for event: 1
Approve response: {success: true, message: "Event berhasil disetujui!"}