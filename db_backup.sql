-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: mysql-quickbite.alwaysdata.net    Database: quickbite_db
-- ------------------------------------------------------
-- Server version	11.4.12-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `attendance`
--

DROP TABLE IF EXISTS `attendance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `attendance` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `staff_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `status` enum('Present','Absent','Late') DEFAULT 'Present',
  `check_in_time` time DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `staff_id` (`staff_id`),
  CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendance`
--

LOCK TABLES `attendance` WRITE;
/*!40000 ALTER TABLE `attendance` DISABLE KEYS */;
INSERT INTO `attendance` VALUES (3,5,'2026-04-22','Present','09:00:00','2026-04-22 05:59:09');
/*!40000 ALTER TABLE `attendance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `img` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (5,'Pasta','https://res.cloudinary.com/dovuegkwa/image/upload/v1778050964/blob_r3pvdi.jpg'),(6,'burger','https://res.cloudinary.com/dovuegkwa/image/upload/v1775158516/blob_haldl2.jpg'),(7,'Potato Corner','https://res.cloudinary.com/dovuegkwa/image/upload/v1778051915/blob_gfnkzy.jpg'),(8,'Pizza','https://res.cloudinary.com/dovuegkwa/image/upload/v1783419832/blob_bx4hho.png'),(9,'Grilled Wings','https://res.cloudinary.com/dovuegkwa/image/upload/v1778050943/blob_p8c662.jpg'),(10,'drinks','https://res.cloudinary.com/dovuegkwa/image/upload/v1783420982/blob_fjjrmz.png'),(11,'Wraps','https://res.cloudinary.com/dovuegkwa/image/upload/v1778050918/blob_walnse.jpg'),(12,'Shawarma','https://res.cloudinary.com/dovuegkwa/image/upload/v1778050893/blob_jb7ivq.jpg'),(13,'Fried Chicken','https://res.cloudinary.com/dovuegkwa/image/upload/v1778050238/blob_reqf6l.jpg'),(14,'Sauses','https://res.cloudinary.com/dovuegkwa/image/upload/v1783419247/blob_nvfnbe.png'),(15,'Broast','https://res.cloudinary.com/dovuegkwa/image/upload/v1780986351/blob_qyth3e.jpg');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `deal_items`
--

DROP TABLE IF EXISTS `deal_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `deal_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `deal_id` int(11) NOT NULL,
  `menu_item_id` int(11) NOT NULL,
  `variant_id` int(11) DEFAULT NULL,
  `quantity` int(11) DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `deal_id` (`deal_id`),
  CONSTRAINT `deal_items_ibfk_1` FOREIGN KEY (`deal_id`) REFERENCES `deals` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `deal_items`
--

