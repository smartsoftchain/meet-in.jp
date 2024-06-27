CREATE TABLE `authenticate_info` (
  `staff_id` int(11) NOT NULL,
  `staff_type` char(2) COLLATE utf8_unicode_ci NOT NULL,
  `secret_key` varchar(50) COLLATE utf8_unicode_ci NOT NULL,
  `acc_cnt` bigint(20) NOT NULL DEFAULT '0',
  `varify_flg` TINYINT(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`secret_key`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8

# DROP TABLE `authenticate_info`;


ALTER TABLE `master_client_new` ADD COLUMN `two_factor_authenticate_flg` TINYINT(1) NOT NULL DEFAULT '0' COMMENT '二要素認証(0:OFF/1:ON)' AFTER `client_type`;

#ALTER TABLE `master_client_new` DROP COLUMN `two_factor_authenticate_flg`;
flush privileges;

ALTER TABLE `master_staff_new` ADD COLUMN `staff_authenticate_flg` TINYINT(1) NOT NULL DEFAULT '0' COMMENT '担当者認証(0:OFF/1:認証済み)' AFTER `remind_record_flg`;

#ALTER TABLE `master_staff_new` DROP COLUMN `staff_authenticate_flg`;
flush privileges;

ALTER TABLE `e_contract_case` ADD COLUMN `approval_method` TINYINT(1) NULL DEFAULT '0' COMMENT '承認方法(0:通常 1:二要素認証)' AFTER `auto_renewal`;

#ALTER TABLE `e_contract_case` DROP COLUMN `approval_method`;
flush privileges;

ALTER TABLE `e_contract_partner2` ADD COLUMN `partner_authenticate_flg` TINYINT(1) NOT NULL DEFAULT '0' COMMENT '二要素認証(0:未 1:済)' AFTER `approval_status`;

#ALTER TABLE `e_contract_partner2` DROP COLUMN `partner_authenticate_flg`;
flush privileges;