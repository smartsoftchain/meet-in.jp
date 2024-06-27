CREATE TABLE `e_contract_tag` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '電子契約のタグID',
  `e_contract_case_id` int(11) NOT NULL COMMENT '電子契約ID',
  `name` varchar(50) COLLATE utf8_unicode_ci NOT NULL COMMENT 'タグ名',
  `create_date` datetime NOT NULL,
  `update_date` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `e_contract_case_id_pkey` (`e_contract_case_id`)
) ENGINE=InnoDB AUTO_INCREMENT=60 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
# DROP TABLE e_contract_tag;