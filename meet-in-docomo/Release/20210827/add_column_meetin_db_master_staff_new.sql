ALTER TABLE master_staff_new ADD e_contract_authority_flg tinyint default 0 COMMENT '電子契約の利用可否' after delete_general_authority_flg;
#ALTER TABLE master_staff_new DROP COLUMN `e_contract_authority_flg`;
flush privileges;