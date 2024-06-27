ALTER TABLE `master_client_new` ADD `negotiation_room_type` TINYINT NOT NULL DEFAULT '0' COMMENT '0:既存,1:MCU' AFTER `manual_url` ;
ALTER TABLE `connection_info` ADD `client_id` INT( 11 ) NULL DEFAULT NULL COMMENT 'ルームのクライアントID' AFTER `operator_staff_id` ;
