<?php

# Include functions
include "includes/functions.php";

// Setup database connection
$GLOBALS["db_connect"] = db_connect();

// Fetch template

$template = file_get_contents("style/template.html");
$output = replace_html_vars($template);

// Output
echo $output;

?>