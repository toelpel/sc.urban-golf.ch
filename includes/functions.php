<?php
function db_connect(): mysqli
{
	include ('includes/db_config.php');
	$db = new mysqli(hostname: $dbhost, username: $dbuname, password: $dbpass, database: $dbname);

	if ($db->connect_error)
	{
		die('Connect Error (' . $db->connect_errno . ') ' . $mysqli->connect_error);
	}
	elseif ($result = $db->query(query: "SELECT DATABASE()"))
	{
		$row = $result->fetch_row();
		if ($row[0] != $dbname)
		{
			echo "Wrong Database";
			//oops! We're connected to mysql, but not to database_b
		}
	}
	return $db;
}

function db_query($sql): bool|mysqli_result
{
	$db_connect = $GLOBALS["db_connect"];
    return $db_connect->query(query: $sql);
}

function formclean($data): array
{
	foreach (array_keys($data) as $key)
	{
		/*$clean[$key] = mysqli_real_escape_string($_POST[$key]);*/
		$formdata[$key] = $data[$key];
	}
	return $formdata;
}

function replace_html_vars($template): array|string
{
	$op = htmlspecialchars(string: $_GET["op"]);
	$id = $_COOKIE["SC-GameCode"];
	if ($_GET["id"]) $id = $_GET["id"];

	switch ($op)
	{
		case "freegame":
			$content = freegame(id: $id);
		break;

		default:
			/*$content = mainmenu();*/
			$content = freegame(id: $id);
	}

	$output = str_replace(search: "{!CONTENT!}", replace: $content, subject: $template);
	return $output;
}

function mainmenu(): string
{
	$content = '<a href="?op=freegame"><div class="button">Freies Spiel</div></a>';

	return $content;
}

# ----- Free Game Functions ----- #
# ------------------------------- #

function check_fg_id($id): int
{
	// Checks if the id is already in use. If in use returns 0, if not in use returns 1
	$sql = 'SELECT `id` FROM `sc_fg_games` WHERE `id` = ' . $id;
	$result = db_query(sql: $sql);
	if (mysqli_num_rows(result: $result) > 0) return 0;
	else return 1;
}

function freegame($id): string
{

	$action = htmlspecialchars(string: $_GET["action"]);

	switch ($action)
	{
		case "newedit":
			$content = freegame_newedit();
		break;
		case "hole":
			/*$id = htmlspecialchars($_GET["id"]);*/
			$holeid = htmlspecialchars(string: $_GET["holeid"]);
			$content = freegame_hole(id: $id, holeid: $holeid);
		break;
		case "opengame":
			$content = freegame_opengame();
		break;
		case "scorecard":
			/*$id = htmlspecialchars($_GET["id"]);*/
			$holeid = htmlspecialchars(string: $_GET["holeid"]);
			$content = freegame_scorecard(id: $id);
		break;

		default:
			$content = freegame_menu(id: $id);
	}

	return $content;
}

function freegame_menu($id): string
{
	$id = $_COOKIE["SC-GameCode"];
	$content = '<a href="?op=freegame&action=newedit"><div class="button">Neues Spiel</div></a>';
	/* $content .= '<form class="fg_menu">'; */
	/* $content .= '<input type="text" name="id" value="'.$id.'"><a href="?op=freegame&action=hole&id='.$id.'">'; */
	$content .= '<a href="?op=freegame&action=opengame"><div class="button">Spiel öffnen</div></a>';

	/* if ($id) { $content .= '<a href="?op=freegame&action=hole"><div class="button">Spiel '.$id.' öffnen</div></a>'; } */
	/* $content .= '<input class="button" type="submit" name="submit" id="submit" value="Spiel öffnen" style="width: 82%";">';    //$content .= '</form>'; */
	/* $content .= '<a href="/"><div class="button">Zurück</div></a>'; */

	return $content;
}

function freegame_opengame(): string
{
	$sql = 'SELECT `id`,`timestamp` FROM `sc_fg_games`			ORDER BY `timestamp` DESC			LIMIT 0,10';
	$result = db_query($sql);
	while ($row = mysqli_fetch_assoc(result: $result))
	{
		$content .= '<a href="?op=freegame&action=hole&id=' . $row["id"] . '"><div class="button">' . $row["id"] . ' (' . date_format(object: date_create(datetime: $row["timestamp"]) , format: 'd.m.Y / H:i') . ')</div></a>';
	}
	return $content;
}

