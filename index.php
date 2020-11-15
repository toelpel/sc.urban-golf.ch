<?php

include('includes/functions.php');
// Datenbankverbindung aufbauen
$GLOBALS['db_connect'] = db_connect();
// Template einlesen
$template = file_get_contents('style/template.html');
$output = replace_html_vars($template);

// Output
echo utf8_encode($output);



//$sql = 'SELECT * FROM `sc_players` LIMIT 10';
//$result = db_query($sql);

//if ($result->num_rows) { printf("Select returned %d rows.\n", $result->num_rows); }

?>