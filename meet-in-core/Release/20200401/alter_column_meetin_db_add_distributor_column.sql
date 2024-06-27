
ALTER TABLE master_staff_new ADD COLUMN enter_login_date datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT "最終ログイン日時" AFTER `enter_room_date`;

ALTER TABLE `master_client_new` ADD COLUMN client_type tinyint(4) COMMENT '  クライアント種別[1:利用のみ, 2:販売＋利用]' AFTER `usage_type`;
ALTER TABLE `master_client_new` ADD COLUMN distribution_channel_client_id int(11) COMMENT '  購入経路' AFTER `client_type`;
ALTER TABLE `master_client_new` ADD COLUMN purchasing_client_account_cnt int(11) DEFAULT '0' COMMENT '  購入企業アカウント数(ID数)' AFTER `distribution_channel_client_id`;
ALTER TABLE `master_client_new` ADD COLUMN distributor_salesstaff_name blob COMMENT '  代理店営業担当者' AFTER `purchasing_client_account_cnt`;
ALTER TABLE `master_client_new` ADD COLUMN distributor_salesstaff_email varchar(256) COLLATE utf8_unicode_ci COMMENT '  代理店営業担当メールアドレス' AFTER `distributor_salesstaff_name`;
ALTER TABLE `master_client_new` ADD COLUMN distributor_salesstaff_ccemail varchar(256) COLLATE utf8_unicode_ci COMMENT '  代理店営業担当 CCメールアドレス' AFTER `distributor_salesstaff_email`;
ALTER TABLE `master_client_new` ADD COLUMN contract_money int(11) COMMENT '  契約した金額' AFTER `distributor_salesstaff_ccemail`;
ALTER TABLE `master_client_new` ADD COLUMN first_payout_staff_cnt int(11) COMMENT '  初回発行アカウント数' AFTER `contract_money`;
ALTER TABLE `master_client_new` ADD COLUMN max_payout_staff_cnt int(11) COMMENT '  MAXアカウント数' AFTER `first_payout_staff_cnt`;
ALTER TABLE `master_client_new` ADD COLUMN contract_file text COLLATE utf8_unicode_ci COMMENT '  契約書' AFTER `max_payout_staff_cnt`;
ALTER TABLE `master_client_new` ADD COLUMN billing_address varchar(50) COLLATE utf8_unicode_ci COMMENT '  請求書送付先住所' AFTER `contract_file`;
ALTER TABLE `master_client_new` ADD COLUMN order_date datetime COMMENT '  受注日' AFTER `billing_address`;
ALTER TABLE `master_client_new` ADD COLUMN contract_period_start_date datetime NOT NULL COMMENT '  契約期間 開始日' AFTER `order_date`;
ALTER TABLE `master_client_new` ADD COLUMN contract_period_end_date datetime NOT NULL COMMENT '  契約期間 終了日' AFTER `contract_period_start_date`;
ALTER TABLE `master_client_new` ADD COLUMN start_use_date datetime COMMENT '  使用開始日' AFTER `contract_period_end_date`;
ALTER TABLE `master_client_new` ADD COLUMN billing_staff_name blob COMMENT '  請求先担当者名' AFTER `start_use_date`;
ALTER TABLE `master_client_new` ADD COLUMN billing_staff_email varchar(256) COLLATE utf8_unicode_ci COMMENT '  請求先担当者メールアドレス' AFTER `billing_staff_name`;
ALTER TABLE `master_client_new` ADD COLUMN follow_call_date datetime COMMENT '  フォローコール開始希望日' AFTER `billing_staff_email`;


