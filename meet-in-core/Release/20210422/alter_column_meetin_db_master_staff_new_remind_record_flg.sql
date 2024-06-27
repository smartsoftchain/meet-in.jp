
ALTER TABLE `master_staff_new` ADD COLUMN `remind_record_flg` tinyint(1) NOT NULL DEFAULT '1' COMMENT '録音アラート' AFTER `desktop_notify_flg`;

#ALTER TABLE `master_staff_new` DROP COLUMN `remind_record_flg`;
flush privileges;

