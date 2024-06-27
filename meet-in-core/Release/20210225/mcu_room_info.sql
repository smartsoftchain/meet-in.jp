CREATE TABLE `mcu_room_info` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `mcu_info_id` int(11) NOT NULL,
  `room_name` varchar(128) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_mcu_info_id` (`mcu_info_id`),
  KEY `idx_name` (`room_name`)
) ENGINE=InnoDB AUTO_INCREMENT=99 DEFAULT CHARSET=utf8
