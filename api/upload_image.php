<?php
// ===== UPLOAD_IMAGE.PHP - Upload gambar event =====

require_once 'config.php';

// Set upload directory
$uploadDir = '../uploads/events/';

// Buat folder jika belum ada
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

// Validasi request method
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Method not allowed');
}

// Validasi file upload
if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    sendResponse(false, 'Tidak ada file yang diupload atau terjadi error');
}

$file = $_FILES['image'];

// Validasi tipe file
$allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
$fileType = mime_content_type($file['tmp_name']);

if (!in_array($fileType, $allowedTypes)) {
    sendResponse(false, 'Tipe file tidak diizinkan! Hanya JPG, PNG, GIF, dan WebP yang diperbolehkan.');
}

// Validasi ukuran file (max 5MB)
$maxSize = 5 * 1024 * 1024; // 5MB
if ($file['size'] > $maxSize) {
    sendResponse(false, 'Ukuran file terlalu besar! Maksimal 5MB.');
}

// Generate nama file unik
$extension = pathinfo($file['name'], PATHINFO_EXTENSION);
$newFileName = 'event_' . uniqid() . '_' . time() . '.' . $extension;
$targetPath = $uploadDir . $newFileName;

// Upload file
if (move_uploaded_file($file['tmp_name'], $targetPath)) {
    // Return URL relatif
    $imageUrl = 'uploads/events/' . $newFileName;
    
    sendResponse(true, 'Gambar berhasil diupload!', [
        'image_url' => $imageUrl,
        'file_name' => $newFileName
    ]);
} else {
    sendResponse(false, 'Gagal mengupload gambar!');
}
?>