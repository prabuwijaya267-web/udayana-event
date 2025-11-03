<?php
// generate_hash.php
$password1 = 'admin123';
$password2 = 'user123';

echo "Password untuk admin123: " . password_hash($password1, PASSWORD_DEFAULT) . "<br><br>";
echo "Password untuk user123: " . password_hash($password2, PASSWORD_DEFAULT);
?>