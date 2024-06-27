ALTER TABLE e_contract_partner2 ADD mail_sent_date datetime default null COMMENT 'メール送信日' after partner_authenticate_flg;
#ALTER TABLE e_contract_partner2 DROP COLUMN `mail_sent_date`;
flush privileges;