<?php
// ===== LOGOUT.PHP - User Logout =====

require_once '../config.php';

// In this case, logout is handled on frontend (remove localStorage)
// This file is just a placeholder for future session-based auth

sendResponse(true, 'Logout berhasil!');
?>