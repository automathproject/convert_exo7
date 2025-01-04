DROP TABLE IF EXISTS `modules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `modules` (
  `code_module` int(3) NOT NULL DEFAULT 0,
  `annee_module` varchar(10) DEFAULT NULL,
  `description_module` varchar(100) DEFAULT NULL,
  `deb_code_chapitre` int(5) DEFAULT NULL,
  `fin_code_chapitre` int(5) DEFAULT NULL,
  PRIMARY KEY (`code_module`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `modules`
--

LOCK TABLES `modules` WRITE;
/*!40000 ALTER TABLE `modules` DISABLE KEYS */;
INSERT INTO `modules` VALUES
(8,'L3','Théorie des groupes',300,309),
(7,'L2','Probabilité et statistique',260,279),
(6,'L2','Géométrie',240,259),
(5,'L2','Analyse',220,239),
(4,'L2','Algèbre',200,219),
(2,'L1','Analyse',120,139),
(1,'L1','Algèbre',100,119),
(9,'L3','Algèbre et géométrie',310,319),
(10,'L3','Algèbre et théorie des nombres',320,329),
(11,'L3','Géométrie différentielle',350,359),
(12,'L3','Calcul différentiel',370,379),
(13,'L3','Equation différentielle',380,389),
(14,'L3','Théorie de la mesure, intégrale de Lebesgue',400,419),
(15,'L3','Topologie',420,439),
(16,'L3','Analyse complexe',440,449),
(17,'L3','Analyse numérique',450,469),
(18,'L3','Optimisation',470,479),
(19,'L3','Probabilité et statistique',480,499),
(3,'L1','Géométrie',140,159);
/*!40000 ALTER TABLE `modules` ENABLE KEYS */;
UNLOCK TABLES;