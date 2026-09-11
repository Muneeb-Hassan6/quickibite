<?php
require_once __DIR__ . '/config/Database.php';

header('Content-Type: application/json');

try {
    $db = (new Database())->getConnection();
    $tables = $db->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);

    $result = [];
    foreach ($tables as $table) {
        $colsStmt = $db->prepare("SHOW FULL COLUMNS FROM `$table`");
        $colsStmt->execute();
        $cols = $colsStmt->fetchAll(PDO::FETCH_ASSOC);

        $fksStmt = $db->prepare("
            SELECT COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
            FROM information_schema.KEY_COLUMN_USAGE
            WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND REFERENCED_TABLE_NAME IS NOT NULL
        ");
        $fksStmt->execute([$table]);
        $fks = $fksStmt->fetchAll(PDO::FETCH_ASSOC);

        $countStmt = $db->query("SELECT COUNT(*) FROM `$table`");
        $rowCount = (int)$countStmt->fetchColumn();

        $sampleStmt = $db->query("SELECT * FROM `$table` LIMIT 1");
        $sample = $sampleStmt->fetch(PDO::FETCH_ASSOC);

        $result[$table] = [
            'count' => $rowCount,
            'columns' => array_map(function($c) {
                return [
                    'field' => $c['Field'],
                    'type' => $c['Type'],
                    'null' => $c['Null'],
                    'key' => $c['Key'],
                    'default' => $c['Default'],
                    'extra' => $c['Extra']
                ];
            }, $cols),
            'foreign_keys' => $fks,
            'sample' => $sample
        ];
    }

    echo json_encode($result, JSON_PRETTY_PRINT);
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
