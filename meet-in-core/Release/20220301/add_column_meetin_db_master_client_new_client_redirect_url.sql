ALTER TABLE `master_client_new` ADD client_redirect_url varchar(100) COMMENT 'ルーム退出後リダイレクト先' after client_homepage;
#ALTER TABLE `master_client_new` DROP COLUMN `client_redirect_url`;

flush privileges;