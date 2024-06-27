ALTER TABLE `master_client_new` 
ADD `negotiation_audio_analysis_remaining_hour` decimal(9,2) UNSIGNED DEFAULT 0.00 COMMENT '音声分析制限時間' AFTER `negotiation_audio_text_add_time_limit_second`,
ADD `negotiation_audio_analysis_time_limit_second` int(10) UNSIGNED DEFAULT NULL COMMENT '音声分析残り時間(秒)' AFTER `negotiation_audio_analysis_remaining_hour`,
ADD `negotiation_audio_analysis_add_time` decimal(9,2) NOT NULL DEFAULT 0.00 COMMENT '音声分析の追加購入時間' AFTER `negotiation_audio_analysis_time_limit_second`, 
ADD `negotiation_audio_analysis_add_time_limit_second` int(10) DEFAULT NULL COMMENT '追加購入した音声分析残り時間(秒)' AFTER `negotiation_audio_analysis_time_add_time`;
