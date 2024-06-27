ALTER TABLE `master_client_new` ADD COLUMN negotiation_audio_text_remaining_hour  decimal(9, 2) unsigned default 0 COMMENT '  文字起こし制限時間' AFTER `follow_call_date`;
ALTER TABLE `master_client_new` ADD COLUMN negotiation_audio_text_time_limit_second int UNSIGNED COMMENT '  文字起こし残り時間(秒)' AFTER `negotiation_audio_text_remaining_hour`;
