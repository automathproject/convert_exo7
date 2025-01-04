--
-- Table structure for table `auteurs`
--

DROP TABLE IF EXISTS `auteurs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `auteurs` (
  `auteur` varchar(12) NOT NULL,
  `nom` varchar(20) DEFAULT NULL,
  `prenom` varchar(20) DEFAULT NULL,
  `email` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`auteur`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auteurs`
--

LOCK TABLES `auteurs` WRITE;
/*!40000 ALTER TABLE `auteurs` DISABLE KEYS */;
INSERT INTO `auteurs` VALUES
('liousse','Liousse','Isabelle','Isabelle.Liousse@math.univ-lil'),
('bodin','Bodin','Arnaud','arnaud.bodin@univ-lille.fr'),
('barraud','Barraud','Jean-François',''),
('ridde','Ridde','Franz',NULL),
('cousquer','Cousquer','Eliane',NULL),
('gourio','Gourio','François',NULL),
('maillot','Maillot','Sylvain',NULL),
('ortiz','Ortiz','Pascal',NULL),
('monthub','Monthubert','Bertrand',NULL),
('vignal',NULL,NULL,NULL),
('legall','Legall','Pierre-Yves',NULL),
('roussel',NULL,NULL,NULL),
('hilion','Hilion','Arnaud',NULL),
('gineste','Gineste','Olivier',NULL),
('drutu','Drutu','Cornélia',NULL),
('matexo1','Matexo1',NULL,NULL),
('mayer','Mayer','Volker',NULL),
('queffelec','Quéffelec','Martine',NULL),
('lescure','Lescure','François',NULL),
('sarkis','Sarkis','Frédéric',NULL),
('tahani','Tahani','Toufiq',NULL),
('delaunay','Delaunay','Sandra','Sandra.Delaunay@math.univ-lill'),
('debievre','de Bièvre','Stephan','Stephan.De-Bievre@math.univ-li'),
('tumpach','Tumpach','Barbara','Barbara.Tumpach@math.univ-lill'),
('burnol','Burnol','Jean-François',NULL),
('quercia','Quercia','Michel',NULL),
('rouget','Rouget','Jean-Louis',NULL),
('quinio','Quinio','Martine',NULL),
('chollet','Chollet','Anne-Marie',NULL),
('potyag','Leonid','Potyagailo',NULL),
('gijs','Tuynman ','Gijs',NULL),
('hueb','Huebschmann','Johannes',NULL),
('chataur','Chataur','David',NULL),
('gammella','Gammella-Mathieu','Angela',NULL),
('romon','Romon','Pascal','pascal.romon@univ-mlv.fr'),
('exo7','exo7',NULL,NULL),
('ruette','Ruette','Sylvie',NULL),
('blanc-centi','Blanc-Centi','Léa',NULL),
('megy','Mégy','Damien','damien.megy@univ-lorraine.fr'),
('mourougane','Mourougane','Christophe',NULL);
/*!40000 ALTER TABLE `auteurs` ENABLE KEYS */;
UNLOCK TABLES;