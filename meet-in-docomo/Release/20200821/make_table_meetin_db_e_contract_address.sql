CREATE TABLE `e_contract_address` (
  `e_contract_address_id` int(11) NOT NULL AUTO_INCREMENT COMMENT '電子契約のテンプレート宛名ID',
  `e_contract_document_id` int(11) NOT NULL COMMENT '電子契約一時データID',
  `email` varchar(256) COLLATE utf8_unicode_ci NOT NULL COMMENT 'メールアドレス',
  `lastname` varchar(50) COLLATE utf8_unicode_ci NOT NULL COMMENT '姓',
  `firstname` varchar(50) COLLATE utf8_unicode_ci NOT NULL COMMENT '名',
  `title` varchar(50) COLLATE utf8_unicode_ci NOT NULL COMMENT '職位',
  `organization_name` varchar(50) COLLATE utf8_unicode_ci NOT NULL COMMENT '組織名',
  `approval_order` tinyint(4) NOT NULL COMMENT '承認順',
  `create_date` datetime NOT NULL,
  `update_date` datetime NOT NULL,
  PRIMARY KEY (`e_contract_address_id`),
  KEY `e_contract_document_id_key` (`e_contract_document_id`)
) ENGINE=InnoDB AUTO_INCREMENT=60 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
# DROP TABLE e_contract_address;

ALTER TABLE `e_contract_case` ADD COLUMN callup_contract_type TINYINT UNSIGNED default 1 COMMENT '契約書の呼び出し方' AFTER `uid`;
# ALTER TABLE `e_contract_case` DROP COLUMN `callup_contract_type`;

ALTER TABLE `e_contract_document` ADD COLUMN is_temporary_creation TINYINT UNSIGNED default 0 COMMENT '一時的な作成' AFTER `name`;
# ALTER TABLE `e_contract_document` DROP COLUMN `is_temporary_creation`;

ALTER TABLE `e_contract_file` ADD COLUMN is_temporary TINYINT UNSIGNED default 0 COMMENT 'テンプレートから作成していない資料' AFTER `size`;
# ALTER TABLE `e_contract_file` DROP COLUMN `is_temporary`;
