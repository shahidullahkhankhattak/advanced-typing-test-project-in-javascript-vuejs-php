<?php
    require_once("./mysqli.php");

    $data = json_decode(file_get_contents("php://input"));
    $cnic = $mysqli->real_escape_string(trim($data->cnic));
    $rollno = $mysqli->real_escape_string(trim($data->rollno));

    $check_user_query = $mysqli->query("SELECT * FROM users WHERE cnic='$cnic' AND roll_no='$rollno'");
    if($check_user_query->num_rows == 0){
        echo "notfound";
    }else{
        echo json_encode(array("user"=>$check_user_query->fetch_assoc()));
    }
?>