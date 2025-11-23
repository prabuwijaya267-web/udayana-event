<?php
date_default_timezone_set('Asia/Makassar');

echo "<h2>Timezone Test</h2>";
echo "Default Timezone: " . date_default_timezone_get() . "<br>";
echo "Current DateTime: " . date('Y-m-d H:i:s') . "<br>";
echo "Current Date: " . date('Y-m-d') . "<br>";
echo "Current Time: " . date('H:i:s') . "<br>";
echo "Day: " . date('l') . "<br>";
echo "Timezone Offset: UTC" . date('P') . "<br>";
?>