function freegame_scorecard($id): string
{

	$sql = 'SELECT COUNT(DISTINCT holeid) AS holecount FROM `sc_fg_results` WHERE gameid=' . $id;
	$result = db_query($sql);
	while ($row = mysqli_fetch_assoc(result: $result))
	{
		$holecount = $row['holecount'];
	}

	$sql = 'SELECT DISTINCT `sc_fg_results`.`playerid`,`sc_fg_players`.`name`
            FROM `sc_fg_results`
            JOIN `sc_fg_players` ON `sc_fg_results`.`playerid` = `sc_fg_players`.`id`
            WHERE `sc_fg_results`.`gameid` = ' . $id . '
            ORDER BY `sc_fg_results`.`playerid` ASC';
	$result_player = db_query(sql: $sql);

	for ($x = 1;$x <= $holecount;$x++)
	{
		$thead .= '<th class="no-sort"><a href="?op=freegame&action=hole&id=' . $id . '&holeid=' . ($x) . '">' . $x . '</a></th>';
	}
	$thead .= '<th>Total</th><th>Avg.</th>';

	while ($players = mysqli_fetch_assoc(result: $result_player))
	{

		$tbody .= '<tr><td>' . $players['name'] . '</td>';

		for ($x = 1;$x <= $holecount;$x++)
		{
			$sql = 'SELECT `sc_fg_results`.`result`
                    FROM `sc_fg_results`
                    WHERE `sc_fg_results`.`gameid` = ' . $id . '
                    AND `sc_fg_results`.`holeid` = ' . $x . '
                    AND `sc_fg_results`.`playerid`= ' . $players['playerid'];
			$result_result = db_query(sql: $sql);

			$result = mysqli_fetch_assoc(result: $result_result);
			$tbody .= '<td>' . $result['result'] . '</td>';
		}
		$sql = 'SELECT SUM(`result`) AS "SUM",ROUND(AVG(`result`),1) AS "AVG"
                FROM `sc_fg_results`
                WHERE `sc_fg_results`.`gameid` = ' . $id . '
                AND `sc_fg_results`.`playerid`= ' . $players['playerid'];
		$result = db_query(sql: $sql);
		$result = mysqli_fetch_assoc(result: $result);
		$tbody .= '<td>' . $result['SUM'] . '</td>';
		$tbody .= '<td>' . $result['AVG'] . '</td>';

		$tbody .= '</tr>';
	}

	$content = '<table id="scorecard" class="stripe cell-border" cellspacing="0" width="95%">';
	$content .= '<thead><tr><th>Player</th>' . $thead . '</tr></thead>';
	$content .= '<tbody>';
	$content .= $tbody;
	$content .= '</tbody>';
	$content .= '</table>';
	$content .= '<a href="javascript:history.back()"><div class="button" style="margin-top:25px;">Zur�ck</div></a>';

	return $content;
}

