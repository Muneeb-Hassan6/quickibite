<?php
$file = 'C:/Users/Faiz Ul Hassan/.gemini/antigravity-ide/brain/af52ea24-586a-4b56-a101-a239abd513ec/.system_generated/logs/transcript_full.jsonl';
if (!file_exists($file)) {
    $file = 'C:/Users/Faiz Ul Hassan/.gemini/antigravity-ide/brain/af52ea24-586a-4b56-a101-a239abd513ec/.system_generated/logs/transcript.jsonl';
}

$handle = fopen($file, "r");
$found = null;
if ($handle) {
    while (($line = fgets($handle)) !== false) {
        if (strpos($line, '"step_index":7250') !== false || strpos($line, 'Execute Comprehensive 29-Table') !== false) {
            $data = json_decode($line, true);
            if (isset($data['content'])) {
                $found = $data['content'];
                break;
            }
        }
    }
    fclose($handle);
}

header('Content-Type: text/plain; charset=utf-8');
echo $found ?: "Not found";
