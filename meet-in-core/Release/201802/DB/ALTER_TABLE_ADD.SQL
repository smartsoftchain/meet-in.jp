USE meetin_db;


ALTER TABLE  staff_client ADD namecard_room_public_flg TINYINT( 1 ) NOT NULL DEFAULT '0' COMMENT 'ルーム名公開フラグ' AFTER namecard_meetin_public_flg;

ALTER TABLE  `master_staff_new` ADD  `room_name` VARCHAR( 32 ) NULL DEFAULT NULL COMMENT  'ルーム名' AFTER  `desktop_notify_flg`;

ALTER TABLE  `connection_info` ADD  `room_state` TINYINT NOT NULL DEFAULT '0' COMMENT '商談ルームの状態' AFTER `room_name`;

ALTER TABLE  `connection_info` ADD  `collabo_id` TINYINT NOT NULL DEFAULT '0' COMMENT '連携サイト種別(0:meet-in)' AFTER `room_state`;


ALTER TABLE  `connection_info` ADD  `login_flg1` TINYINT NULL DEFAULT 0 COMMENT 'ログインFLG(0:ログOFF/ログインON)' AFTER `user_peer_id_1`;
ALTER TABLE  `connection_info` ADD  `login_flg2` TINYINT NULL DEFAULT 0 COMMENT 'ログインFLG(0:ログOFF/ログインON)' AFTER `user_peer_id_2`;
ALTER TABLE  `connection_info` ADD  `login_flg3` TINYINT NULL DEFAULT 0 COMMENT 'ログインFLG(0:ログOFF/ログインON)' AFTER `user_peer_id_3`;
ALTER TABLE  `connection_info` ADD  `login_flg4` TINYINT NULL DEFAULT 0 COMMENT 'ログインFLG(0:ログOFF/ログインON)' AFTER `user_peer_id_4`;
ALTER TABLE  `connection_info` ADD  `login_flg5` TINYINT NULL DEFAULT 0 COMMENT 'ログインFLG(0:ログOFF/ログインON)' AFTER `user_peer_id_5`;
ALTER TABLE  `connection_info` ADD  `login_flg6` TINYINT NULL DEFAULT 0 COMMENT 'ログインFLG(0:ログOFF/ログインON)' AFTER `user_peer_id_6`;
ALTER TABLE  `connection_info` ADD  `login_flg7` TINYINT NULL DEFAULT 0 COMMENT 'ログインFLG(0:ログOFF/ログインON)' AFTER `user_peer_id_7`;
ALTER TABLE  `connection_info` ADD  `login_flg8` TINYINT NULL DEFAULT 0 COMMENT 'ログインFLG(0:ログOFF/ログインON)' AFTER `user_peer_id_8`;

ALTER TABLE `connection_info` ADD  `room_enter_cnt` BIGINT NULL DEFAULT 0 COMMENT 'ルーム使用数' AFTER `collabo_id`;
ALTER TABLE `connection_info` ADD  `room_access_cnt` BIGINT NULL DEFAULT 0 COMMENT 'ルームアクセス数' AFTER `room_enter_cnt`;


ALTER TABLE `staff_client` ADD  `namecard_url` text NOT NULL COMMENT '名刺用URL' AFTER `namecard_email_public_flg`;
ALTER TABLE `staff_client` ADD `namecard_url_public_flg` TINYINT NOT NULL DEFAULT '0' COMMENT '名刺用URL公開フラグ' AFTER `namecard_url`;

ALTER TABLE `staff_client` ADD  `namecard_postcode1` varchar(3) NULL DEFAULT NULL COMMENT '郵便番号1' AFTER `namecard_executive_public_flg`;
ALTER TABLE `staff_client` ADD  `namecard_postcode2` varchar(4) NULL DEFAULT NULL COMMENT '郵便番号2' AFTER `namecard_postcode1`;

ALTER TABLE `staff_client` ADD  `namecard_free3_name` text NOT NULL COMMENT 'フリー項目3名前' AFTER `namecard_free2_public_flg`;
ALTER TABLE `staff_client` ADD  `namecard_free3_val` text NOT NULL COMMENT 'フリー項目3値' AFTER `namecard_free3_name`;
ALTER TABLE `staff_client` ADD  `namecard_free3_public_flg` TINYINT NOT NULL DEFAULT 0 COMMENT 'フリー項目3公開フラグ' AFTER `namecard_free3_val`;

