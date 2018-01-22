<?php
require_once("./mysqli.php");

$data = json_decode(file_get_contents("php://input"));
$result = $data->result;
$date = date('Y-m-d H:i:s');
/*
        announced: false,
        correct_words: [],
        incorrect_words: [],
        total_characters: 0,
        correct_characters: 0,
        incorrect_characters: 0,
        accuracy: 0,
        wpm: 0
 */

$r_uid = $result->uid;
$r_characters_typed = $mysqli->real_escape_string(trim($result->total_words_typed));
$r_correct_words = sizeof($result->correct_words);
$r_incorrect_words = sizeof($result->incorrect_words);
$r_wpm = $result->wpm;
$r_accuracy = $result->accuracy;
$r_time = $result->time." min";

$mysqli->query("INSERT INTO results 
                      (`uid`, `characters_typed`, `correct_words`, `incorrect_words`, `wpm`, `accuracy`, `time`, `date`)
                      VALUES ('$r_uid', '$r_characters_typed', '$r_correct_words', '$r_incorrect_words',
                      '$r_wpm', '$r_accuracy', '$r_time','$date'
                      )
              ");

$mysqli->query("UPDATE users SET tested='1' WHERE id='$r_uid'");

echo "done";

?>