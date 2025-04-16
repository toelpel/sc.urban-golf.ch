-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Erstellungszeit: 16. Apr 2025 um 20:56
-- Server-Version: 10.6.19-MariaDB-cll-lve-log
-- PHP-Version: 8.1.32

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Datenbank: `teevau3c_sctest`
--

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `sc_fg_games`
--

DROP TABLE IF EXISTS `sc_fg_games`;
CREATE TABLE `sc_fg_games` (
  `id` int(8) NOT NULL,
  `name` varchar(255) NOT NULL,
  `timestamp` datetime NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Daten für Tabelle `sc_fg_games`
--

INSERT INTO `sc_fg_games` (`id`, `name`, `timestamp`, `active`) VALUES
(467639, 'Testspiel 1', '2025-04-02 22:21:48', 1);

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `sc_fg_players`
--

DROP TABLE IF EXISTS `sc_fg_players`;
CREATE TABLE `sc_fg_players` (
  `id` int(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `gameid` int(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Daten für Tabelle `sc_fg_players`
--

INSERT INTO `sc_fg_players` (`id`, `name`, `gameid`) VALUES
(1, 'Spieler 1', 467639),
(2, 'Spieler 2', 467639),
(3, 'Spieler 3', 467639);

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `sc_fg_results`
--

DROP TABLE IF EXISTS `sc_fg_results`;
CREATE TABLE `sc_fg_results` (
  `id` int(255) NOT NULL,
  `gameid` int(255) NOT NULL,
  `holeid` int(255) NOT NULL,
  `playerid` int(255) NOT NULL,
  `result` int(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Daten für Tabelle `sc_fg_results`
--

INSERT INTO `sc_fg_results` (`id`, `gameid`, `holeid`, `playerid`, `result`) VALUES
(1, 467639, 1, 1, 3),
(2, 467639, 1, 2, 5),
(3, 467639, 1, 3, 4),
(4, 467639, 2, 1, 6),
(5, 467639, 2, 2, 4),
(6, 467639, 2, 3, 7),
(7, 467639, 3, 1, 1),
(8, 467639, 3, 2, 4),
(9, 467639, 3, 3, 2),
(10, 467639, 4, 1, 4),
(11, 467639, 4, 2, 8),
(12, 467639, 4, 3, 11),
(13, 467639, 5, 1, 5),
(14, 467639, 5, 2, 2),
(15, 467639, 5, 3, 3);

--
-- Indizes der exportierten Tabellen
--

--
-- Indizes für die Tabelle `sc_fg_games`
--
ALTER TABLE `sc_fg_games`
  ADD UNIQUE KEY `id` (`id`);

--
-- Indizes für die Tabelle `sc_fg_players`
--
ALTER TABLE `sc_fg_players`
  ADD UNIQUE KEY `id` (`id`);

--
-- Indizes für die Tabelle `sc_fg_results`
--
ALTER TABLE `sc_fg_results`
  ADD UNIQUE KEY `id` (`id`);

--
-- AUTO_INCREMENT für exportierte Tabellen
--

--
-- AUTO_INCREMENT für Tabelle `sc_fg_players`
--
ALTER TABLE `sc_fg_players`
  MODIFY `id` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT für Tabelle `sc_fg_results`
--
ALTER TABLE `sc_fg_results`
  MODIFY `id` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
