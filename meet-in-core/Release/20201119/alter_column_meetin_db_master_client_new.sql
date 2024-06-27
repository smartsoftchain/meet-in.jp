ALTER TABLE `master_client_new` ADD `negotiation_audio_text_add_time` DECIMAL( 9, 2 ) NOT NULL DEFAULT '0.00' COMMENT '文字起こしの追加購入時間' AFTER `negotiation_audio_text_time_limit_second`;
ALTER TABLE `master_client_new` ADD `negotiation_audio_text_add_time_limit_second` INT( 10 ) NULL DEFAULT NULL COMMENT '追加購入した文字起こし残り時間(秒)' AFTER `negotiation_audio_text_add_time`;
ALTER TABLE `master_client_new` ADD `webinar_time_limit_second` INT( 10 ) NULL DEFAULT NULL COMMENT 'ウェビナーの使用できる時間(分)' AFTER `webinar_available_time`;
ALTER TABLE `master_client_new` ADD `webinar_add_time` INT( 11 ) NOT NULL DEFAULT '0' COMMENT 'ウェビナーの追加購入時間（時間）' AFTER `webinar_time_limit_second`;
ALTER TABLE `master_client_new` ADD `webinar_add_time_limit_second` INT( 10 ) NULL DEFAULT NULL COMMENT '追加購入したウェビナーの使用できる時間(分)' AFTER `webinar_add_time`;
ALTER TABLE `master_client_new` ADD `webinar_available_flg` INT( 1 ) NOT NULL DEFAULT '0' COMMENT 'ウェビナーが'使用可能【0の場合使用可、1の場合使用不可】' AFTER `webinar_available_time`;