<?php
// ===== CHECK_EXPIRED_EVENTS.PHP - Auto-update expired events (FIXED) =====

require_once '../config.php';

// Set timezone ke WITA (Bali/Makassar) - UTC+8
date_default_timezone_set('Asia/Makassar');

// Get current date and time in WITA
$currentDateTime = date('Y-m-d H:i:s');
$currentDate = date('Y-m-d');
$currentTime = date('H:i:s');

error_log("=== CHECK EXPIRED EVENTS (WITA) ===");
error_log("Timezone: " . date_default_timezone_get());
error_log("Current DateTime: " . $currentDateTime);
error_log("Current Date: " . $currentDate);
error_log("Current Time: " . $currentTime);

// Get events status before update
$beforeSql = "SELECT 
    COUNT(*) as total,
    SUM(CASE WHEN expired = 0 THEN 1 ELSE 0 END) as active,
    SUM(CASE WHEN expired = 1 THEN 1 ELSE 0 END) as expired_count
    FROM events";
$beforeResult = $conn->query($beforeSql);
$before = $beforeResult->fetch_assoc();

error_log("Before update - Total: {$before['total']}, Active: {$before['active']}, Expired: {$before['expired_count']}");

// Update expired events
// Event expired jika: tanggal sudah lewat ATAU tanggal sama tapi jam sudah lewat
$sql = "UPDATE events 
        SET expired = 1 
        WHERE expired = 0 
        AND (
            date < ? 
            OR (date = ? AND time < ?)
        )";

$stmt = $conn->prepare($sql);

if (!$stmt) {
    error_log("CHECK_EXPIRED ERROR: " . $conn->error);
    sendResponse(false, 'Database error: ' . $conn->error);
}

$stmt->bind_param("sss", $currentDate, $currentDate, $currentTime);
$stmt->execute();

$updatedCount = $stmt->affected_rows;

// Get events status after update
$afterResult = $conn->query($beforeSql);
$after = $afterResult->fetch_assoc();

error_log("After update - Total: {$after['total']}, Active: {$after['active']}, Expired: {$after['expired_count']}");

// Log detail events untuk debugging
error_log("--- Events Detail Check ---");
$sqlCheck = "SELECT 
    id, 
    title, 
    date, 
    time, 
    expired, 
    status,
    CONCAT(date, ' ', time) as event_datetime,
    CASE 
        WHEN date < ? THEN 'EXPIRED (date passed)'
        WHEN date = ? AND time < ? THEN 'EXPIRED (time passed today)'
        WHEN date = ? AND time >= ? THEN 'ACTIVE (later today)'
        ELSE 'ACTIVE (future date)'
    END as check_status
    FROM events 
    WHERE status = 'approved'
    ORDER BY date DESC, time DESC
    LIMIT 10";

$stmtCheck = $conn->prepare($sqlCheck);
$stmtCheck->bind_param("sssss", $currentDate, $currentDate, $currentTime, $currentDate, $currentTime);
$stmtCheck->execute();
$resultCheck = $stmtCheck->get_result();

if ($resultCheck) {
    while ($row = $resultCheck->fetch_assoc()) {
        error_log(sprintf(
            "  [%s] ID:%d | %s | %s %s | Expired:%d | Status:%s",
            $row['check_status'],
            $row['id'],
            $row['title'],
            $row['date'],
            $row['time'],
            $row['expired'],
            $row['status']
        ));
    }
}

error_log("Updated $updatedCount events to expired");
error_log("=== END CHECK ===");

sendResponse(true, "Expired events checked (WITA)", [
    'updated' => $updatedCount,
    'total_expired' => $after['expired_count'],
    'total_active' => $after['active'],
    'current_datetime' => $currentDateTime,
    'timezone' => date_default_timezone_get(),
    'current_date' => $currentDate,
    'current_time' => $currentTime
]);

$stmt->close();
if (isset($stmtCheck)) {
    $stmtCheck->close();
}
$conn->close();
?>