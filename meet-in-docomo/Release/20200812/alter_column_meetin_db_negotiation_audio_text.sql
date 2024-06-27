ALTER TABLE `negotiation_audio_text` ADD COLUMN `text_type` varchar(11) default NULL COMMENT '機能の種類' after status_code;

#ALTER TABLE `negotiation_audio_text` DROP COLUMN `text_type`;