function freegame_hole($id, $holeid): string
{
	if ($holeid == "") $holeid = 1;
	$sql = 'SELECT id,name,timestamp FROM `sc_fg_games` WHERE id = ' . $id;
	$result = db_query(sql: $sql);
	while ($row = mysqli_fetch_assoc(result: $result))
	{
		$gamedata = $row;
	}
	//    $sql = 'SELECT id,name FROM `sc_fg_players` WHERE gameid = '.$gameid;
	//    $result = db_query($sql);
	//    while( $row = mysqli_fetch_assoc($result)){
	//        $playerdata[] = $row;
	//    }
	//    $sql = 'SELECT id,gameid,holeid,playerid,result FROM `sc_fg_results` WHERE id = '.$gameid.' AND holeid='.$holeid;
	//    $result = db_query($sql);
	//    while( $row = mysqli_fetch_assoc($result)){
	//        $resultdata[] = $row;
	//    }
	$sql = 'SELECT `sc_fg_results`.id,`sc_fg_players`.id AS "pid",`sc_fg_players`.name,`sc_fg_results`.result
            FROM `sc_fg_players`
            LEFT JOIN `sc_fg_results` ON `sc_fg_players`.id = `sc_fg_results`.playerid AND `sc_fg_results`.holeid = ' . $holeid . '
            WHERE `sc_fg_players`.gameid = ' . $id . '
            ORDER BY `sc_fg_players`.id ASC';
	$result = db_query(sql: $sql);
	while ($row = mysqli_fetch_assoc(result: $result))
	{
		$resultdata[] = $row;
	}

	foreach ($resultdata as $result)
	{
		$tablerow .= '<tr>';
		$tablerow .= '<input type="hidden" name="gid" value="' . $id . '">';
		$tablerow .= '<input type="hidden" name="hid" value="' . $holeid . '">';
		$tablerow .= '<input type="hidden" name="pid" value="' . $result["pid"] . '">';
		$tablerow .= '<input type="hidden" name="current" value="' . $result["result"] . '">';
		$tablerow .= '<td>' . $result["name"] . '</td>';
		//$tablerow .= '<td><div class="button op">-</div></td>';
		$tablerow .= '<td><input class="button op" value="-"></td>';

		$tablerow .= '<td><select name="result" class="button" id="' . $result["id"] . '">';
		$tablerow .= '<option value="-">-</option>'; // - means 'Hole not played'
		for ($x = - 1;$x <= 11;$x++)
		{
			if ($result["result"] == $x) $selected = ' selected';
			else $selected = "";
			$tablerow .= '<option value="' . $x . '"' . $selected . '>' . $x . '</option>';
		}
		$tablerow .= '</select></td>';

		//$tablerow .= '<td><div class="button op">+</div></td></tr>';
		$tablerow .= '<td><input class="button op" value="+"></td></tr>';
	}

	$content = '<div class="hole">';
	$content .= '<h3>' . $gamedata["name"] . ' - ' . $gamedata["id"] . ' - Hole ' . $holeid . ' - <a href="?op=freegame&action=newedit&id=' . $gamedata["id"] . '">edit</a></h3>';
	$content .= '<table id="resulttable" name="resulttable">';
	$content .= '<tbody>';
	$content .= $tablerow;
	$content .= '</tbody>';
	$content .= '</table>';
	$content .= '<a href="?op=freegame&action=hole&id=' . $id . '&holeid=' . ($holeid + 1) . '"><div class="button">Weiter</div></a>';
	$content .= '<a href="?op=freegame&action=scorecard&id=' . $id . '"><div class="button">Scorecard</div></a>';
	$content .= '</div>';

	return $content;
}