LOCK TABLES `deal_items` WRITE;
/*!40000 ALTER TABLE `deal_items` DISABLE KEYS */;
INSERT INTO `deal_items` VALUES (1,1,39,NULL,1),(2,1,47,NULL,1);
/*!40000 ALTER TABLE `deal_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `deals`
--

DROP TABLE IF EXISTS `deals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `deals` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `img` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_permanent` tinyint(1) DEFAULT 1,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `deals`
--

LOCK TABLES `deals` WRITE;
/*!40000 ALTER TABLE `deals` DISABLE KEYS */;
INSERT INTO `deals` VALUES (1,'wings',400.00,'https://res.cloudinary.com/dovuegkwa/image/upload/v1778305095/blob_kj1f5v.jpg',1,'2026-05-09 05:38:17',1,NULL,NULL);
/*!40000 ALTER TABLE `deals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hero_sliders`
--

DROP TABLE IF EXISTS `hero_sliders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `hero_sliders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `image_url` varchar(500) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `subtitle` varchar(255) DEFAULT NULL,
  `link_url` varchar(255) DEFAULT NULL,
  `sort_order` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hero_sliders`
--

LOCK TABLES `hero_sliders` WRITE;
/*!40000 ALTER TABLE `hero_sliders` DISABLE KEYS */;
INSERT INTO `hero_sliders` VALUES (3,'https://res.cloudinary.com/dovuegkwa/image/upload/v1783416684/hero_1_rhco6o.png','Delicious Fast Food','Experience the best taste in town','',1,1,'2026-06-10 06:53:27'),(4,'https://res.cloudinary.com/dovuegkwa/image/upload/v1781074351/image_zru702.jpg','Juicy Burgers','Made with fresh ingredients',NULL,2,1,'2026-06-10 06:53:27'),(5,'https://res.cloudinary.com/dovuegkwa/image/upload/v1781097682/StrawberryChesseCake_kmctyu.jpg','Hot & Fresh Pizza','Baked to perfection','',1,1,'2026-06-10 06:53:27'),(6,'https://res.cloudinary.com/dovuegkwa/image/upload/v1781074372/image_d3pr1a.jpg','Crispy Fried Chicken','Golden and crunchy',NULL,4,1,'2026-06-10 06:53:27'),(7,'https://res.cloudinary.com/dovuegkwa/image/upload/v1781074940/Pizza_vozrdy.jpg','top deals','','',1,1,'2026-06-10 07:02:06');
/*!40000 ALTER TABLE `hero_sliders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `homepage_sections`
--

DROP TABLE IF EXISTS `homepage_sections`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `homepage_sections` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `section_type` varchar(50) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `subtitle` varchar(255) DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `link_url` varchar(255) DEFAULT NULL,
  `content_data` text DEFAULT NULL,
  `sort_order` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `slider_type` varchar(50) DEFAULT 'regular',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `homepage_sections`
--

LOCK TABLES `homepage_sections` WRITE;
/*!40000 ALTER TABLE `homepage_sections` DISABLE KEYS */;
INSERT INTO `homepage_sections` VALUES (1,'hero','Hero Slider',NULL,NULL,NULL,NULL,1,1,'2026-06-09 15:03:19','regular'),(2,'explore_menu','Explore Menu',NULL,NULL,NULL,NULL,2,1,'2026-06-09 15:03:19','regular'),(3,'product_slider','BEST SELLERS','','','','custom:25,49,45,52,46,48',1,1,'2026-06-09 15:03:19','regular'),(5,'product_slider','TOP DEALS & COMBOS','','','','filter:top_deals',3,1,'2026-06-09 15:03:19','stacked'),(6,'product_slider','Pizza','','','','category:Pizza',5,1,'2026-06-10 12:38:40','stacked'),(7,'banner','Summer Deals','','https://res.cloudinary.com/dovuegkwa/image/upload/v1783432123/Gemini_Generated_Image_ef68n6ef68n6ef68_r16kbv.png','','[{\"title\":\"Summers Deal\",\"subtitle\":\"Thunder Fille Burger\",\"link_url\":\"product:50\",\"image_url\":\"https://res.cloudinary.com/dovuegkwa/image/upload/v1783432123/Gemini_Generated_Image_ef68n6ef68n6ef68_r16kbv.png\"},{\"title\":\"Summers Deal\",\"subtitle\":\"Chilled and Fresh Strawberry Lemonade\",\"link_url\":\"deal:1\",\"image_url\":\"https://res.cloudinary.com/dovuegkwa/image/upload/v1783432151/Gemini_Generated_Image_ulhu44ulhu44ulhu_1_pc9cpj.png\"},{\"title\":\"Summers Deal\",\"subtitle\":\"Mixed Ice Cream with Waffers\",\"link_url\":\"\",\"image_url\":\"https://res.cloudinary.com/dovuegkwa/image/upload/v1783432189/Gemini_Generated_Image_ulhu44ulhu44ulhu_zvlnjx.png\"},{\"title\":\"Midnight Deal\",\"subtitle\":\"BigBite Speacil Chezzy Pizza\",\"link_url\":\"\",\"image_url\":\"https://res.cloudinary.com/dovuegkwa/image/upload/v1783432224/hero_1_e2ounf.png\"}]',1,1,'2026-06-10 12:48:01','regular'),(8,'product_slider','Chefs Speacial','','','','custom:51,48,46,45,33,35,37,57,30,27,49',1,1,'2026-06-10 13:15:54','bento'),(10,'product_slider','Winter Deals','','','','custom:25,26,35,37,39,36,52,48,49,54',1,1,'2026-06-11 06:51:21','stacked'),(11,'product_slider','pastaz','','','','category:Pasta',9,1,'2026-06-16 22:01:24','regular');
/*!40000 ALTER TABLE `homepage_sections` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventory`
--

DROP TABLE IF EXISTS `inventory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inventory` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `stock` decimal(10,2) NOT NULL DEFAULT 0.00,
  `unit` varchar(50) NOT NULL DEFAULT 'kg',
  `price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `threshold` decimal(10,2) NOT NULL DEFAULT 5.00,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory`
--

LOCK TABLES `inventory` WRITE;
/*!40000 ALTER TABLE `inventory` DISABLE KEYS */;
INSERT INTO `inventory` VALUES (3,'Burger Bun',145.00,'pcs',150.00,10.00),(4,'Shawarama Bread',146.00,'pcs',30.00,10.00),(5,'Pizza Dough',2150.00,'g',0.30,1000.00),(6,'Potato',19650.00,'g',0.10,1000.00),(7,'Onion',18640.00,'g',0.20,1000.00),(8,'Tomato',18920.00,'g',0.20,1000.00),(9,'Mashroom',14910.00,'g',0.50,1000.00),(10,'Black Olive',19914.98,'g',1.00,1000.00),(11,'Cheese',8250.00,'g',1.00,1000.00),(12,'Cheese Slice',500.00,'pcs',50.00,50.00),(13,'Jelapeno',4970.00,'g',0.20,1000.00),(14,'Mozarella Cheese',4900.00,'g',0.50,1000.00),(15,'Chadder Cheese',19900.00,'g',0.50,1000.00),(16,'Chicken Breast',20.00,'kg',600.00,5.00),(17,'Chicken Wings',300.00,'pcs',20.00,50.00),(18,'Chicken Thaigh',20.00,'kg',600.00,5.00),(19,'Chicken Leg',150.00,'pcs',70.00,50.00),(20,'White Mayonise',9400.00,'g',0.40,1000.00),(21,'Ketchup',19700.00,'g',0.30,1000.00),(22,'Boneless Chicken',6500.00,'g',0.50,1000.00),(23,'Capsicum',20000.00,'g',0.10,1000.00),(24,'Sause',14430.00,'g',0.50,1000.00),(25,'Chilli',9980.00,'g',0.30,1000.00),(26,'Salad',19730.00,'g',0.20,1000.00),(27,'Chicken Patty',496.00,'pcs',150.00,50.00),(28,'Chicken Steak',500.00,'pcs',150.00,50.00),(29,'Paratha',100.00,'pcs',50.00,20.00),(30,'Garlic Mayo',19850.00,'g',0.40,1000.00);
/*!40000 ALTER TABLE `inventory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `menu_addons`
--

DROP TABLE IF EXISTS `menu_addons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `menu_addons` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `menu_item_id` int(11) NOT NULL,
  `addon_name` varchar(255) NOT NULL,
  `addon_price` decimal(10,2) NOT NULL,
  `inventory_id` int(11) NOT NULL,
  `qty_to_deduct` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `menu_addons`
--

LOCK TABLES `menu_addons` WRITE;
/*!40000 ALTER TABLE `menu_addons` DISABLE KEYS */;
INSERT INTO `menu_addons` VALUES (3,21,'extra petty',200.00,2,2.00),(4,21,'extra cheese',0.00,1,1.00);
/*!40000 ALTER TABLE `menu_addons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `menu_items`
--

DROP TABLE IF EXISTS `menu_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `menu_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `price` varchar(50) NOT NULL,
  `category` varchar(100) NOT NULL,
  `size` varchar(50) DEFAULT 'Regular',
  `img` text DEFAULT NULL,
  `isAvailable` tinyint(1) DEFAULT 1,
  `isTopDeal` tinyint(1) DEFAULT 0,
  `isBestSeller` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=58 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `menu_items`
--

LOCK TABLES `menu_items` WRITE;
/*!40000 ALTER TABLE `menu_items` DISABLE KEYS */;
INSERT INTO `menu_items` VALUES (25,'Malai Boti','','','Pizza','Regular','https://res.cloudinary.com/dovuegkwa/image/upload/v1783422037/blob_d5eneu.png',1,0,0,'2026-05-06 07:08:21'),(26,'Chicken Tikka','','','Pizza','Regular','https://res.cloudinary.com/dovuegkwa/image/upload/v1783425256/blob_jwwi7p.png',1,1,0,'2026-05-06 07:09:21'),(27,'Chicken Fagitta','','','Pizza','Regular','https://res.cloudinary.com/dovuegkwa/image/upload/v1778139219/blob_atx3bq.jpg',1,0,0,'2026-05-06 07:10:16'),(28,'Supreme','','','Pizza','Regular','https://res.cloudinary.com/dovuegkwa/image/upload/v1778139256/blob_rirome.jpg',1,1,1,'2026-05-06 07:11:38'),(29,'Hot & Spicy','','','Pizza','Regular','https://res.cloudinary.com/dovuegkwa/image/upload/v1778139309/blob_kfb0gh.jpg',1,0,0,'2026-05-06 07:13:06'),(30,'Vegetarian','','','Pizza','Regular','https://res.cloudinary.com/dovuegkwa/image/upload/v1778139358/blob_u3chye.jpg',1,1,0,'2026-05-06 07:13:51'),(31,'Cheezy Veezy','','','Pizza','Regular','https://res.cloudinary.com/dovuegkwa/image/upload/v1778139404/blob_ib3nm2.jpg',1,0,0,'2026-05-06 07:14:30'),(32,'Peri Peri','','','Pizza','Regular','https://res.cloudinary.com/dovuegkwa/image/upload/v1778139736/blob_k2e5qx.jpg',1,1,0,'2026-05-06 07:15:43'),(33,'Big Bite Seacial','','','Pizza','Regular','https://res.cloudinary.com/dovuegkwa/image/upload/v1778051803/blob_mctqch.jpg',1,0,0,'2026-05-06 07:16:30'),(34,'Zinger Burger','','','burger','Regular','https://res.cloudinary.com/dovuegkwa/image/upload/v1778052047/blob_xesqfz.jpg',1,0,0,'2026-05-06 07:18:03'),(35,'Thunder Fillet Burger','','','burger','Regular','https://res.cloudinary.com/dovuegkwa/image/upload/v1778052159/blob_mvtwtv.jpg',1,0,0,'2026-05-06 07:22:35'),(36,'Double Crispy Patty','','','burger','Regular','https://res.cloudinary.com/dovuegkwa/image/upload/v1778052304/blob_hr3dqu.jpg',1,0,0,'2026-05-06 07:24:51'),(37,'Double Steak','','','burger','Regular','https://res.cloudinary.com/dovuegkwa/image/upload/v1778052499/blob_mbllci.jpg',1,0,0,'2026-05-06 07:28:07'),(38,'Grilled Wings','','','Grilled Wings','Regular','https://res.cloudinary.com/dovuegkwa/image/upload/v1778052563/blob_t3z3ar.jpg',1,0,0,'2026-05-06 07:29:10'),(39,'Peri Peri Wings','','','Grilled Wings','Regular','https://res.cloudinary.com/dovuegkwa/image/upload/v1778052679/blob_gbsrs5.jpg',1,0,0,'2026-05-06 07:31:06'),(40,'Plain Fries','','','Potato Corner','Regular','https://res.cloudinary.com/dovuegkwa/image/upload/v1778052801/blob_rlnwr5.jpg',1,0,0,'2026-05-06 07:33:08'),(41,'Masala Fries','','','Potato Corner','Regular','https://res.cloudinary.com/dovuegkwa/image/upload/v1778052881/blob_cm5cp9.jpg',1,0,0,'2026-05-06 07:34:28'),(42,'Garlic Mayo Fries','','','Potato Corner','Regular','https://res.cloudinary.com/dovuegkwa/image/upload/v1778052992/blob_i7n134.jpg',1,0,0,'2026-05-06 07:36:19'),(43,'Loaded Fries','','','Potato Corner','Regular','https://res.cloudinary.com/dovuegkwa/image/upload/v1778053055/blob_mlcast.jpg',1,0,0,'2026-05-06 07:37:22'),(44,'Peri Peri Pasta','','','Pasta','Regular','https://res.cloudinary.com/dovuegkwa/image/upload/v1778053145/blob_xlnvbr.jpg',1,0,0,'2026-05-06 07:38:52'),(45,'Microni Pasta','','','Pasta','Regular','https://res.cloudinary.com/dovuegkwa/image/upload/v1778053234/blob_j4fa6e.jpg',1,0,0,'2026-05-06 07:40:20'),(46,'Big Bite Speacial Pasta','','','Pasta','Regular','https://res.cloudinary.com/dovuegkwa/image/upload/v1778053305/blob_srqd6a.jpg',1,0,0,'2026-05-06 07:41:33'),(47,'Coke','','','drinks','Regular','https://res.cloudinary.com/dovuegkwa/image/upload/v1778053498/blob_xkbg5n.jpg',1,0,0,'2026-05-06 07:44:45'),(48,'Tortilla Wrap','','','Wraps','Regular','https://res.cloudinary.com/dovuegkwa/image/upload/v1778053596/blob_gghjgv.jpg',1,0,0,'2026-05-06 07:46:22'),(49,'Steak Wrap','','','Wraps','Regular','https://res.cloudinary.com/dovuegkwa/image/upload/v1778053646/blob_sid9xn.jpg',1,0,0,'2026-05-06 07:47:13'),(50,'Paratha Roll','','','Wraps','Regular','https://res.cloudinary.com/dovuegkwa/image/upload/v1778053692/blob_tfmaur.jpg',1,0,0,'2026-05-06 07:47:59'),(51,'Zinger Twister Paratha Roll','','','Wraps','Regular','https://res.cloudinary.com/dovuegkwa/image/upload/v1778053751/blob_uznimi.jpg',1,0,0,'2026-05-06 07:48:58'),(52,'Chapli Shawarama','','','Shawarma','Regular','https://res.cloudinary.com/dovuegkwa/image/upload/v1778053809/blob_eaygfj.jpg',1,0,0,'2026-05-06 07:49:56'),(53,'Zinger Shawarama','','','Shawarma','Regular','https://res.cloudinary.com/dovuegkwa/image/upload/v1778053861/blob_npoilx.jpg',1,0,0,'2026-05-06 07:50:47'),(54,'Fried Chicken','','','Fried Chicken','Regular','https://res.cloudinary.com/dovuegkwa/image/upload/v1778053931/blob_lvqoli.jpg',1,0,0,'2026-05-06 07:51:57'),(55,'Hot Wings','','','Fried Chicken','Regular','https://res.cloudinary.com/dovuegkwa/image/upload/v1778054007/blob_ydb6yw.jpg',1,0,0,'2026-05-06 07:53:13'),(56,'Sauses','','','Sauses','Regular','https://res.cloudinary.com/dovuegkwa/image/upload/v1778054144/blob_pxjf9d.jpg',1,0,0,'2026-05-06 07:55:30'),(57,'Injected Broast','','','Broast','Regular','https://res.cloudinary.com/dovuegkwa/image/upload/v1778054355/blob_gtxl6n.jpg',1,0,0,'2026-05-06 07:59:01');
/*!40000 ALTER TABLE `menu_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `menu_variants`
--

DROP TABLE IF EXISTS `menu_variants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `menu_variants` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `menu_id` int(11) NOT NULL,
  `size_name` varchar(50) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `in_stock` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `menu_id` (`menu_id`),
  CONSTRAINT `menu_variants_ibfk_1` FOREIGN KEY (`menu_id`) REFERENCES `menu_items` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=127 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `menu_variants`
--

LOCK TABLES `menu_variants` WRITE;
/*!40000 ALTER TABLE `menu_variants` DISABLE KEYS */;
INSERT INTO `menu_variants` VALUES (51,33,'Medium',1290.00,1),(52,33,'Large',1690.00,1),(54,34,'Regular',330.00,1),(55,35,'Regular',350.00,1),(57,36,'Regular',380.00,1),(58,37,'Regular',450.00,1),(59,38,'5 Pcs',250.00,1),(60,38,'10 pcs',470.00,1),(61,39,'5 Pcs',270.00,1),(62,39,'10 Pcs',490.00,1),(63,40,'Small',150.00,1),(64,41,'Small',170.00,1),(65,42,'Small',220.00,1),(66,43,'Small',450.00,1),(67,43,'Large',650.00,1),(68,44,'Small',500.00,1),(69,44,'Large',700.00,1),(70,45,'Small',500.00,1),(71,45,'Large',700.00,1),(72,46,'Small',550.00,1),(73,46,'Large',750.00,1),(74,47,'345ml',110.00,1),(75,47,'500ml',130.00,1),(76,47,'1500ml',200.00,1),(77,48,'Regular',450.00,1),(78,49,'Regular',450.00,1),(79,50,'Regular',250.00,1),(80,51,'Regular',350.00,1),(81,52,'Regular',230.00,1),(82,53,'Regular',330.00,1),(83,54,'3 Pcs',550.00,1),(84,54,'5 Pcs',950.00,1),(85,54,'10 Pcs',1800.00,1),(86,55,'5 Pcs',250.00,1),(87,55,'10 Pcs',480.00,1),(88,56,'Speacial Dip Sause',80.00,1),(89,56,'Garlic Sause',80.00,1),(90,56,'Chiplotle Sause',80.00,1),(91,56,'Mughalai Sause',80.00,1),(92,57,'Quarter',650.00,1),(93,57,'Half',1200.00,1),(94,57,'Full',2200.00,1),(104,27,'Small',590.00,1),(105,27,'Medium',1150.00,1),(106,27,'Large',1590.00,1),(107,28,'Small',590.00,1),(108,28,'Medium',1147.00,1),(109,28,'Large',1590.00,1),(110,29,'Small',590.00,1),(111,29,'Medium',1150.00,1),(112,29,'Large',1590.00,1),(113,30,'Small',490.00,1),(114,30,'Medium',990.00,1),(115,30,'Large',1390.00,1),(116,31,'Small',490.00,1),(117,31,'Medium',990.00,1),(118,31,'Large',1390.00,1),(119,32,'Medium',1290.00,1),(120,32,'Large',1690.00,1),(121,25,'Small',589.00,1),(122,25,'Medium',1150.00,1),(123,25,'Large',1590.00,1),(124,26,'Small',590.00,1),(125,26,'Medium',1190.00,1),(126,26,'Large',1590.00,1);
/*!40000 ALTER TABLE `menu_variants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `order_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` int(11) NOT NULL,
  `title` varchar(100) NOT NULL,
  `size` varchar(50) DEFAULT 'Regular',
  `note` text DEFAULT NULL,
  `qty` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `cost_price` decimal(10,2) DEFAULT 0.00,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=134 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (56,51,'chicken','Regular','',1,123.00,0.00),(57,63,'Salad','Regular','',1,300.00,0.00),(58,64,'zinger','Regular','',1,124.00,0.00),(59,65,'chicken','Regular','',1,123.00,0.00),(60,66,'Salad','Regular','',1,300.00,0.00),(61,67,'zinger','Regular','',1,124.00,0.00),(62,67,'extra petty','Extra','For undefined',1,200.00,0.00),(63,68,'zinger','Regular','',1,124.00,0.00),(64,68,'extra petty','Extra','For zinger',1,200.00,0.00),(65,69,'zinger','Regular','Without: burger petty',1,124.00,0.00),(66,69,'extra cheese','Extra','For zinger',1,0.00,0.00),(67,70,'zinger','Regular','',1,124.00,0.00),(68,71,'zinger','Regular','',1,124.00,0.00),(69,72,'zinger','Regular','',2,124.00,0.00),(70,73,'zinger','Regular','',1,124.00,0.00),(71,73,'extra cheese','Extra','For zinger',1,0.00,0.00),(72,74,'chicken','Regular','',1,123.00,0.00),(73,75,'chicken','Regular','',1,123.00,0.00),(74,76,'chicken','Regular','',1,123.00,0.00),(75,77,'zinger','Regular','',1,124.00,0.00),(76,78,'chicken','Regular','',1,123.00,0.00),(77,79,'Salad','Regular','',1,300.00,0.00),(78,80,'chicken','Regular','',1,123.00,0.00),(79,81,'Cheezy Veezy','Medium','',1,990.00,210.00),(80,82,'Hot Wings','10 Pcs','',1,480.00,0.00),(81,83,'wings','Combo','Special Combo Deal',1,400.00,0.00),(82,84,'wings','Combo','Items: 1x Peri Peri Wings, 1x Coke',1,400.00,0.00),(83,85,'Supreme','Small','',1,590.00,280.00),(84,85,'Sauses','Mughalai Sause','',1,80.00,0.00),(85,86,'Injected Broast','Quarter','',1,650.00,0.00),(86,87,'Chicken Tikka','Small','',1,590.00,295.00),(87,88,'Chapli Shawarama','Regular','',1,230.00,225.00),(88,89,'Zinger Shawarama','Regular','',1,330.00,121.00),(89,90,'Malai Boti','Small','',1,589.00,405.00),(90,91,'Supreme','Small','',1,590.00,280.00),(91,91,'Cheezy Veezy','Large','',1,1390.00,300.00),(92,92,'Thunder Fillet Burger','Regular','',1,350.00,115.00),(93,93,'Supreme','Small','',1,590.00,280.00),(94,94,'Cheezy Veezy','Large','',1,1190.00,300.00),(95,95,'Cheezy Veezy','Large','',1,1390.00,300.00),(96,96,'Cheezy Veezy','Large','',2,1190.00,300.00),(97,97,'Cheezy Veezy','Large','',2,1190.00,300.00),(98,98,'Cheezy Veezy','Large','',2,1190.00,300.00),(99,99,'Malai Boti','Small','',1,500.00,405.00),(100,100,'Malai Boti','Small','',1,500.00,405.00),(101,101,'Malai Boti','Small','',1,500.00,405.00),(102,102,'Malai Boti','Small','',1,500.00,405.00),(103,103,'Supreme','Medium','',1,1147.00,395.02),(104,104,'Double Crispy Patty','Regular','',1,380.00,380.00),(105,105,'Malai Boti','Small','',1,589.00,405.00),(106,106,'Chapli Shawarama','Regular','Without: Tomato | Extra Mayo, Extra Creamy',1,230.00,225.00),(107,107,'Tortilla Wrap','Regular','',1,450.00,110.00),(108,108,'Chicken Tikka','Small','',1,590.00,295.00),(109,109,'Thunder Fillet Burger','Regular','Without: Onion | Benchood jaldi ly k aana',2,350.00,115.00),(110,110,'Loaded Fries','Large','Extra cheese',1,650.00,212.00),(111,111,'Malai Boti','Small','',1,589.00,405.00),(112,112,'Supreme','Small','',1,590.00,280.00),(113,113,'Supreme','Small','',1,590.00,280.00),(114,114,'Grilled Wings','5 Pcs','',1,250.00,0.00),(115,115,'Peri Peri','Medium','',1,1290.00,0.00),(116,116,'Chicken Tikka','Small','',1,590.00,295.00),(117,117,'Garlic Mayo Fries','Small','',1,220.00,68.00),(118,118,'Malai Boti','Small','',1,589.00,405.00),(119,119,'Malai Boti','Small','',1,589.00,405.00),(120,120,'Malai Boti','Small','',1,589.00,405.00),(121,121,'Malai Boti','Small','',1,589.00,405.00),(122,122,'Malai Boti','Small','',1,589.00,405.00),(123,123,'Zinger Burger','Regular','',1,330.00,130.00),(124,124,'Zinger Burger','Regular','',1,330.00,230.00),(125,125,'Microni Pasta','Small','',1,500.00,0.00),(126,126,'Supreme','Small','',1,590.00,280.00),(127,127,'Tortilla Wrap','Regular','Without: Onion | With extra sauce \nPlease',1,450.00,108.00),(128,128,'Chapli Shawarama','Regular','',1,230.00,225.00),(129,129,'Chicken Fagitta','Small','',1,590.00,287.00),(130,130,'Malai Boti','Small','',1,589.00,405.00),(131,131,'Microni Pasta','Small','',1,500.00,0.00),(132,132,'Hot Wings','5 Pcs','',1,250.00,0.00),(133,133,'Big Bite Speacial Pasta','Large','',1,750.00,0.00);
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `orders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_type` varchar(50) DEFAULT NULL,
  `customer_name` varchar(100) DEFAULT NULL,
  `customer_mobile` varchar(20) DEFAULT NULL,
  `customer_address` text DEFAULT NULL,
  `house_no` varchar(100) DEFAULT NULL,
  `street` varchar(255) DEFAULT NULL,
  `area` varchar(255) DEFAULT NULL,
  `table_number` varchar(50) DEFAULT NULL,
  `total` decimal(10,2) NOT NULL,
  `status` varchar(50) DEFAULT 'Pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `rider_id` int(11) DEFAULT NULL,
  `payment_status` varchar(50) DEFAULT 'Pending',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=134 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (51,'delivery','muneeeeb','123','lahoreeeeeee',NULL,NULL,NULL,NULL,123.00,'Delivered','2026-04-29 06:16:10',13,'Pending'),(53,'dine_in','Wali Muhammad','03224042327',', ,',NULL,NULL,NULL,NULL,123.00,'Delivered','2026-04-30 07:19:03',NULL,'Pending'),(54,'dine_in','Faiz','0324567876',', ,',NULL,NULL,NULL,NULL,450.00,'Delivered','2026-04-30 07:19:59',NULL,'Pending'),(55,'takeaway','muneeb','12345678',', ,',NULL,NULL,NULL,NULL,123.00,'Delivered','2026-04-30 07:23:39',NULL,'Pending'),(56,'takeaway','sami','123',', ,',NULL,NULL,NULL,NULL,324.00,'Delivered','2026-04-30 07:29:06',NULL,'Pending'),(57,'dine_in','sami','123456',', ,',NULL,NULL,NULL,NULL,124.00,'Delivered','2026-04-30 07:35:16',NULL,'Pending'),(63,'Dine-In','Walk-in',NULL,'',NULL,NULL,NULL,'3',300.00,'Delivered','2026-05-01 19:53:50',NULL,'Pending'),(64,'delivery','Muneeb Hassan','12345','',NULL,NULL,NULL,NULL,124.00,'Delivered','2026-05-01 19:55:06',NULL,'Pending'),(65,'dine_in','muneeb','123','',NULL,NULL,NULL,'5',123.00,'Delivered','2026-05-01 19:56:11',NULL,'Pending'),(66,'delivery','Muneeb Hassan','12345','jinnah chowk jinnah chowk',NULL,'jinnah chowk','jinnah chowk',NULL,300.00,'Delivered','2026-05-01 20:18:10',NULL,'Pending'),(67,'takeaway','muneeb','12','',NULL,NULL,NULL,NULL,324.00,'Delivered','2026-05-01 20:28:43',NULL,'Pending'),(68,'takeaway','alii','12','',NULL,NULL,NULL,NULL,324.00,'Delivered','2026-05-01 20:36:02',NULL,'Pending'),(69,'takeaway','as','122','',NULL,NULL,NULL,NULL,124.00,'Delivered','2026-05-01 20:39:12',NULL,'Pending'),(70,'delivery','Muneeb Hassan','12345','jinnah chowk housing colony',NULL,'jinnah chowk','housing colony',NULL,124.00,'Delivered','2026-05-01 20:48:33',NULL,'Pending'),(71,'delivery','Muneeb Hassan','12345','jinnah chowk jinnah chowk',NULL,'jinnah chowk','jinnah chowk',NULL,124.00,'Delivered','2026-05-01 20:54:02',NULL,'Pending'),(72,'Delivery','Muneeb Hassan','12345',', jinnah chowk, jinnah chowk',NULL,'jinnah chowk','jinnah chowk',NULL,248.00,'Delivered','2026-05-01 21:02:29',19,'Pending'),(73,'Delivery','Muneeb Hassan','12345',', , gpo orange train station',NULL,NULL,'gpo orange train station',NULL,124.00,'Delivered','2026-05-01 21:30:51',19,'Pending'),(74,'Takeaway','muneeb','12344','',NULL,NULL,NULL,NULL,123.00,'Delivered','2026-05-03 15:46:30',NULL,'Pending'),(75,'Delivery','Muneeb Hassan','12345',', jinnah chowk, jinnah chowk',NULL,'jinnah chowk','jinnah chowk',NULL,123.00,'Delivered','2026-05-03 19:13:37',42,'Pending'),(76,'Delivery','Muneeb Hassan','12345',', jinnah chowk, jinnah chowk',NULL,'jinnah chowk','jinnah chowk',NULL,123.00,'Delivered','2026-05-03 19:14:22',42,'Pending'),(77,'Delivery','Muneeb Hassan','12345',', jinnah chowk, jinnah chowk',NULL,'jinnah chowk','jinnah chowk',NULL,124.00,'Delivered','2026-05-03 19:47:54',42,'Pending'),(78,'Delivery','Muneeb Hassan','12345',', jinnah chowk, jinnah chowk',NULL,'jinnah chowk','jinnah chowk',NULL,123.00,'Delivered','2026-05-04 04:44:13',42,'Pending'),(79,'Dine-In','Muneen Hassan',NULL,'',NULL,NULL,NULL,'5',300.00,'Delivered','2026-05-05 09:35:32',NULL,'Pending'),(80,'Dine-In','FAIZI',NULL,'',NULL,NULL,NULL,'3',123.00,'Delivered','2026-05-05 09:36:32',NULL,'Pending'),(81,'Dine-In','Haseeb',NULL,'',NULL,NULL,NULL,'5',990.00,'Delivered','2026-05-07 07:47:26',NULL,'Pending'),(82,'Delivery','Rizwan','03055555555','H#5, St#2, Johar Town Lahore','H#5','St#2','Johar Town Lahore',NULL,480.00,'Delivered','2026-05-07 07:52:37',NULL,'Pending'),(83,'Takeaway','muneeb','1223','',NULL,NULL,NULL,NULL,400.00,'Delivered','2026-05-09 05:38:50',NULL,'Pending'),(84,'Takeaway','muneeb','1234546','',NULL,NULL,NULL,NULL,400.00,'Delivered','2026-05-09 05:53:10',NULL,'Pending'),(85,'Dine_in','muneeb','12345','',NULL,NULL,NULL,'5',670.00,'Pending','2026-05-11 07:10:41',NULL,'Pending'),(86,'Dine_in','Faizi','00000000000','',NULL,NULL,NULL,'5',650.00,'Pending','2026-05-18 07:32:18',NULL,'Pending'),(87,'Delivery','Sami','03232323232','House # 3, St # 5, Johar Town','House # 3','St # 5','Johar Town',NULL,590.00,'Delivered','2026-05-19 06:05:58',NULL,'Pending'),(88,'Dine_in','Rahim','03232323232','',NULL,NULL,NULL,'5',230.00,'Pending','2026-05-19 06:11:25',NULL,'Pending'),(89,'Dine_in','Faedeen','03343434343','',NULL,NULL,NULL,'10',330.00,'Delivered','2026-05-19 06:40:16',NULL,'Pending'),(90,'Dine_in','Rizwan','03454545454','',NULL,NULL,NULL,'7',589.00,'Pending','2026-05-19 06:44:48',NULL,'Pending'),(91,'Dine_in','wali','03232323299','',NULL,NULL,NULL,'1',1980.00,'Pending','2026-05-19 06:56:14',NULL,'Pending'),(92,'Dine_in','umer','03556655665','',NULL,NULL,NULL,'12',350.00,'Pending','2026-05-19 06:59:46',NULL,'Pending'),(93,'Takeaway','haseeb','03999999999','',NULL,NULL,NULL,NULL,590.00,'Delivered','2026-05-19 07:00:38',NULL,'Pending'),(94,'Takeaway','Debug Test','03001234567','',NULL,NULL,NULL,NULL,1190.00,'Pending','2026-05-19 07:02:54',NULL,'Pending'),(95,'Takeaway','muneeb','03009999999','',NULL,NULL,NULL,NULL,1390.00,'Delivered','2026-05-19 07:08:57',NULL,'Pending'),(96,'Takeaway','API Test User','1234567890','',NULL,NULL,NULL,NULL,2380.00,'Pending','2026-05-19 07:13:18',NULL,'Pending'),(97,'Takeaway','API Test User','1234567890','',NULL,NULL,NULL,NULL,2380.00,'Pending','2026-05-19 07:14:58',NULL,'Pending'),(98,'Takeaway','API Test User','1234567890','',NULL,NULL,NULL,NULL,2380.00,'Pending','2026-05-19 07:16:51',NULL,'Pending'),(99,'Takeaway','API Test User','1234567890','',NULL,NULL,NULL,NULL,500.00,'Pending','2026-05-19 07:31:42',NULL,'Pending'),(100,'Takeaway','API Test User','1234567890','',NULL,NULL,NULL,NULL,500.00,'Pending','2026-05-19 07:34:53',NULL,'Pending'),(101,'Takeaway','API Test User','1234567890','',NULL,NULL,NULL,NULL,500.00,'Pending','2026-05-19 07:36:37',NULL,'Pending'),(102,'Takeaway','API Test User','1234567890','',NULL,NULL,NULL,NULL,500.00,'Pending','2026-05-19 07:37:47',NULL,'Pending'),(103,'Takeaway','Rahim Pardesi','03450565656','',NULL,NULL,NULL,NULL,1147.00,'Pending','2026-05-19 07:39:39',NULL,'Pending'),(104,'Takeaway','Muneeb Saith','03224567892','',NULL,NULL,NULL,NULL,380.00,'Pending','2026-05-19 07:43:21',NULL,'Pending'),(105,'Dine_in','Faizi Mughal ','03240407989','',NULL,NULL,NULL,'Table 1',589.00,'Delivered','2026-06-12 07:10:50',NULL,'Paid'),(106,'Takeaway','Faiz Ul Hassan','03707183301','',NULL,NULL,NULL,NULL,230.00,'Delivered','2026-06-12 10:34:54',NULL,'Paid'),(107,'Takeaway','Wali Muhammad','03123456789','',NULL,NULL,NULL,NULL,450.00,'Pending','2026-06-15 06:30:28',NULL,'Pending'),(108,'Takeaway','Wali Muhammad','03123456789','',NULL,NULL,NULL,NULL,590.00,'Pending','2026-06-15 06:31:48',NULL,'Pending'),(109,'Dine_in','Umar','03244974109','',NULL,NULL,NULL,'Table 1',700.00,'Pending','2026-06-15 06:38:39',NULL,'Pending'),(110,'Takeaway','Abdul Rahman ','03216494846','',NULL,NULL,NULL,NULL,650.00,'Delivered','2026-06-15 06:53:44',NULL,'Pending'),(111,'Delivery','Muneeb Hassan','03221652624',', jinnah chowk, jinnah chowk',NULL,'jinnah chowk','jinnah chowk',NULL,739.00,'Delivered','2026-06-16 20:22:16',42,'Pending'),(112,'Delivery','Muneeb Hassan','03221652624',', jinnah chowk, jinnah chowk',NULL,'jinnah chowk','jinnah chowk',NULL,740.00,'Delivered','2026-06-16 20:32:20',42,'Pending'),(113,'Delivery','Muneeb Hassan','03221652624',', jinnah chowk, jinnah chowk',NULL,'jinnah chowk','jinnah chowk',NULL,740.00,'Delivered','2026-06-16 21:12:12',NULL,'Pending'),(114,'Takeaway','Muneeb','03221652624','',NULL,NULL,NULL,NULL,250.00,'Delivered','2026-06-16 21:33:28',NULL,'Pending'),(115,'Takeaway','Muneeb ','03221652624','',NULL,NULL,NULL,NULL,1290.00,'Delivered','2026-06-16 21:59:28',NULL,'Pending'),(116,'Takeaway','Muneeb ','03221652624','',NULL,NULL,NULL,NULL,590.00,'Delivered','2026-06-17 06:34:11',NULL,'Pending'),(117,'Delivery','Wali Muhammad','03224042327','Gu3j, bdiiwns, Bejsjmzonemz','Gu3j','bdiiwns','Bejsjmzonemz',NULL,370.00,'Delivered','2026-06-17 06:38:07',42,'Pending'),(118,'Delivery','Mubashir Khan','03121400584',', , Islamia college civil lines lahore',NULL,NULL,'Islamia college civil lines lahore',NULL,739.00,'Delivered','2026-06-17 06:43:18',45,'Pending'),(119,'Delivery','Muneeb Hassan','03221652624',', jinnah chowk, jinnah chowk',NULL,'jinnah chowk','jinnah chowk',NULL,739.00,'Delivered','2026-06-17 17:52:16',42,'Pending'),(120,'Takeaway','muneeb','03221652624','',NULL,NULL,NULL,NULL,589.00,'Delivered','2026-06-17 18:13:16',NULL,'Pending'),(121,'Takeaway','muneeeb','03221652624','',NULL,NULL,NULL,NULL,589.00,'Delivered','2026-06-17 18:14:32',NULL,'Pending'),(122,'Takeaway','as','03221652624','',NULL,NULL,NULL,NULL,589.00,'Delivered','2026-06-17 18:36:00',NULL,'Pending'),(123,'Takeaway','mh','03221652624','',NULL,NULL,NULL,NULL,330.00,'Delivered','2026-06-17 18:54:27',NULL,'Pending'),(124,'Takeaway','muneeb','03221652624','',NULL,NULL,NULL,NULL,330.00,'Delivered','2026-06-17 18:57:15',NULL,'Pending'),(125,'Dine_in','Muneeb','03221652624','',NULL,NULL,NULL,'Table 5',500.00,'Delivered','2026-06-18 15:03:04',NULL,'Pending'),(126,'Takeaway','muneeb','03221652624','',NULL,NULL,NULL,NULL,590.00,'Pending','2026-07-11 22:15:31',NULL,'Pending'),(127,'Delivery','Abdul Sami','03228483029',', Street No 62 House No 23 Sher Shah Road Nafeerabad Shalimar Town Lahore, Lahore',NULL,'Street No 62 House No 23 Sher Shah Road Nafeerabad Shalimar Town Lahore','Lahore',NULL,600.00,'Delivered','2026-07-12 16:33:35',NULL,'Pending'),(128,'Delivery','Mozam','03200000000','h#23, st#2, Shadipura','h#23','st#2','Shadipura',NULL,380.00,'Delivered','2026-07-13 19:14:30',NULL,'Pending'),(129,'Delivery','mudasir','03033333333','H#4, St#3, Shadipura','H#4','St#3','Shadipura',NULL,740.00,'Dispatched','2026-07-13 19:27:50',45,'Pending'),(130,'Delivery','Test User','03001234567','123, Street 5, Johar Town','123','Street 5','Johar Town',NULL,739.00,'Delivered','2026-07-14 07:01:05',NULL,'Pending'),(131,'Delivery','Faizi Mughal','03240407989',', H # 27, St # 3 Muhalla Astana Naqshbandi Daroghawala, Lahore Cantt',NULL,'H # 27, St # 3 Muhalla Astana Naqshbandi Daroghawala','Lahore Cantt',NULL,650.00,'Delivered','2026-07-14 10:47:29',42,'Pending'),(132,'Delivery','muneeb','03000303030','asdasfasdf, asdasfadf, asdasfasf','asdasfasdf','asdasfadf','asdasfasf',NULL,400.00,'Dispatched','2026-07-14 11:11:38',42,'Pending'),(133,'Delivery','Wali Muhammad','03224042327',', 543, 234rfdsv',NULL,'543','234rfdsv',NULL,900.00,'Ready','2026-07-25 19:31:18',NULL,'Unpaid');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `payments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `method` varchar(50) DEFAULT 'Cash',
  `status` varchar(50) DEFAULT 'Pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
INSERT INTO `payments` VALUES (9,51,123.00,'Cash','Paid','2026-04-29 06:16:10');
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payroll`
--

DROP TABLE IF EXISTS `payroll`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `payroll` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `staff_id` int(11) NOT NULL,
  `month` varchar(20) NOT NULL,
  `basic_salary` decimal(10,2) DEFAULT NULL,
  `absents` int(11) DEFAULT NULL,
  `deduction` decimal(10,2) DEFAULT NULL,
  `net_pay` decimal(10,2) DEFAULT NULL,
  `paid_on` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `staff_id` (`staff_id`),
  CONSTRAINT `payroll_ibfk_1` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payroll`
--

LOCK TABLES `payroll` WRITE;
/*!40000 ALTER TABLE `payroll` DISABLE KEYS */;
/*!40000 ALTER TABLE `payroll` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recipes`
--

DROP TABLE IF EXISTS `recipes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `recipes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `menu_item_id` int(11) NOT NULL,
  `variant_name` varchar(100) NOT NULL,
  `inventory_id` int(11) NOT NULL,
  `ingredient_name` varchar(255) NOT NULL,
  `quantity_to_deduct` decimal(10,2) NOT NULL,
  `is_removable` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=494 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recipes`
--

LOCK TABLES `recipes` WRITE;
/*!40000 ALTER TABLE `recipes` DISABLE KEYS */;
INSERT INTO `recipes` VALUES (2,21,'Regular',2,'Unknown Ingredient',1.00,1),(3,21,'Regular',1,'Unknown Ingredient',1.00,0),(216,31,'Large',14,'Unknown Ingredient',100.00,0),(217,31,'Large',15,'Unknown Ingredient',100.00,0),(218,31,'Large',24,'Unknown Ingredient',100.00,0),(219,31,'Large',5,'Unknown Ingredient',500.00,0),(224,31,'Medium',14,'Unknown Ingredient',70.00,0),(225,31,'Medium',15,'Unknown Ingredient',70.00,0),(226,31,'Medium',24,'Unknown Ingredient',70.00,0),(227,31,'Medium',5,'Unknown Ingredient',350.00,0),(228,31,'Small',14,'Unknown Ingredient',50.00,0),(229,31,'Small',15,'Unknown Ingredient',50.00,0),(230,31,'Small',24,'Unknown Ingredient',50.00,0),(231,31,'Small',5,'Unknown Ingredient',250.00,0),(238,25,'Medium',22,'Unknown Ingredient',350.00,0),(239,25,'Medium',5,'Unknown Ingredient',400.00,0),(240,25,'Medium',8,'Unknown Ingredient',150.00,1),(241,25,'Medium',7,'Unknown Ingredient',150.00,1),(242,25,'Medium',11,'Unknown Ingredient',200.00,0),(243,25,'Medium',5,'Unknown Ingredient',350.00,0),(244,25,'Large',22,'Unknown Ingredient',500.00,0),(245,25,'Large',5,'Unknown Ingredient',500.00,0),(246,25,'Large',8,'Unknown Ingredient',250.00,1),(247,25,'Large',7,'Unknown Ingredient',250.00,1),(248,25,'Large',11,'Unknown Ingredient',350.00,0),(249,25,'Large',5,'Unknown Ingredient',500.00,0),(250,26,'Small',11,'Unknown Ingredient',100.00,0),(251,26,'Small',24,'Unknown Ingredient',50.00,1),(252,26,'Small',7,'Unknown Ingredient',50.00,0),(253,26,'Small',22,'Unknown Ingredient',150.00,0),(254,26,'Small',10,'Unknown Ingredient',10.00,0),(255,26,'Small',5,'Unknown Ingredient',250.00,0),(256,26,'Medium',11,'Unknown Ingredient',150.00,0),(257,26,'Medium',24,'Unknown Ingredient',70.00,0),(258,26,'Medium',22,'Unknown Ingredient',200.00,0),(259,26,'Medium',7,'Unknown Ingredient',70.00,1),(260,26,'Medium',10,'Unknown Ingredient',15.00,0),(261,26,'Medium',5,'Unknown Ingredient',350.00,0),(262,26,'Large',11,'Unknown Ingredient',250.00,0),(263,26,'Large',24,'Unknown Ingredient',100.00,1),(264,26,'Large',7,'Unknown Ingredient',100.00,0),(265,26,'Large',22,'Unknown Ingredient',250.00,0),(266,26,'Large',10,'Unknown Ingredient',20.00,0),(267,26,'Large',5,'Unknown Ingredient',500.00,0),(268,27,'Small',11,'Unknown Ingredient',100.00,0),(269,27,'Small',13,'Unknown Ingredient',10.00,0),(270,27,'Small',24,'Unknown Ingredient',50.00,0),(271,27,'Small',7,'Unknown Ingredient',50.00,0),(272,27,'Small',22,'Unknown Ingredient',150.00,0),(273,27,'Small',5,'Unknown Ingredient',250.00,0),(274,27,'Medium',11,'Unknown Ingredient',200.00,0),(275,27,'Medium',22,'Unknown Ingredient',200.00,0),(276,27,'Medium',7,'Unknown Ingredient',70.00,0),(277,27,'Medium',24,'Unknown Ingredient',70.00,0),(278,27,'Medium',13,'Unknown Ingredient',15.00,0),(279,27,'Medium',5,'Unknown Ingredient',350.00,0),(280,27,'Large',11,'Unknown Ingredient',250.00,0),(281,27,'Large',22,'Unknown Ingredient',250.00,0),(282,27,'Large',24,'Unknown Ingredient',100.00,0),(283,27,'Large',13,'Unknown Ingredient',20.00,0),(284,27,'Large',7,'Unknown Ingredient',100.00,0),(285,27,'Large',5,'Unknown Ingredient',500.00,0),(286,28,'Small',22,'Unknown Ingredient',100.00,0),(287,28,'Small',11,'Unknown Ingredient',100.00,0),(288,28,'Small',7,'Unknown Ingredient',50.00,0),(289,28,'Small',24,'Unknown Ingredient',50.00,0),(290,28,'Small',10,'Unknown Ingredient',10.00,0),(291,28,'Small',9,'Unknown Ingredient',20.00,0),(292,28,'Small',5,'Unknown Ingredient',250.00,0),(293,28,'Medium',22,'Unknown Ingredient',150.00,0),(294,28,'Medium',11,'Unknown Ingredient',150.00,0),(295,28,'Medium',24,'Unknown Ingredient',70.00,0),(296,28,'Medium',9,'Unknown Ingredient',30.00,0),(297,28,'Medium',10,'Unknown Ingredient',15.02,0),(298,28,'Medium',5,'Unknown Ingredient',350.00,0),(299,28,'Large',22,'Unknown Ingredient',250.00,0),(300,28,'Large',11,'Unknown Ingredient',250.00,0),(301,28,'Large',7,'Unknown Ingredient',100.00,0),(302,28,'Large',24,'Unknown Ingredient',100.00,0),(303,28,'Large',9,'Unknown Ingredient',40.00,0),(304,28,'Large',10,'Unknown Ingredient',20.00,0),(305,28,'Large',5,'Unknown Ingredient',500.00,0),(313,29,'Small',22,'Unknown Ingredient',100.00,0),(314,29,'Small',11,'Unknown Ingredient',100.00,0),(315,29,'Small',7,'Unknown Ingredient',50.00,0),(316,29,'Small',13,'Unknown Ingredient',10.00,0),(317,29,'Small',23,'Unknown Ingredient',20.00,0),(318,29,'Small',25,'Unknown Ingredient',20.00,0),(319,29,'Small',5,'Unknown Ingredient',250.00,0),(320,29,'Medium',22,'Unknown Ingredient',150.00,0),(321,29,'Medium',11,'Unknown Ingredient',150.00,0),(322,29,'Medium',7,'Unknown Ingredient',70.00,0),(323,29,'Medium',23,'Unknown Ingredient',30.00,0),(324,29,'Medium',13,'Unknown Ingredient',30.00,0),(325,29,'Medium',25,'Unknown Ingredient',30.00,0),(326,29,'Medium',5,'Unknown Ingredient',350.00,0),(327,29,'Large',22,'Unknown Ingredient',250.00,0),(328,29,'Large',11,'Unknown Ingredient',250.00,0),(329,29,'Large',7,'Unknown Ingredient',100.00,0),(330,29,'Large',13,'Unknown Ingredient',30.00,0),(331,29,'Large',25,'Unknown Ingredient',40.00,0),(332,29,'Large',23,'Unknown Ingredient',40.00,0),(333,29,'Large',5,'Unknown Ingredient',500.00,0),(334,30,'Small',5,'Unknown Ingredient',250.00,0),(335,30,'Small',11,'Unknown Ingredient',100.00,0),(336,30,'Small',24,'Unknown Ingredient',50.00,0),(337,30,'Small',10,'Unknown Ingredient',10.00,0),(338,30,'Small',9,'Unknown Ingredient',20.00,0),(339,30,'Small',7,'Unknown Ingredient',50.00,0),(340,30,'Small',8,'Unknown Ingredient',50.00,0),(341,30,'Small',23,'Unknown Ingredient',50.00,0),(342,30,'Small',13,'Unknown Ingredient',20.00,0),(343,30,'Small',5,'Unknown Ingredient',250.00,0),(344,30,'Medium',5,'Unknown Ingredient',350.00,0),(345,30,'Medium',11,'Unknown Ingredient',150.00,0),(346,30,'Medium',7,'Unknown Ingredient',70.00,0),(347,30,'Medium',8,'Unknown Ingredient',70.00,0),(348,30,'Medium',13,'Unknown Ingredient',30.00,0),(349,30,'Medium',10,'Unknown Ingredient',15.00,0),(350,30,'Medium',9,'Unknown Ingredient',30.00,0),(351,30,'Medium',23,'Unknown Ingredient',70.00,0),(352,30,'Medium',24,'Unknown Ingredient',70.00,0),(353,30,'Medium',5,'Unknown Ingredient',350.00,0),(354,30,'Large',11,'Unknown Ingredient',250.00,0),(355,30,'Large',9,'Unknown Ingredient',40.00,0),(356,30,'Large',8,'Unknown Ingredient',100.00,0),(357,30,'Large',7,'Unknown Ingredient',100.00,0),(358,30,'Large',10,'Unknown Ingredient',20.00,0),(359,30,'Large',13,'Unknown Ingredient',40.00,0),(360,30,'Large',23,'Unknown Ingredient',100.00,0),(361,30,'Large',5,'Unknown Ingredient',500.00,0),(362,30,'Large',24,'Unknown Ingredient',100.00,0),(363,30,'Large',5,'Unknown Ingredient',500.00,0),(375,35,'Regular',3,'Unknown Ingredient',1.00,0),(376,35,'Regular',22,'Unknown Ingredient',100.00,0),(377,35,'Regular',26,'Unknown Ingredient',30.00,1),(378,35,'Regular',7,'Unknown Ingredient',10.00,1),(379,35,'Regular',8,'Unknown Ingredient',10.00,1),(380,35,'Regular',20,'Unknown Ingredient',50.00,0),(381,34,'Regular',3,'Unknown Ingredient',1.00,0),(382,34,'Regular',22,'Unknown Ingredient',100.00,0),(383,34,'Regular',8,'Unknown Ingredient',10.00,1),(384,34,'Regular',7,'Unknown Ingredient',10.00,1),(385,34,'Regular',20,'Unknown Ingredient',50.00,0),(386,34,'Regular',26,'Unknown Ingredient',30.00,1),(388,36,'Regular',3,'Unknown Ingredient',1.00,0),(389,36,'Regular',27,'Unknown Ingredient',2.00,0),(390,36,'Regular',7,'Unknown Ingredient',10.00,1),(391,36,'Regular',8,'Unknown Ingredient',10.00,1),(392,36,'Regular',26,'Unknown Ingredient',30.00,1),(393,36,'Regular',20,'Unknown Ingredient',50.00,0),(394,36,'Regular',21,'Unknown Ingredient',50.00,1),(395,37,'Regular',3,'Unknown Ingredient',1.00,0),(396,37,'Regular',28,'Unknown Ingredient',1.00,0),(397,37,'Regular',26,'Unknown Ingredient',30.00,1),(398,37,'Regular',8,'Unknown Ingredient',10.00,1),(399,37,'Regular',7,'Unknown Ingredient',10.00,1),(400,37,'Regular',21,'Unknown Ingredient',50.00,1),(401,37,'Regular',20,'Unknown Ingredient',50.00,0),(402,52,'Regular',4,'Unknown Ingredient',1.00,0),(403,52,'Regular',27,'Unknown Ingredient',1.00,0),(404,52,'Regular',26,'Unknown Ingredient',30.00,1),(405,52,'Regular',8,'Unknown Ingredient',10.00,1),(406,52,'Regular',7,'Unknown Ingredient',10.00,1),(407,52,'Regular',20,'Unknown Ingredient',50.00,0),(408,52,'Regular',21,'Unknown Ingredient',50.00,1),(409,53,'Regular',4,'Unknown Ingredient',1.00,0),(410,53,'Regular',22,'Unknown Ingredient',100.00,0),(411,53,'Regular',26,'Unknown Ingredient',30.00,1),(412,53,'Regular',21,'Unknown Ingredient',50.00,1),(413,53,'Regular',20,'Unknown Ingredient',50.00,0),(414,48,'Regular',4,'Unknown Ingredient',1.00,0),(415,48,'Regular',22,'Unknown Ingredient',100.00,0),(416,48,'Regular',26,'Unknown Ingredient',30.00,1),(417,48,'Regular',20,'Unknown Ingredient',50.00,0),(418,48,'Regular',7,'Unknown Ingredient',10.00,1),(419,48,'Regular',8,'Unknown Ingredient',10.00,1),(426,49,'Regular',4,'Unknown Ingredient',1.00,0),(427,49,'Regular',28,'Unknown Ingredient',1.00,0),(428,49,'Regular',20,'Unknown Ingredient',50.00,0),(429,49,'Regular',26,'Unknown Ingredient',30.00,1),(430,49,'Regular',8,'Unknown Ingredient',10.00,1),(431,49,'Regular',7,'Unknown Ingredient',10.00,1),(432,50,'Regular',29,'Unknown Ingredient',1.00,0),(433,50,'Regular',22,'Unknown Ingredient',100.00,0),(434,50,'Regular',26,'Unknown Ingredient',30.00,1),(435,50,'Regular',7,'Unknown Ingredient',10.00,1),(436,50,'Regular',8,'Unknown Ingredient',10.00,1),(437,50,'Regular',21,'Unknown Ingredient',50.00,1),(438,50,'Regular',20,'Unknown Ingredient',50.00,0),(439,51,'Regular',29,'Unknown Ingredient',1.00,0),(440,51,'Regular',22,'Unknown Ingredient',100.00,0),(441,51,'Regular',26,'Unknown Ingredient',30.00,1),(442,51,'Regular',8,'Unknown Ingredient',10.00,1),(443,51,'Regular',7,'Unknown Ingredient',10.00,1),(444,51,'Regular',21,'Unknown Ingredient',50.00,1),(445,51,'Regular',20,'Unknown Ingredient',49.96,0),(446,40,'Small',6,'Unknown Ingredient',100.00,0),(447,40,'Small',21,'Unknown Ingredient',50.00,0),(448,40,'Small',20,'Unknown Ingredient',50.00,0),(449,41,'Small',6,'Unknown Ingredient',100.00,0),(450,41,'Small',21,'Unknown Ingredient',50.00,0),(451,41,'Small',20,'Unknown Ingredient',50.00,0),(452,41,'Small',25,'Unknown Ingredient',30.00,0),(453,42,'Small',6,'Unknown Ingredient',100.00,0),(454,42,'Small',21,'Unknown Ingredient',50.00,0),(455,42,'Small',20,'Unknown Ingredient',50.00,0),(456,42,'Small',30,'Unknown Ingredient',50.00,0),(457,42,'Small',25,'Unknown Ingredient',10.00,0),(466,43,'Small',6,'Unknown Ingredient',150.00,0),(467,43,'Small',21,'Unknown Ingredient',50.00,0),(468,43,'Small',20,'Unknown Ingredient',50.00,0),(469,43,'Small',24,'Unknown Ingredient',50.00,0),(470,43,'Small',30,'Unknown Ingredient',50.00,0),(471,43,'Small',25,'Unknown Ingredient',10.00,0),(472,43,'Small',13,'Unknown Ingredient',10.00,0),(473,43,'Small',10,'Unknown Ingredient',10.00,0),(474,43,'Large',6,'Unknown Ingredient',250.00,0),(475,43,'Large',30,'Unknown Ingredient',100.00,0),(476,43,'Large',24,'Unknown Ingredient',100.00,0),(477,43,'Large',21,'Unknown Ingredient',100.00,0),(478,43,'Large',20,'Unknown Ingredient',100.00,0),(479,43,'Large',25,'Unknown Ingredient',10.00,0),(480,43,'Large',13,'Unknown Ingredient',20.00,0),(481,43,'Large',10,'Unknown Ingredient',20.00,0),(488,25,'Small',22,'Unknown Ingredient',200.00,0),(489,25,'Small',7,'Unknown Ingredient',100.00,1),(490,25,'Small',5,'Unknown Ingredient',300.00,0),(491,25,'Small',8,'Unknown Ingredient',100.00,1),(492,25,'Small',11,'Unknown Ingredient',100.00,0),(493,25,'Small',5,'Unknown Ingredient',250.00,0);
/*!40000 ALTER TABLE `recipes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `restaurant_tables`
--

DROP TABLE IF EXISTS `restaurant_tables`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `restaurant_tables` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `table_name` varchar(255) NOT NULL,
  `status` tinyint(4) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `restaurant_tables`
--

LOCK TABLES `restaurant_tables` WRITE;
/*!40000 ALTER TABLE `restaurant_tables` DISABLE KEYS */;
INSERT INTO `restaurant_tables` VALUES (1,'Table 1',1,'2026-06-12 06:54:21'),(2,'Table 2',1,'2026-06-12 07:28:36'),(3,'Table 3',1,'2026-06-12 07:28:48'),(4,'Table 4',1,'2026-06-12 07:28:58'),(5,'Table 5',1,'2026-06-12 07:29:06'),(6,'Table 6',1,'2026-06-12 07:29:13'),(7,'Table 7',1,'2026-06-12 07:29:20'),(8,'Table 8',1,'2026-06-12 07:29:26'),(9,'Table 9',1,'2026-06-15 06:22:23');
/*!40000 ALTER TABLE `restaurant_tables` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rider`
--

DROP TABLE IF EXISTS `rider`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `rider` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `staff_id` int(11) NOT NULL,
  `license_number` varchar(50) DEFAULT NULL,
  `vehicle` varchar(50) DEFAULT 'Bike',
  `lat` decimal(10,8) DEFAULT NULL,
  `lng` decimal(11,8) DEFAULT NULL,
  `trips_completed` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `staff_id` (`staff_id`),
  CONSTRAINT `rider_ibfk_1` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rider`
--

LOCK TABLES `rider` WRITE;
/*!40000 ALTER TABLE `rider` DISABLE KEYS */;
INSERT INTO `rider` VALUES (1,42,'ds-12345676','leb-1234',31.57126489,74.30290608,12,'2026-05-03 18:58:00'),(2,45,'ds-12345676','leb123',31.57218306,74.30412267,1,'2026-06-17 06:44:01');
/*!40000 ALTER TABLE `rider` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `settings`
--

DROP TABLE IF EXISTS `settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `settings` (
  `setting_key` varchar(50) NOT NULL,
  `setting_value` varchar(255) NOT NULL,
  PRIMARY KEY (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `settings`
--

LOCK TABLES `settings` WRITE;
/*!40000 ALTER TABLE `settings` DISABLE KEYS */;
INSERT INTO `settings` VALUES ('accept_cards','false'),('accept_orders','true'),('admin_email','admin@quickbite.com'),('contact_phone','03221652624'),('daily_deduction','5000'),('delivery_fee','150'),('delivery_radius','5'),('email_notif','false'),('evening_shift','04:00 PM - 12:00 AM'),('footer_email','support@bigbite.com'),('footer_facebook','https://facebook.com'),('footer_instagram','https://instagram.com'),('footer_phone','03221652624'),('footer_tagline','Fresh Food, Delivered Hot & Fast. Experience the best taste in town with our premium quality ingredients.'),('footer_twitter','https://twitter.com'),('footer_youtube','https://youtube.com'),('hero_search_placeholder','Search your favorite food...'),('hero_subtitle','Fresh Food, Delivered Hot & Fast.'),('hero_title','WELCOME TO  Your <span style=\"color:#ef4444;\">BIG BITE!</span>'),('min_order','500'),('monthly_off_days','7'),('morning_shift','10:00 AM - 04:00 PM'),('night_shift','12:00 AM - 08:00 AM'),('qr_base_url','http://192.168.100.222:5173'),('restaurant_close_time','04:00'),('restaurant_open_time','10:00'),('sound_alert','true'),('stock_alerts','true'),('store_address','123 Food Street, Main Market'),('store_logo','https://res.cloudinary.com/dovuegkwa/image/upload/v1778262379/blob_f4gz0e.png'),('store_name','QuickBite Restaurant'),('tax_rate','5');
/*!40000 ALTER TABLE `settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff`
--

DROP TABLE IF EXISTS `staff`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `staff` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `role` varchar(100) NOT NULL,
  `phone` varchar(50) NOT NULL,
  `salary` decimal(10,2) NOT NULL,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `shift_status` varchar(50) NOT NULL DEFAULT 'Offline',
  `hire_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `shift` enum('Morning','Evening','Night') DEFAULT 'Morning',
  `username` varchar(50) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff`
--

LOCK TABLES `staff` WRITE;
/*!40000 ALTER TABLE `staff` DISABLE KEYS */;
INSERT INTO `staff` VALUES (5,'Muneeb Hassan','Admin','03221652624',45678.00,'Active','Available','2026-04-21 19:51:39','Morning','muneeb_admin','$2y$10$y.uSoNxqAvf/MgZTvZIsne6cswKAZ71TzrcRCKrunLyIUuq1B0pP6'),(15,'faiz','Chef','03221652624',123456.00,'Active','Offline','2026-04-29 19:06:32','Morning','faiz_chef','$2y$10$scLyQNzTrXpQiObwa2h.jOIE4AasnGA7er6Ce4mk7jNcIYfpzLH02'),(16,'ali','Dispatcher','03221652624',12000.00,'Active','Offline','2026-04-29 19:11:20','Morning','ali_dispatcher','$2y$10$PAB2xbUnaEDZcSMmysRRVOMa89ACfOqS/tWWfU5JOprKVv4U3zRMS'),(42,'faisal','Rider','1234567890',12222.00,'Active','Busy','2026-05-03 18:58:00','Morning','faisalll','$2y$10$kHysCFxj2B7E6wK4MrJeROaW2RJsXpFkSD7FyL8oUS3vyiXzVXkxK'),(44,'Haseeb','Cashier','03909090909',50000.00,'Active','Offline','2026-05-07 07:45:36','Morning','haseeb_cashier','$2y$10$aVeWcEE5cG56w8Wic8IYnun8cPn2VT9uchEvqdJY2p3WwDT5UpF1q'),(45,'mubashar','Rider','03121400584',2500.00,'Active','Busy','2026-06-17 06:44:01','Morning','mubashar123','$2y$10$Gk7DLWJYivqK5GyXpGfu2O.IU5lkckJWNwg/zabjYfNHIgR5AiKs2');
/*!40000 ALTER TABLE `staff` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-26 22:49:15
