<?php

include('includes/functions.php');
// Datenbankverbindung aufbauen
$GLOBALS['db_connect'] = db_connect();

$op = htmlspecialchars($_GET["op"]);

switch ($op) { 
	case "set_result":
    $data = formclean($_POST);
    // Save Data
    if ($data["result"]=="-") $sql = 'DELETE FROM `sc_fg_results` WHERE `id` = "'.$data["id"].'"';
    else $sql = 'INSERT INTO `sc_fg_results` (`id`,`gameid`,`holeid`,`playerid`,`result`) VALUES("'.$data["id"].'","'.$data["gid"].'","'.$data["hid"].'","'.$data["pid"].'","'.$data["result"].'") ON DUPLICATE KEY UPDATE `gameid`="'.$data["gid"].'",`holeid`="'.$data["hid"].'",`playerid`="'.$data["pid"].'",`result`="'.$data["result"].'"';
    $result = db_query($sql);
    // Get Data
    $sql = 'SELECT `id` FROM `sc_fg_results` WHERE `gameid`='.$data["gid"].' AND `holeid`='.$data["hid"].' AND `playerid`='.$data["pid"];
    $result = db_query($sql);
    while( $row = mysqli_fetch_assoc($result)){
        $resultdata[] = $row;
    }
    echo $resultdata[0]["id"];
    break;
}

/*echo $data["result"];*/

?>