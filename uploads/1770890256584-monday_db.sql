-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 11, 2026 at 02:14 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `monday_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `boards`
--

CREATE TABLE `boards` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `type` varchar(255) DEFAULT 'board',
  `workspace` varchar(255) DEFAULT 'Main Workspace',
  `folder` varchar(255) DEFAULT 'General',
  `columns` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`columns`)),
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `boards`
--

INSERT INTO `boards` (`id`, `name`, `type`, `workspace`, `folder`, `columns`, `createdAt`, `updatedAt`) VALUES
(1, 'Project Pipeline', 'pipeline', 'Main Workspace', 'Active Projects', '\"[{\\\"id\\\":\\\"status\\\",\\\"title\\\":\\\"Status\\\",\\\"type\\\":\\\"status\\\"},{\\\"id\\\":\\\"priority\\\",\\\"title\\\":\\\"Priority\\\",\\\"type\\\":\\\"status\\\"},{\\\"id\\\":\\\"progress\\\",\\\"title\\\":\\\"Progress\\\",\\\"type\\\":\\\"progress\\\"},{\\\"id\\\":\\\"timeline\\\",\\\"title\\\":\\\"Timeline\\\",\\\"type\\\":\\\"timeline\\\"}]\"', '2026-02-09 09:30:28', '2026-02-09 09:30:28'),
(2, 'SIRA Projects', 'board', 'Main Workspace', 'Active Projects', '\"[{\\\"id\\\":\\\"name\\\",\\\"title\\\":\\\"Item Name\\\",\\\"type\\\":\\\"text\\\"},{\\\"id\\\":\\\"person\\\",\\\"title\\\":\\\"Person\\\",\\\"type\\\":\\\"person\\\"},{\\\"id\\\":\\\"status\\\",\\\"title\\\":\\\"Status\\\",\\\"type\\\":\\\"status\\\"},{\\\"id\\\":\\\"timeline\\\",\\\"title\\\":\\\"Timeline\\\",\\\"type\\\":\\\"timeline\\\"},{\\\"id\\\":\\\"receivedDate\\\",\\\"title\\\":\\\"Received Date\\\",\\\"type\\\":\\\"date\\\"},{\\\"id\\\":\\\"progress\\\",\\\"title\\\":\\\"Progress\\\",\\\"type\\\":\\\"progress\\\"},{\\\"id\\\":\\\"payment\\\",\\\"title\\\":\\\"Payment (Numbers)\\\",\\\"type\\\":\\\"payment\\\"},{\\\"id\\\":\\\"timeTracking\\\",\\\"title\\\":\\\"Time Tracking\\\",\\\"type\\\":\\\"time_tracking\\\"}]\"', '2026-02-09 09:30:28', '2026-02-09 09:30:28'),
(3, 'AI Future Projects', 'ai_future', 'Main Workspace', 'AI & Innovation', '\"[{\\\"id\\\":\\\"person\\\",\\\"title\\\":\\\"Owner\\\",\\\"type\\\":\\\"person\\\"},{\\\"id\\\":\\\"aiModel\\\",\\\"title\\\":\\\"AI Model\\\",\\\"type\\\":\\\"text\\\"},{\\\"id\\\":\\\"status\\\",\\\"title\\\":\\\"Status\\\",\\\"type\\\":\\\"status\\\"},{\\\"id\\\":\\\"risk\\\",\\\"title\\\":\\\"Risk Level\\\",\\\"type\\\":\\\"status\\\"},{\\\"id\\\":\\\"priority\\\",\\\"title\\\":\\\"Priority\\\",\\\"type\\\":\\\"status\\\"},{\\\"id\\\":\\\"timeline\\\",\\\"title\\\":\\\"Timeline\\\",\\\"type\\\":\\\"timeline\\\"},{\\\"id\\\":\\\"progress\\\",\\\"title\\\":\\\"Progress\\\",\\\"type\\\":\\\"progress\\\"}]\"', '2026-02-09 09:30:28', '2026-02-09 09:30:28'),
(4, 'AI R&D Roadmap', 'roadmap', 'Main Workspace', 'AI & Innovation', '\"[{\\\"id\\\":\\\"person\\\",\\\"title\\\":\\\"Owner\\\",\\\"type\\\":\\\"person\\\"},{\\\"id\\\":\\\"status\\\",\\\"title\\\":\\\"Status\\\",\\\"type\\\":\\\"status\\\"},{\\\"id\\\":\\\"timeline\\\",\\\"title\\\":\\\"Timeline\\\",\\\"type\\\":\\\"timeline\\\"},{\\\"id\\\":\\\"progress\\\",\\\"title\\\":\\\"Progress\\\",\\\"type\\\":\\\"progress\\\"}]\"', '2026-02-09 09:30:28', '2026-02-09 09:30:28'),
(5, 'Commercial - SIRA', 'commercial', 'Main Workspace', 'Commercial', '\"[{\\\"id\\\":\\\"person\\\",\\\"title\\\":\\\"Account Manager\\\",\\\"type\\\":\\\"person\\\"},{\\\"id\\\":\\\"dealValue\\\",\\\"title\\\":\\\"Deal Value\\\",\\\"type\\\":\\\"payment\\\"},{\\\"id\\\":\\\"dealStatus\\\",\\\"title\\\":\\\"Deal Status\\\",\\\"type\\\":\\\"status\\\"},{\\\"id\\\":\\\"payment\\\",\\\"title\\\":\\\"Payment %\\\",\\\"type\\\":\\\"progress\\\"},{\\\"id\\\":\\\"invoiceSent\\\",\\\"title\\\":\\\"Invoice Sent\\\",\\\"type\\\":\\\"checkbox\\\"},{\\\"id\\\":\\\"receivedDate\\\",\\\"title\\\":\\\"Expected Close Date\\\",\\\"type\\\":\\\"date\\\"}]\"', '2026-02-09 09:30:28', '2026-02-09 09:30:28'),
(6, 'DM Inquiries - Master Board', 'inquiries', 'Main Workspace', 'Commercial', '\"[{\\\"id\\\":\\\"status\\\",\\\"title\\\":\\\"Status\\\",\\\"type\\\":\\\"status\\\"},{\\\"id\\\":\\\"receivedDate\\\",\\\"title\\\":\\\"Date\\\",\\\"type\\\":\\\"date\\\"},{\\\"id\\\":\\\"person\\\",\\\"title\\\":\\\"Contact\\\",\\\"type\\\":\\\"text\\\"}]\"', '2026-02-09 09:30:28', '2026-02-09 09:30:28'),
(7, 'DM Inquiries', 'board', 'Main Workspace', 'General', '[{\"id\":\"name\",\"title\":\"Inquiry Name\",\"type\":\"text\"},{\"id\":\"person\",\"title\":\"Assignee\",\"type\":\"person\"},{\"id\":\"source\",\"title\":\"Source\",\"type\":\"status\",\"options\":[{\"label\":\"Instagram\",\"color\":\"#e2445c\"},{\"label\":\"Website\",\"color\":\"#0085ff\"},{\"label\":\"Email\",\"color\":\"#00c875\"},{\"label\":\"WhatsApp\",\"color\":\"#25d366\"}]},{\"id\":\"urgency\",\"title\":\"Urgency\",\"type\":\"status\",\"options\":[{\"label\":\"Low\",\"color\":\"#0085ff\"},{\"label\":\"Medium\",\"color\":\"#ffcb00\"},{\"label\":\"High\",\"color\":\"#e2445c\"}]},{\"id\":\"status\",\"title\":\"Status\",\"type\":\"status\",\"options\":[{\"label\":\"New\",\"color\":\"#0085ff\"},{\"label\":\"In Progress\",\"color\":\"#fdab3d\"},{\"label\":\"Resolved\",\"color\":\"#00c875\"},{\"label\":\"Spam\",\"color\":\"#c4c4c4\"}]},{\"id\":\"receivedDate\",\"title\":\"Received Date\",\"type\":\"date\"}]', '2026-02-11 13:01:29', '2026-02-11 13:01:29');

-- --------------------------------------------------------

--
-- Table structure for table `files`
--

CREATE TABLE `files` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `url` varchar(255) NOT NULL,
  `size` int(11) DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `uploadedBy` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `ItemId` int(11) DEFAULT NULL,
  `userId` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `files`
--

INSERT INTO `files` (`id`, `name`, `url`, `size`, `type`, `uploadedBy`, `createdAt`, `updatedAt`, `ItemId`, `userId`) VALUES
(1, 'Manual_Referencia_MedCareEMR.pdf', '/uploads/1770793004767-Manual_Referencia_MedCareEMR.pdf', 9438, 'application/pdf', NULL, '2026-02-11 06:56:44', '2026-02-11 06:56:44', NULL, 1);

-- --------------------------------------------------------

--
-- Table structure for table `folders`
--

CREATE TABLE `folders` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `forms`
--

CREATE TABLE `forms` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `fields` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`fields`)),
  `isPublished` tinyint(1) DEFAULT 0,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `BoardId` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `groups`
--

CREATE TABLE `groups` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `color` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `BoardId` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `groups`
--

INSERT INTO `groups` (`id`, `title`, `color`, `createdAt`, `updatedAt`, `BoardId`) VALUES
(1, 'Mustafa - Project Manager', '#00c875', '2026-02-09 09:30:28', '2026-02-09 09:30:28', 2),
(2, 'Upcoming Concepts', '#579bfc', '2026-02-09 09:30:28', '2026-02-09 09:30:28', 3),
(3, 'Experiments', '#a25ddc', '2026-02-09 09:30:28', '2026-02-09 09:30:28', 3),
(4, 'Active Deals', '#0085ff', '2026-02-09 09:30:28', '2026-02-09 09:30:28', 5),
(5, 'Closed Won', '#00c875', '2026-02-09 09:30:28', '2026-02-09 09:30:28', 5),
(6, 'New Group', '#579bfc', '2026-02-09 11:41:27', '2026-02-09 11:41:27', 4),
(7, 'New Group', '#579bfc', '2026-02-09 11:45:12', '2026-02-09 11:45:12', 1),
(8, 'In Production', '#00c875', '2026-02-11 12:47:21', '2026-02-11 12:47:21', 4),
(9, 'Active Research', '#0085ff', '2026-02-11 12:47:25', '2026-02-11 12:47:25', 4),
(10, 'Active Projects', '#0085ff', '2026-02-11 13:01:29', '2026-02-11 13:01:29', 1),
(11, 'Completed', '#00c875', '2026-02-11 13:01:29', '2026-02-11 13:01:29', 1),
(12, 'Research Phase', '#a25ddc', '2026-02-11 13:01:29', '2026-02-11 13:01:29', 3),
(13, 'New Inquiries', '#0085ff', '2026-02-11 13:01:29', '2026-02-11 13:01:29', 7);

-- --------------------------------------------------------

--
-- Table structure for table `items`
--

CREATE TABLE `items` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `status` varchar(255) DEFAULT NULL,
  `person` varchar(255) DEFAULT NULL,
  `timeline` varchar(255) DEFAULT NULL,
  `receivedDate` varchar(255) DEFAULT NULL,
  `progress` int(11) DEFAULT 0,
  `timeTracking` varchar(255) DEFAULT '00:00:00',
  `payment` decimal(10,2) DEFAULT 0.00,
  `isSubItem` tinyint(1) DEFAULT 0,
  `priority` varchar(255) DEFAULT NULL,
  `risk` varchar(255) DEFAULT NULL,
  `dealValue` decimal(10,2) DEFAULT NULL,
  `dealStatus` varchar(255) DEFAULT NULL,
  `invoiceSent` tinyint(1) DEFAULT 0,
  `aiModel` varchar(255) DEFAULT NULL,
  `customFields` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`customFields`)),
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `GroupId` int(11) DEFAULT NULL,
  `parentItemId` int(11) DEFAULT NULL,
  `assignedToId` int(11) DEFAULT NULL,
  `updates` text DEFAULT NULL,
  `filesData` text DEFAULT NULL,
  `activity` text DEFAULT NULL,
  `subItemsData` text DEFAULT NULL,
  `source` varchar(255) DEFAULT NULL,
  `urgency` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `items`
--

INSERT INTO `items` (`id`, `name`, `status`, `person`, `timeline`, `receivedDate`, `progress`, `timeTracking`, `payment`, `isSubItem`, `priority`, `risk`, `dealValue`, `dealStatus`, `invoiceSent`, `aiModel`, `customFields`, `createdAt`, `updatedAt`, `GroupId`, `parentItemId`, `assignedToId`, `updates`, `filesData`, `activity`, `subItemsData`, `source`, `urgency`) VALUES
(1, 'New Item', 'Done', NULL, NULL, '2026-02-09T10:22:18.398Z', 0, '00:00:00', 0.00, 0, NULL, NULL, NULL, NULL, 0, NULL, NULL, '2026-02-09 10:22:18', '2026-02-09 10:23:27', 1, NULL, 2, NULL, NULL, NULL, NULL, NULL, NULL),
(2, 'Project', 'POC', NULL, '2026-02-12', '2026-02-09T10:55:28.631Z', 0, '00:00:00', 0.00, 0, 'Low', 'High', NULL, NULL, 0, 'Custom', NULL, '2026-02-09 10:55:28', '2026-02-11 12:22:28', 2, NULL, 1, '[{\"id\":1770812525416,\"user\":\"You\",\"text\":\"sdf\",\"time\":\"05:52 PM\",\"reactions\":[\"😊\"]}]', '[{\"id\":1770812532586,\"name\":\"monday_db.sql\",\"size\":\"0.0 MB\",\"type\":\"file\",\"user\":\"You\",\"time\":\"05:52 PM\",\"uploadedAt\":\"2026-02-11T12:22:12.587Z\"}]', '[{\"id\":1770812532587,\"user\":\"You\",\"time\":\"05:52 PM\",\"action\":\"Uploaded file \\\"monday_db.sql\\\"\"},{\"id\":1770812525417,\"user\":\"You\",\"time\":\"05:52 PM\",\"action\":\"Added an update\"}]', NULL, NULL, NULL),
(3, 'New Item', 'Production', NULL, NULL, '2026-02-09T10:55:32.217Z', 0, '00:00:00', 0.00, 0, 'Low', 'Medium', NULL, NULL, 0, 'Claude 3', NULL, '2026-02-09 10:55:32', '2026-02-11 12:32:28', 2, NULL, 1, NULL, NULL, NULL, '[{\"id\":1770812101386,\"name\":\"Name\",\"status\":\"POC\",\"timeline\":\"\",\"progress\":0,\"isSubItem\":true,\"parentItemId\":3,\"aiModel\":\"Llama 3\",\"riskLevel\":\"Low\",\"priority\":\"Critical\",\"risk\":\"Medium\"}]', NULL, NULL),
(4, 'New Item', 'Waiting for Details', NULL, '2026-02-08', '2026-02-09T10:55:55.179Z', 0, '00:00:00', 0.00, 0, NULL, NULL, NULL, NULL, 0, NULL, NULL, '2026-02-09 10:55:55', '2026-02-11 12:50:43', 4, NULL, 3, NULL, NULL, NULL, NULL, NULL, NULL),
(5, 'New Item', 'Done', NULL, NULL, '2026-02-09T10:56:08.421Z', 0, '00:00:00', 0.00, 0, NULL, NULL, NULL, NULL, 0, NULL, NULL, '2026-02-09 10:56:08', '2026-02-11 12:50:53', 4, NULL, 4, NULL, NULL, NULL, NULL, NULL, NULL),
(6, 'New Item', 'Lost', NULL, NULL, '2026-02-09T11:38:18.393Z', 0, '00:00:01', 0.00, 0, NULL, NULL, NULL, NULL, 0, NULL, NULL, '2026-02-09 11:38:18', '2026-02-11 11:43:53', 1, NULL, 2, NULL, NULL, NULL, NULL, NULL, NULL),
(7, 'New Item', '90% Payment', NULL, NULL, '2026-02-09T11:38:32.402Z', 0, '00:00:00', 0.00, 0, NULL, NULL, NULL, NULL, 0, NULL, NULL, '2026-02-09 11:38:32', '2026-02-11 11:32:22', 1, NULL, 2, NULL, NULL, NULL, NULL, NULL, NULL),
(8, 'New Item', 'POC', NULL, 'Feb 8 - Feb 8', '2026-02-09T11:41:27.256Z', 0, '00:00:00', 0.00, 0, 'Critical', 'Low', NULL, NULL, 0, 'Custom', NULL, '2026-02-09 11:41:27', '2026-02-11 13:08:03', 6, NULL, 1, NULL, NULL, NULL, '[{\"id\":1770813420225,\"name\":\"test\",\"status\":\"Research\",\"timeline\":\"\",\"progress\":0,\"isSubItem\":true,\"parentItemId\":8,\"aiModel\":\"Vision\",\"risk\":\"Medium\",\"priority\":\"High\"}]', NULL, NULL),
(9, 'Backend Project ', 'Done', NULL, '2026-02-17', '2026-02-09T11:45:12.769Z', 0, '00:00:07', 0.00, 0, 'High', NULL, NULL, NULL, 0, NULL, NULL, '2026-02-09 11:45:12', '2026-02-11 10:12:14', 7, NULL, 3, '[{\"id\":1770804734734,\"user\":\"You\",\"text\":\"@kiaan techh #sfdsgfg\",\"time\":\"03:42 PM\",\"reactions\":[]},{\"id\":1770804270041,\"user\":\"You\",\"text\":\"sdsad\",\"time\":\"03:34 PM\",\"reactions\":[\"❤️\",\"👍\",\"🔥\"]}]', '[{\"id\":1770804274705,\"name\":\"monday_db.sql\",\"size\":\"0.0 MB\",\"type\":\"file\",\"user\":\"You\",\"time\":\"03:34 PM\",\"uploadedAt\":\"2026-02-11T10:04:34.706Z\"}]', '[{\"id\":1770804734734,\"user\":\"You\",\"time\":\"03:42 PM\",\"action\":\"Added an update\"},{\"id\":1770804274706,\"user\":\"You\",\"time\":\"03:34 PM\",\"action\":\"Uploaded file \\\"monday_db.sql\\\"\"},{\"id\":1770804270042,\"user\":\"You\",\"time\":\"03:34 PM\",\"action\":\"Added an update\"}]', NULL, NULL, NULL),
(11, 'New Item', 'Done', NULL, NULL, '2026-02-11T06:38:38.178Z', 0, '00:00:00', 0.00, 0, NULL, NULL, NULL, NULL, 0, NULL, NULL, '2026-02-11 06:38:38', '2026-02-11 12:51:15', 4, NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL),
(12, 'New Item', '90% Payment', NULL, NULL, '2026-02-11T06:38:39.782Z', 0, '00:00:00', 0.00, 0, NULL, NULL, NULL, NULL, 0, NULL, NULL, '2026-02-11 06:38:39', '2026-02-11 12:50:48', 4, NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL),
(27, 'Demo', 'Waiting for Details', NULL, '2026-02-28', '2026-02-11T09:04:39.618Z', 0, '00:00:00', 0.00, 0, NULL, NULL, NULL, NULL, 0, NULL, NULL, '2026-02-11 09:04:39', '2026-02-11 12:15:57', 7, NULL, 4, NULL, NULL, NULL, '[{\"id\":1770812120202,\"name\":\"name\",\"status\":\"Working on it\",\"timeline\":\"2026-02-12\",\"progress\":0,\"isSubItem\":true,\"parentItemId\":27,\"assignedToId\":3,\"date\":\"2026-02-12\",\"payment\":\"12000\",\"time_tracking\":\"01:20:03\"}]', NULL, NULL),
(31, 'New Item', 'Working on it', NULL, NULL, '2026-02-11T09:20:41.265Z', 0, '00:00:00', 0.00, 0, NULL, NULL, NULL, NULL, 0, NULL, NULL, '2026-02-11 09:20:41', '2026-02-11 09:20:41', 7, NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL),
(33, 'New Item', 'Waiting', NULL, '2026-02-28', '2026-02-11T09:24:45.655Z', 0, '00:00:00', 0.00, 0, NULL, NULL, NULL, NULL, 0, NULL, NULL, '2026-02-11 09:24:45', '2026-02-11 09:25:04', 7, NULL, 5, NULL, NULL, NULL, NULL, NULL, NULL),
(35, 'Demo', 'Waiting for VSS Cert', NULL, '2026-02-27', '2026-02-11T09:29:52.491Z', 12, '00:00:00', 21.00, 0, NULL, NULL, NULL, NULL, 0, NULL, NULL, '2026-02-11 09:29:52', '2026-02-11 09:30:00', 7, NULL, 5, NULL, NULL, NULL, NULL, NULL, NULL),
(38, 'New Project', 'Research', NULL, NULL, '2026-02-11T12:31:17.205Z', 0, '00:00:00', 0.00, 0, 'Critical', 'Low', NULL, NULL, 0, 'Claude 3', NULL, '2026-02-11 12:31:17', '2026-02-11 12:32:05', 3, NULL, 3, '[{\"id\":1770813095743,\"user\":\"You\",\"text\":\"dsfgsd\",\"time\":\"06:01 PM\",\"reactions\":[]}]', '[{\"id\":1770813100393,\"name\":\"monday_db.sql\",\"size\":\"0.0 MB\",\"type\":\"file\",\"user\":\"You\",\"time\":\"06:01 PM\",\"uploadedAt\":\"2026-02-11T12:31:40.394Z\"}]', '[{\"id\":1770813105690,\"user\":\"You\",\"time\":\"06:01 PM\",\"action\":\"Changed priority to \\\"Critical\\\"\"},{\"id\":1770813105692,\"user\":\"You\",\"time\":\"06:01 PM\",\"action\":\"Assigned to kiaan 1\"},{\"id\":1770813100394,\"user\":\"You\",\"time\":\"06:01 PM\",\"action\":\"Uploaded file \\\"monday_db.sql\\\"\"},{\"id\":1770813095744,\"user\":\"You\",\"time\":\"06:01 PM\",\"action\":\"Added an update\"}]', NULL, NULL, NULL),
(40, 'Website Redesign', 'Working on it', NULL, NULL, NULL, 0, '00:00:00', 0.00, 0, NULL, NULL, NULL, NULL, 0, NULL, NULL, '2026-02-11 13:01:29', '2026-02-11 13:01:29', 10, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(41, 'Mobile App API', 'Waiting', NULL, NULL, NULL, 0, '00:00:00', 0.00, 0, NULL, NULL, NULL, NULL, 0, NULL, NULL, '2026-02-11 13:01:29', '2026-02-11 13:01:29', 10, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(42, 'Q1 Security Audit', 'Done', NULL, NULL, NULL, 0, '00:00:00', 0.00, 0, NULL, NULL, NULL, NULL, 0, NULL, NULL, '2026-02-11 13:01:29', '2026-02-11 13:01:29', 11, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(43, 'LLM Fine-tuning', 'Working on it', NULL, NULL, NULL, 0, '00:00:00', 0.00, 0, NULL, NULL, NULL, NULL, 0, NULL, NULL, '2026-02-11 13:01:29', '2026-02-11 13:01:29', 12, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(44, 'Vision Model R&D', 'Stuck', NULL, NULL, NULL, 0, '00:00:00', 0.00, 0, NULL, NULL, NULL, NULL, 0, NULL, NULL, '2026-02-11 13:01:29', '2026-02-11 13:01:29', 12, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(45, 'Inquiry from Instagram', 'Resolved', NULL, NULL, '2026-02-12', 0, '00:00:00', 0.00, 0, NULL, NULL, NULL, NULL, 0, NULL, NULL, '2026-02-11 13:01:29', '2026-02-11 13:03:25', 13, NULL, 3, '[{\"id\":1770814989690,\"user\":\"You\",\"text\":\"sdff\",\"time\":\"06:33 PM\",\"reactions\":[\"❤️\"]}]', '[{\"id\":1770814994378,\"name\":\"monday_db.sql\",\"size\":\"0.0 MB\",\"type\":\"file\",\"user\":\"You\",\"time\":\"06:33 PM\",\"uploadedAt\":\"2026-02-11T13:03:14.379Z\"}]', '[{\"id\":1770814994380,\"user\":\"You\",\"time\":\"06:33 PM\",\"action\":\"Uploaded file \\\"monday_db.sql\\\"\"},{\"id\":1770814989690,\"user\":\"You\",\"time\":\"06:33 PM\",\"action\":\"Added an update\"}]', NULL, 'Email', 'Medium'),
(46, 'Website Contact Form', 'Spam', NULL, NULL, NULL, 0, '00:00:00', 0.00, 0, NULL, NULL, NULL, NULL, 0, NULL, NULL, '2026-02-11 13:01:29', '2026-02-11 13:02:47', 13, NULL, NULL, NULL, NULL, NULL, NULL, 'Instagram', 'Low');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `content` varchar(255) NOT NULL,
  `isRead` tinyint(1) DEFAULT 0,
  `type` varchar(255) DEFAULT NULL,
  `link` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `UserId` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `content`, `isRead`, `type`, `link`, `createdAt`, `updatedAt`, `UserId`) VALUES
(1, 'You have been assigned a task: New Item', 0, 'task_assigned', '/board', '2026-02-09 10:22:26', '2026-02-09 10:22:26', 2),
(2, 'Task \"New Item\" marked as Done by kiaan ', 1, 'task_completed', '/board', '2026-02-09 10:23:27', '2026-02-11 07:57:59', 1),
(3, 'You have been assigned a task: New Item', 0, 'task_assigned', '/board', '2026-02-09 10:56:00', '2026-02-09 10:56:00', 3),
(4, 'You have been assigned a task: New Item', 0, 'task_assigned', '/board', '2026-02-09 10:56:13', '2026-02-09 10:56:13', 4),
(5, 'You have been assigned a task: New Item', 0, 'task_assigned', '/board', '2026-02-09 11:38:22', '2026-02-09 11:38:22', 2),
(6, 'You have been assigned a task: New Item', 0, 'task_assigned', '/board', '2026-02-09 11:38:34', '2026-02-09 11:38:34', 2),
(7, 'Task \"New Item\" marked as Done by System Adm', 0, 'task_completed', '/board', '2026-02-11 06:51:00', '2026-02-11 06:51:00', 3),
(8, 'Task \"New Item\" marked as Done by System Adm', 0, 'task_completed', '/board', '2026-02-11 06:52:56', '2026-02-11 06:52:56', 3),
(9, 'You have been assigned a task: New Item', 0, 'task_assigned', '/board', '2026-02-11 06:53:00', '2026-02-11 06:53:00', 2),
(10, 'You have been assigned a task: New Item', 0, 'task_assigned', '/board', '2026-02-11 06:54:45', '2026-02-11 06:54:45', 2),
(11, 'You have been assigned a task: New Item', 0, 'task_assigned', '/board', '2026-02-11 07:35:40', '2026-02-11 07:35:40', 4),
(12, 'You have been assigned a task: New Item', 0, 'task_assigned', '/board', '2026-02-11 07:35:42', '2026-02-11 07:35:42', 3),
(13, 'You have been assigned a task: New Item', 0, 'task_assigned', '/board', '2026-02-11 07:35:42', '2026-02-11 07:35:42', 2),
(14, 'You have been assigned a task: New Item', 0, 'task_assigned', '/board', '2026-02-11 07:35:50', '2026-02-11 07:35:50', 2),
(15, 'You have been assigned a task: New Item', 0, 'task_assigned', '/board', '2026-02-11 07:35:53', '2026-02-11 07:35:53', 3),
(16, 'You have been assigned a task: New Item', 0, 'task_assigned', '/board', '2026-02-11 07:43:08', '2026-02-11 07:43:08', 3),
(17, 'You have been assigned a task: New Item', 0, 'task_assigned', '/board', '2026-02-11 07:43:09', '2026-02-11 07:43:09', 2),
(18, 'Task \"New Item\" marked as Done by System Adm', 0, 'task_completed', '/board', '2026-02-11 07:57:25', '2026-02-11 07:57:25', 3),
(19, 'Task \"New Item\" marked as Done by System Adm', 0, 'task_completed', '/board', '2026-02-11 07:58:58', '2026-02-11 07:58:58', 3),
(20, 'You have been assigned a task: New Item', 0, 'task_assigned', '/board', '2026-02-11 09:01:19', '2026-02-11 09:01:19', 3),
(21, 'You have been assigned a new task: Demo', 0, 'task_assigned', '/board', '2026-02-11 09:04:39', '2026-02-11 09:04:39', 4),
(22, 'You have been assigned a task: New Item', 0, 'task_assigned', '/board', '2026-02-11 09:24:55', '2026-02-11 09:24:55', 5),
(23, 'You have been assigned a new task: Demo', 0, 'task_assigned', '/board', '2026-02-11 09:29:52', '2026-02-11 09:29:52', 5),
(24, 'You have been assigned a task: New Item', 0, 'task_assigned', '/board', '2026-02-11 09:50:37', '2026-02-11 09:50:37', 3),
(25, 'You have been assigned a task: New Project', 0, 'task_assigned', '/board', '2026-02-11 12:31:45', '2026-02-11 12:31:45', 3),
(26, 'Task \"New Item\" marked as Done by System Adm', 0, 'task_completed', '/board', '2026-02-11 12:50:53', '2026-02-11 12:50:53', 3),
(27, 'Task \"New Item\" marked as Done by System Adm', 0, 'task_completed', '/board', '2026-02-11 12:51:15', '2026-02-11 12:51:15', 3),
(28, 'You have been assigned a task: Inquiry from Instagram', 0, 'task_assigned', '/board', '2026-02-11 13:02:27', '2026-02-11 13:02:27', 3);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('Admin','Manager','User') DEFAULT 'User',
  `avatar` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `avatar`, `phone`, `address`, `status`, `createdAt`, `updatedAt`) VALUES
(1, 'System Adm', 'admin@gmail.com', '$2b$10$Z4MJ1iSqyyNp3SL8y90ILeWM6SOdDziJQFxkbg/DvfcMEfXT9O0qi', 'Admin', NULL, NULL, NULL, 'active', '2026-02-09 09:30:28', '2026-02-10 05:42:43'),
(2, 'kiaan tech', 'k@gmail.com', '$2b$10$Z4MJ1iSqyyNp3SL8y90ILeWM6SOdDziJQFxkbg/DvfcMEfXT9O0qi', 'User', NULL, '1111111111111', 'indore', 'active', '2026-02-09 09:42:21', '2026-02-10 05:45:10'),
(3, 'kiaan 1', 'k1@gmail.com', '$2b$10$Z4MJ1iSqyyNp3SL8y90ILeWM6SOdDziJQFxkbg/DvfcMEfXT9O0qi', 'Admin', NULL, '9090909090090', 'indore', 'active', '2026-02-09 10:28:22', '2026-02-09 10:28:22'),
(4, 'kiaan techh', 'k2@gmail.com', '$2b$10$Z4MJ1iSqyyNp3SL8y90ILeWM6SOdDziJQFxkbg/DvfcMEfXT9O0qi', 'User', NULL, '1111111111111', 'indore', 'active', '2026-02-09 10:30:10', '2026-02-09 10:30:10'),
(5, 'rdewq', 'dewq@gmail.com', '$2b$10$Z4MJ1iSqyyNp3SL8y90ILeWM6SOdDziJQFxkbg/DvfcMEfXT9O0qi', 'User', NULL, 'uytrewq', 'qawdefrgnh', 'active', '2026-02-11 07:35:16', '2026-02-11 07:35:16');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `boards`
--
ALTER TABLE `boards`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `files`
--
ALTER TABLE `files`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ItemId` (`ItemId`),
  ADD KEY `userId` (`userId`);

