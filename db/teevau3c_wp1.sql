-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Apr 01, 2025 at 08:16 PM
-- Server version: 10.6.19-MariaDB-cll-lve-log
-- PHP Version: 8.1.32

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `teevau3c_wp1`
--

-- --------------------------------------------------------

--
-- Table structure for table `sc_fg_games`
--

CREATE TABLE `sc_fg_games` (
  `id` int(8) NOT NULL,
  `name` varchar(255) NOT NULL,
  `timestamp` datetime NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sc_fg_players`
--

CREATE TABLE `sc_fg_players` (
  `id` int(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `gameid` int(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sc_fg_results`
--

CREATE TABLE `sc_fg_results` (
  `id` int(255) NOT NULL,
  `gameid` int(255) NOT NULL,
  `holeid` int(255) NOT NULL,
  `playerid` int(255) NOT NULL,
  `result` int(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `sc_fg_games`
--
ALTER TABLE `sc_fg_games`
  ADD UNIQUE KEY `id` (`id`);

--
-- Indexes for table `sc_fg_players`
--
ALTER TABLE `sc_fg_players`
  ADD UNIQUE KEY `id` (`id`);

--
-- Indexes for table `sc_fg_results`
--
ALTER TABLE `sc_fg_results`
  ADD UNIQUE KEY `id` (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `sc_fg_players`
--
ALTER TABLE `sc_fg_players`
  MODIFY `id` int(255) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sc_fg_results`
--
ALTER TABLE `sc_fg_results`
  MODIFY `id` int(255) NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