ALTER TABLE `staff_client` ADD  `namecard_free4_name` text NOT NULL COMMENT 'フリー項目4名前' AFTER `namecard_free3_public_flg`;
ALTER TABLE `staff_client` ADD  `namecard_free4_val` text NOT NULL COMMENT 'フリー項目4値' AFTER `namecard_free4_name`;
ALTER TABLE `staff_client` ADD  `namecard_free4_public_flg` TINYINT NOT NULL DEFAULT 0 COMMENT 'フリー項目4公開フラグ' AFTER `namecard_free4_val`;

ALTER TABLE `staff_client` ADD  `namecard_free5_name` text NOT NULL COMMENT 'フリー項目5名前' AFTER `namecard_free4_public_flg`;
ALTER TABLE `staff_client` ADD  `namecard_free5_val` text NOT NULL COMMENT 'フリー項目5値' AFTER `namecard_free5_name`;
ALTER TABLE `staff_client` ADD  `namecard_free5_public_flg` TINYINT NOT NULL DEFAULT 0 COMMENT 'フリー項目5公開フラグ' AFTER `namecard_free5_val`;

ALTER TABLE `staff_client` ADD  `namecard_photo1_desc` varchar(40) DEFAULT NULL COMMENT '写真1説明' AFTER `namecard_free5_public_flg`;
ALTER TABLE `staff_client` ADD  `namecard_photo1_desc_public_flg` tinyint(1) NOT NULL DEFAULT '0' COMMENT '写真1説明公開フラグ' AFTER `namecard_photo1_desc`;
ALTER TABLE `staff_client` ADD  `namecard_photo1_public_flg` tinyint(1) NOT NULL DEFAULT '0' COMMENT '写真1公開フラグ' AFTER `namecard_photo1_desc_public_flg`;

ALTER TABLE `staff_client` ADD  `namecard_photo2_desc` varchar(40) DEFAULT NULL COMMENT '写真2説明' AFTER `namecard_photo1_public_flg`;
ALTER TABLE `staff_client` ADD  `namecard_photo2_desc_public_flg` tinyint(1) NOT NULL DEFAULT '0' COMMENT '写真2説明公開フラグ' AFTER `namecard_photo2_desc`;
ALTER TABLE `staff_client` ADD  `namecard_photo2_public_flg` tinyint(1) NOT NULL DEFAULT '0' COMMENT '写真2公開フラグ' AFTER `namecard_photo2_desc_public_flg`;

ALTER TABLE `staff_client` ADD  `namecard_introduction` varchar(300) DEFAULT NULL COMMENT '紹介文' AFTER `namecard_photo2_public_flg`;
ALTER TABLE `staff_client` ADD  `namecard_introduction_public_flg` tinyint(1) NOT NULL DEFAULT '0' COMMENT '紹介文公開フラグ' AFTER `namecard_introduction`;
ALTER TABLE `staff_client` ADD  `namecard_cate1_title` varchar(20) DEFAULT NULL COMMENT 'カテゴリー1タイトル' AFTER `namecard_introduction_public_flg`;
ALTER TABLE `staff_client` ADD  `namecard_cate1_title_public_flg` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'カテゴリー1タイトル公開フラグ' AFTER `namecard_cate1_title`;
ALTER TABLE `staff_client` ADD  `namecard_cate2_title` varchar(20) DEFAULT NULL COMMENT 'カテゴリー2タイトル' AFTER `namecard_cate1_title_public_flg`;
ALTER TABLE `staff_client` ADD  `namecard_cate2_title_public_flg` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'カテゴリー2タイトル公開フラグ' AFTER `namecard_cate2_title`;
ALTER TABLE `staff_client` ADD  `namecard_cate3_title` varchar(20) DEFAULT NULL COMMENT 'カテゴリー3タイトル' AFTER `namecard_cate2_title_public_flg`;
ALTER TABLE `staff_client` ADD  `namecard_cate3_title_public_flg` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'カテゴリー3タイトル公開フラグ' AFTER `namecard_cate3_title`;
ALTER TABLE `staff_client` ADD  `namecard_cate4_title` varchar(20) DEFAULT NULL COMMENT 'カテゴリー4タイトル' AFTER `namecard_cate3_title_public_flg`;
ALTER TABLE `staff_client` ADD  `namecard_cate4_title_public_flg` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'カテゴリー4タイトル公開フラグ' AFTER `namecard_cate4_title`;
