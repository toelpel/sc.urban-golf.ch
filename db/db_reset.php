<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/../includes/db_config.php';

$mysqli = new mysqli(hostname: $dbhost, username: $dbuname, password: $dbpass, database: $dbname);
if ($mysqli->connect_error) {
    die("Verbindung fehlgeschlagen: " . $mysqli->connect_error);
}

// Nur auf Testdatenbank anwenden
if (DB_NAME !== 'teevau3c_sctest') {
    die("🚫 Nicht in einer Test-Datenbank!");
}

echo "⏳ Alle Tables werden gelöscht...<br><br>";
$result = $mysqli->query("SHOW TABLES");
while ($row = $result->fetch_array()) {
    $mysqli->query("DROP TABLE IF EXISTS `" . $row[0] . "`");
}

echo "⏳ SQL-Dump wird importiert...<br><br>";

// Lade SQL aus externer Datei
$sql = file_get_contents(__DIR__ . '/db_sample.sql');

if ($mysqli->multi_query($sql)) {
    do {
        $mysqli->store_result();
    } while ($mysqli->more_results() && $mysqli->next_result());
    echo "✅ Datenbank erfolgreich zurückgesetzt.<br>";
} else {
    echo "❌ Fehler beim Ausführen des SQL-Dumps: " . $mysqli->error;
}

$mysqli->close();
echo "<br>🎉 Reset abgeschlossen.";
?>