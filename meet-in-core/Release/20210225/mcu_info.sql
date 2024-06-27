CREATE TABLE `mcu_info` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `url` varchar(128) NOT NULL,
  `room_cnt` int(11) NOT NULL DEFAULT '0',
  `access_cnt` bigint(20) NOT NULL DEFAULT '0',
  `acc_max` bigint(20) NOT NULL DEFAULT '0',
  `unit_type` tinyint(4) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `idx_room_cnt` (`room_cnt`),
  KEY `idx_access_cnt` (`access_cnt`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8
