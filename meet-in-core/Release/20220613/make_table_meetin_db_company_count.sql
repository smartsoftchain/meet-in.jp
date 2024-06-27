CREATE TABLE `company_count` (
                                            `number` int(11) NOT NULL COMMENT '導入企業数',
                                            `create_time` datetime NOT NULL COMMENT '作成日時',
                                            `update_time` datetime NOT NULL COMMENT '更新日時'
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='導入企業数管理';

# DROP TABLE `company_count`;

flush privileges;
