ALTER TABLE `e_contract_document` ADD COLUMN delete_date datetime default null AFTER `update_date`;
# ALTER TABLE `e_contract_document` DROP COLUMN `update_date`;

ALTER TABLE `e_contract_document` ADD KEY `index_delete_date` (`delete_date`);
#ALTER TABLE `e_contract_document`  DROP KEY `delete_date`;

