<?php
// ===== REJECT_EVENT.PHP - Reject event with reason (Admin only) =====

require_once '../config.php';

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

// Validate input
$error = validateRequired($input, ['id', 'reason']);
if ($error) {
    sendResponse(false, $error);
}

$eventId = intval($input['id']);
$reason = trim($input['reason']);

// Update event status to rejected with reason
$stmt = $conn->prepare("UPDATE events SET status = 'rejected', rejected_reason = ? WHERE id = ?");
$stmt->bind_param("si", $reason, $eventId);

if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        sendResponse(true, 'Event berhasil ditolak!');
    } else {
        sendResponse(false, 'Event tidak ditemukan!');
    }
} else {
    sendResponse(false, 'Gagal menolak event! ' . $stmt->error);
}

$stmt->close();
$conn->close();
?>
```

---

## **SELESAI! 🎉**

Semua file sudah lengkap! Sekarang tinggal:

1. **Setup Database** (jalankan SQL yang di awal)
2. **Copy semua file** ke folder `htdocs` atau `www`
3. **Jalankan XAMPP/WAMP**
4. **Buka** `http://localhost/udayana-event`

**Struktur folder final:**
```
htdocs/udayana-event/
├── index.html
├── login.html
├── register.html
├── css/
│   └── style.css
├── js/
│   ├── auth.js
│   ├── script.js
│   └── admin.js
├── user/
│   ├── dashboard.html
│   └── my-events.html
├── admin/
│   ├── dashboard.html
│   └── manage-events.html
└── api/
    ├── config.php
    ├── auth/
    │   ├── login.php
    │   ├── register.php
    │   └── logout.php
    └── events/
        ├── get_events.php
        ├── get_all_events.php
        ├── get_pending_events.php
        ├── get_my_events.php
        ├── add_event.php
        ├── update_event.php
        ├── delete_event.php
        ├── approve_event.php
        └── reject_event.php