<?php
// ===== CONFIG.PHP - Database Connection =====
$host = 'localhost';
$dbname = 'udayana_event';
$username = 'root';     // default XAMPP/MAMP
$password = '';         // default kosong di XAMPP

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Koneksi gagal: " . $e->getMessage());
}
?>
// Enable error reporting for development
