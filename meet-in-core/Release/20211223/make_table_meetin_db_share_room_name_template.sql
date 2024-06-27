CREATE TABLE `share_room_name_template` (
`id` int(11) NOT NULL AUTO_INCREMENT,
`client_id` int(11) DEFAULT NULL COMMENT 'クライアントID master_client_new.clien_id',
`staff_type` char(2) COLLATE utf8_unicode_ci NOT NULL COMMENT '登録者種別　master_staff_new.staff_type',
`staff_id` int(11) NOT NULL DEFAULT '0' COMMENT '登録者登録者ID master_staff_new.staff_id',
`text` text COLLATE utf8_unicode_ci DEFAULT NULL COMMENT '定文',
`create_time` datetime NOT NULL COMMENT '作成日時',
`update_time` datetime NOT NULL COMMENT '更新日時',
`del_flg` tinyint(4) NOT NULL DEFAULT '0' COMMENT '削除フラグ',
PRIMARY KEY (`id`),
KEY `staff_index` (`staff_id`, `staff_type`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='ルーム招待文テンプレート';

# DROP TABLE `share_room_name_template`;