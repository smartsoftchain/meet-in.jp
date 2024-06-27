# 招待メールの保存.
CREATE TABLE `master_staff_invitation` (
  `send_client_id` int NOT NULL COMMENT '招待者のクライアントID',
  `send_staff_type` char(2) COLLATE utf8_unicode_ci NOT NULL COMMENT '担当者種別[AA:管理担当者,TA:在宅担当者,CE:クライアント担当者]',
  `send_staff_id`  int NOT NULL COMMENT '招待者の担当者ID',
  `dprofile_GeneralMlAddr` varchar(257) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL COMMENT 'docomo連絡先メールアドレス',
  `hash_key` varchar(32) NOT NULL COMMENT "ハッシュ値",
  `create_time` datetime NOT NULL COMMENT '作成日時',
  `delete_time` datetime DEFAULT NULL COMMENT '取消日時',
  `processed_time` datetime DEFAULT NULL COMMENT '処理日時',
  INDEX index_mladdr_hash_key_create_time(dprofile_GeneralMlAddr, hash_key, create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8_unicode_ci COMMENT='スタッフを招待する';
# DROP TABLE `master_staff_invitation`;


# daccount提供データ.
CREATE TABLE `collaborative_services_provided_data` (
  `staff_type` char(2) COLLATE utf8_unicode_ci NOT NULL COMMENT '担当者種別[AA:管理担当者,TA:在宅担当者,CE:クライアント担当者]',
  `staff_id` int(11) NOT NULL COMMENT '担当者ID',
  `accountid` varchar(257) NOT NULL COMMENT 'アカウント識別子 半角英数(桁不明)',
  `DocomoID`  varchar(257) NOT NULL COMMENT 'ビジネスdアカウントのID 半角英数記号(257)',
  `dprofile_GeneralMlAddr` varchar(257) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL COMMENT 'docomo連絡先メールアドレス',
  PRIMARY KEY (accountid),
  INDEX index_staff_type_staff_id(staff_type, staff_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8_unicode_ci COMMENT='docomo提供データ';
# DROP TABLE `collaborative_services_provided_data`;