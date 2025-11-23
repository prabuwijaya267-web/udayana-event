<?php
// File ini bisa dipanggil via cron job setiap 1 jam
// Contoh cron: 0 * * * * /usr/bin/php /path/to/cron/update_expired.php

require_once '../api/config.php';

$currentDateTime = date('Y-m-d H:i:s');

$sql = "UPDATE events 
        SET expired = 1 
        WHERE expired = 0 
        AND CONCAT(date, ' ', time) < ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $currentDateTime);
$stmt->execute();

$updatedCount = $stmt->affected_rows;

error_log("[CRON] Updated $updatedCount events to expired at " . $currentDateTime);

echo "Updated $updatedCount events\n";

$stmt->close();
$conn->close();
?>