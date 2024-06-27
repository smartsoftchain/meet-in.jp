
CREATE TABLE `negotiation_conversations` (
	`conversation_id` varchar(50) COLLATE utf8_unicode_ci NOT NULL COMMENT '会話ID',
	`client_id` int(11) NOT NULL COMMENT '登録者クライアントID',
	`staff_id` int(11) NOT NULL COMMENT '登録者担当者id',
  	`staff_type` char(2) COLLATE utf8_unicode_ci NOT NULL COMMENT '登録者アカウント種別',
	`room_name` varchar(255) NOT NULL COMMENT 'ルーム名',
	`conversation_date` datetime NOT NULL COMMENT '解析日時',
	`day_of_the_week` tinyint(4) NOT NULL COMMENT '解析曜日 WEEKDAY遵守[0:月,1:火,2:水,3:木,4:金,5:土,6:日]',
	`del_flg` int(1) NOT NULL DEFAULT '0' COMMENT '削除フラグ',
	PRIMARY KEY (`conversation_id`),
	KEY `idx_client_id` (`client_id`),
	KEY `idx_staff` (`client_id`, `staff_type`, `staff_id`),
	KEY `idx_conversation_date` (`conversation_date`),
	KEY `idx_day_of_the_week` (`day_of_the_week`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='感情解析用テーブル';


CREATE TABLE `conversation_aggregate` (
	`conversation_id` varchar(50) COLLATE utf8_unicode_ci NOT NULL COMMENT '会話ID',
	`speaker_label` int(11) NOT NULL COMMENT '話者No',
	`client_id` int(11) NOT NULL COMMENT 'クライアントID',
	`staff_id` int(11) DEFAULT NULL COMMENT '担当者ID',
	`staff_type` varchar(2) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'アカウント種別',
	`pause_count` int(11) DEFAULT NULL COMMENT '会話の間の数',
	`bargein_count` int(11) DEFAULT NULL COMMENT '会話の被りの数',
	`volume_avg` int(11) DEFAULT NULL COMMENT '声の音量の平均',
	`speech_rate_avg` int(11) DEFAULT NULL COMMENT '会話比の平均',
	`energy_avg` int(11) DEFAULT NULL COMMENT 'エネルギー(平均)',
	`stress_avg` int(11) DEFAULT NULL COMMENT 'ストレス(平均)',
	`emo_cog_avg` int(11) DEFAULT NULL COMMENT '論理/感情バランス(平均)',
	`concentration_avg` int(11) DEFAULT NULL COMMENT '集中(平均)',
	`anticipation_avg` int(11) DEFAULT NULL COMMENT '期待(平均)',
	`excitement_avg` int(11) DEFAULT NULL COMMENT '興奮(平均)',
	`hesitation_avg` int(11) DEFAULT NULL COMMENT '躊躇(平均)',
	`uncertainty_avg` int(11) DEFAULT NULL COMMENT '不確実(平均)',
	`intensive_thinking_avg` int(11) DEFAULT NULL COMMENT '思考(平均)',
	`imagination_activity_avg` int(11) DEFAULT NULL COMMENT '想像力(平均)',
	`embarrassment_avg` int(11) DEFAULT NULL COMMENT '困惑(平均)',
	`passionate_avg` int(11) DEFAULT NULL COMMENT '情熱(平均)',
	`brain_power_avg` int(11) DEFAULT NULL COMMENT '脳活動(平均)',
	`confidence_avg` int(11) DEFAULT NULL COMMENT '自信(平均)',
	`aggression_avg` int(11) DEFAULT NULL COMMENT '攻撃性,憤り(平均)',
	`call_priority_avg` int(11) DEFAULT NULL COMMENT 'コールプライオリティ(平均)',
	`atmosphere_avg` int(11) DEFAULT NULL COMMENT '雰囲気,会話傾向(平均)',
	`upset_avg` int(11) DEFAULT NULL COMMENT '動揺(平均)',
	`content_avg` int(11) DEFAULT NULL COMMENT '喜び(平均)',
	`dissatisfaction_avg` int(11) DEFAULT NULL COMMENT '不満(平均)',
	`extreame_emotion_avg` int(11) DEFAULT NULL COMMENT '極端な起伏(平均)',
	`conversation_count` int(11) DEFAULT NULL COMMENT '会話回数',
	`rally_count` int(11) DEFAULT NULL COMMENT 'ラリー回数',
	`conversation_ratio` int(11) DEFAULT NULL COMMENT '会話比率',
	`conversation_date` datetime NOT NULL COMMENT '会話した日時',
	PRIMARY KEY (`conversation_id`,`speaker_label`),
	KEY `idx_conversation_id` (`conversation_id`),
	KEY `idx_client_id` (`client_id`),
	KEY `idx_staff` (`client_id`, `staff_type`, `staff_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='感情解析用の集計テーブル';

# DROP TABLE negotiation_conversations;
# DROP TABLE conversation_aggregate;

flush privileges;


# 音源データを保存する領域の作成.
#cd /mnt/datastore/
#mkdir tmp_audio
#chmod 777 tmp_audio
#ln -s /mnt/datastore/tmp_audio /var/www/html/public/


# バッチの追加: crontab -e
# [音声分析-詳細] 音源データの再生・ダウンロード用の音源データの定期削除.
#0 6 * * * find /mnt/datastore/tmp_audio/ -type f -mtime +10 -prune -exec rm -rf {} \; > /dev/null 2>&1


# application/configs/system.ini
# 【Stage】
# sentiment_db.endPoint = 'https://sentimentdb.aidma-hd.jp/api/meet'
# skyway.recorder.gcs.filePath = 'https://storage.googleapis.com/meetin-skyway-recorder-develop/mp3'
# 【本番】 本番用録音データのStorageパスに書き換え.
# sentiment_db.endPoint = 'https://sentimentdb.aidma-hd.jp/api/meet'
# skyway.recorder.gcs.filePath = 'https://storage.googleapis.com/meetin-skyway-recorder-prod/mp3'