function freegame_newedit(): string
{

	if ($_SERVER['REQUEST_METHOD'] === 'POST')
	{
		// Data Posted
		// Clean user input
		$formdata = formclean(data: $_POST);

		$id = $formdata["id"];
		if (!$id)
		{
			do
			{
				$id = rand(min: 100000, max: 999999);
			}
			while (check_fg_id(id: $id) == 0);
		}

		// Save Game Data
		$sql = 'INSERT INTO `sc_fg_games` (id, name, timestamp) VALUES("' . $id . '","' . $formdata["name"] . '",NOW()) ON DUPLICATE KEY UPDATE name="' . $formdata["name"] . '"';
		$result = db_query(sql: $sql);

		// Save Player Data
		foreach ($formdata["players"] as $player)
		{
			if ($player["name"])
			{
				$sql = 'INSERT INTO `sc_fg_players` (id,name,gameid) VALUES("' . $player["id"] . '","' . $player["name"] . '","' . $id . '") ON DUPLICATE KEY UPDATE name="' . $player["name"] . '"';
				$result = db_query(sql: $sql);
			}
		}

		// Setting cookie
		setcookie("SC-GameCode", $id, time() + 2592000);
		// Redirect directly to newly created game
		header("Location: ?op=freegame&action=hole&id=" . $id);
		exit;

	}
	else
	{
		$id = htmlspecialchars(string: $_GET["id"]);
		if ($id)
		{
			// Edit Game (Get Data from SQL and put in Form)
			$sql = 'SELECT name FROM `sc_fg_games` WHERE id = ' . $id;
			$result = db_query(sql: $sql);
			while ($row = mysqli_fetch_assoc(result: $result))
			{
				$gamedata[] = $row;
			}
			$sql = 'SELECT id,name FROM `sc_fg_players` WHERE gameid = ' . $id . ' ORDER BY id ASC';
			$result = db_query($sql);
			while ($row = mysqli_fetch_assoc(result: $result))
			{
				$playerdata[] = $row;
			}
		}

		$content = '<form method="post">';
		$content .= '<input type="hidden" name="id" value="' . $id . '">';
		$content .= '<label for="name">Name</label>';
		$content .= '<input type="text" name="name" id="name" value="' . $gamedata[0]["name"] . '"><br><br>';
		$content .= '<label for="player">Spieler 1</label>';
		$content .= '<input type="hidden" name="players[1][id]" value="' . $playerdata[0]["id"] . '">';
		$content .= '<input type="text" name="players[1][name]" id="player1" value="' . $playerdata[0]["name"] . '"><br>';
		$content .= '<label for="player">Spieler 2</label>';
		$content .= '<input type="hidden" name="players[2][id]" value="' . $playerdata[1]["id"] . '">';
		$content .= '<input type="text" name="players[2][name]" id="player2" value="' . $playerdata[1]["name"] . '"><br>';
		$content .= '<label for="player">Spieler 3</label>';
		$content .= '<input type="hidden" name="players[3][id]" value="' . $playerdata[2]["id"] . '">';
		$content .= '<input type="text" name="players[3][name]" id="player3" value="' . $playerdata[2]["name"] . '"><br>';
		$content .= '<label for="player">Spieler 4</label>';
		$content .= '<input type="hidden" name="players[4][id]" value="' . $playerdata[3]["id"] . '">';
		$content .= '<input type="text" name="players[4][name]" id="player4" value="' . $playerdata[3]["name"] . '"><br>';
		$content .= '<label for="player">Spieler 5</label>';
		$content .= '<input type="hidden" name="players[5][id]" value="' . $playerdata[4]["id"] . '">';
		$content .= '<input type="text" name="players[5][name]" id="player5" value="' . $playerdata[4]["name"] . '"><br>';
		$content .= '<label for="player">Spieler 6</label>';
		$content .= '<input type="hidden" name="players[6][id]" value="' . $playerdata[5]["id"] . '">';
		$content .= '<input type="text" name="players[6][name]" id="player6" value="' . $playerdata[5]["name"] . '"><br>';
		$content .= '<label for="player">Spieler 7</label>';
		$content .= '<input type="hidden" name="players[7][id]" value="' . $playerdata[6]["id"] . '">';
		$content .= '<input type="text" name="players[7][name]" id="player7" value="' . $playerdata[6]["name"] . '"><br>';
		$content .= '<label for="player">Spieler 8</label>';
		$content .= '<input type="hidden" name="players[8][id]" value="' . $playerdata[7]["id"] . '">';
		$content .= '<input type="text" name="players[8][name]" id="player8" value="' . $playerdata[7]["name"] . '"><br>';
		$content .= '<label for="player">Spieler 9</label>';
		$content .= '<input type="hidden" name="players[9][id]" value="' . $playerdata[8]["id"] . '">';
		$content .= '<input type="text" name="players[9][name]" id="player9" value="' . $playerdata[8]["name"] . '"><br>';
		$content .= '<label for="player">Spieler 10</label>';
		$content .= '<input type="hidden" name="players[10][id]" value="' . $playerdata[9]["id"] . '">';
		$content .= '<input type="text" name="players[10][name]" id="player8" value="' . $playerdata[9]["name"] . '"><br>';
		$content .= '<label for="player">Spieler 11</label>';
		$content .= '<input type="hidden" name="players[11][id]" value="' . $playerdata[10]["id"] . '">';
		$content .= '<input type="text" name="players[11][name]" id="player8" value="' . $playerdata[10]["name"] . '"><br>';
		$content .= '<label for="player">Spieler 12</label>';
		$content .= '<input type="hidden" name="players[12][id]" value="' . $playerdata[11]["id"] . '">';
		$content .= '<input type="text" name="players[12][name]" id="player8" value="' . $playerdata[11]["name"] . '"><br>';
		$content .= '<input class="button" type="submit" name="submit" id="submit" value="Weiter">';
		$content .= '</form>';

	}
	return $content;
}

?>