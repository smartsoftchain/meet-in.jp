USE meetin_db;

ALTER TABLE connection_info ADD COLUMN connect_datetime1 DATETIME NULL COMMENT 'ê⁄ë±ì˙éû1' AFTER updated_datetime;
ALTER TABLE connection_info ADD COLUMN connect_datetime2 DATETIME NULL COMMENT 'ê⁄ë±ì˙éû2' AFTER connect_datetime1;
ALTER TABLE connection_info ADD COLUMN connect_datetime3 DATETIME NULL COMMENT 'ê⁄ë±ì˙éû3' AFTER connect_datetime2;
ALTER TABLE connection_info ADD COLUMN connect_datetime4 DATETIME NULL COMMENT 'ê⁄ë±ì˙éû4' AFTER connect_datetime3;
ALTER TABLE connection_info ADD COLUMN connect_datetime5 DATETIME NULL COMMENT 'ê⁄ë±ì˙éû5' AFTER connect_datetime4;
ALTER TABLE connection_info ADD COLUMN connect_datetime6 DATETIME NULL COMMENT 'ê⁄ë±ì˙éû6' AFTER connect_datetime5;
ALTER TABLE connection_info ADD COLUMN connect_datetime7 DATETIME NULL COMMENT 'ê⁄ë±ì˙éû7' AFTER connect_datetime6;
ALTER TABLE connection_info ADD COLUMN connect_datetime8 DATETIME NULL COMMENT 'ê⁄ë±ì˙éû8' AFTER connect_datetime7;


CREATE TABLE `chat_detail` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `connection_info_id` bigint(20) NOT NULL,
  `room_name` varchar(32) COLLATE utf8_unicode_ci DEFAULT NULL,
  `collabo_id` tinyint(4) DEFAULT NULL,
  `user_id` tinyint(4) NOT NULL,
  `uuid` varchar(64) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL COMMENT 'UUID',
  `message` text CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `created_datetime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_datetime` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `index1` (`connection_info_id`),
  CONSTRAINT `FK1` FOREIGN KEY (`connection_info_id`) REFERENCES `connection_info` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=545 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='É`ÉÉÉbÉgè⁄ç◊'
