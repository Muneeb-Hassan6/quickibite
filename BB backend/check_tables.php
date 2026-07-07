<?php
require 'config/Database.php';
$db = (new Database())->getConnection();
print_r($db->query('SHOW TABLES')->fetchAll(PDO::FETCH_COLUMN));
?>
