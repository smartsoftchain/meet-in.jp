ALTER TABLE master_staff_new modify column enter_login_date datetime COMMENT '最終ログイン日時';
flush privileges;
