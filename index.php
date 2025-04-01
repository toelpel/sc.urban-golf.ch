<?php
// Set header
header('Content-Type: text/html; charset=utf-8');

// Include functions
include "includes/functions.php";

// Setup database connection
$GLOBALS["db_connect"] = db_connect();

// Fetch template
$template = file_get_contents("style/template.html");
$output = replace_html_vars($template);

// Output
echo $output;

?>