--
-- Indexes for table `folders`
--
ALTER TABLE `folders`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `forms`
--
ALTER TABLE `forms`
  ADD PRIMARY KEY (`id`),
  ADD KEY `BoardId` (`BoardId`);

--
-- Indexes for table `groups`
--
ALTER TABLE `groups`
  ADD PRIMARY KEY (`id`),
  ADD KEY `BoardId` (`BoardId`);

--
-- Indexes for table `items`
--
ALTER TABLE `items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `GroupId` (`GroupId`),
  ADD KEY `parentItemId` (`parentItemId`),
  ADD KEY `assignedToId` (`assignedToId`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `UserId` (`UserId`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `email_2` (`email`),
  ADD UNIQUE KEY `email_3` (`email`),
  ADD UNIQUE KEY `email_4` (`email`),
  ADD UNIQUE KEY `email_5` (`email`),
  ADD UNIQUE KEY `email_6` (`email`),
  ADD UNIQUE KEY `email_7` (`email`),
  ADD UNIQUE KEY `email_8` (`email`),
  ADD UNIQUE KEY `email_9` (`email`),
  ADD UNIQUE KEY `email_10` (`email`),
  ADD UNIQUE KEY `email_11` (`email`),
  ADD UNIQUE KEY `email_12` (`email`),
  ADD UNIQUE KEY `email_13` (`email`),
  ADD UNIQUE KEY `email_14` (`email`),
  ADD UNIQUE KEY `email_15` (`email`),
  ADD UNIQUE KEY `email_16` (`email`),
  ADD UNIQUE KEY `email_17` (`email`),
  ADD UNIQUE KEY `email_18` (`email`),
  ADD UNIQUE KEY `email_19` (`email`),
  ADD UNIQUE KEY `email_20` (`email`),
  ADD UNIQUE KEY `email_21` (`email`),
  ADD UNIQUE KEY `email_22` (`email`),
  ADD UNIQUE KEY `email_23` (`email`),
  ADD UNIQUE KEY `email_24` (`email`),
  ADD UNIQUE KEY `email_25` (`email`),
  ADD UNIQUE KEY `email_26` (`email`),
  ADD UNIQUE KEY `email_27` (`email`),
  ADD UNIQUE KEY `email_28` (`email`),
  ADD UNIQUE KEY `email_29` (`email`),
  ADD UNIQUE KEY `email_30` (`email`),
  ADD UNIQUE KEY `email_31` (`email`),
  ADD UNIQUE KEY `email_32` (`email`),
  ADD UNIQUE KEY `email_33` (`email`),
  ADD UNIQUE KEY `email_34` (`email`),
  ADD UNIQUE KEY `email_35` (`email`),
  ADD UNIQUE KEY `email_36` (`email`),
  ADD UNIQUE KEY `email_37` (`email`),
  ADD UNIQUE KEY `email_38` (`email`),
  ADD UNIQUE KEY `email_39` (`email`),
  ADD UNIQUE KEY `email_40` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `boards`
--
ALTER TABLE `boards`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `files`
--
ALTER TABLE `files`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `folders`
--
ALTER TABLE `folders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `forms`
--
ALTER TABLE `forms`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `groups`
--
ALTER TABLE `groups`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `items`
--
ALTER TABLE `items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `files`
--
ALTER TABLE `files`
  ADD CONSTRAINT `files_ibfk_1` FOREIGN KEY (`ItemId`) REFERENCES `items` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `files_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `forms`
--
ALTER TABLE `forms`
  ADD CONSTRAINT `forms_ibfk_1` FOREIGN KEY (`BoardId`) REFERENCES `boards` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `groups`
--
ALTER TABLE `groups`
  ADD CONSTRAINT `groups_ibfk_1` FOREIGN KEY (`BoardId`) REFERENCES `boards` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `items`
--
ALTER TABLE `items`
  ADD CONSTRAINT `items_ibfk_1` FOREIGN KEY (`GroupId`) REFERENCES `groups` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `items_ibfk_2` FOREIGN KEY (`parentItemId`) REFERENCES `items` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `items_ibfk_3` FOREIGN KEY (`assignedToId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
