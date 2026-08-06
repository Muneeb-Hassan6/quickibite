<?php
require 'config/Database.php';
$db = (new Database())->getConnection();
print_r($db->query('DESCRIBE settings')->fetchAll(PDO::FETCH_ASSOC));
print_r($db->query('SELECT * FROM settings')->fetchAll(PDO::FETCH_ASSOC));
?>
