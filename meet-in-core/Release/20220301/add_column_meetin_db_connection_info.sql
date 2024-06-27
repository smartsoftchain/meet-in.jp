ALTER TABLE `connection_info` ADD guest_redirect_url varchar(100) default null COMMENT 'リダイレクト先のURL';
#ALTER TABLE `connection_info` DROP COLUMN `guest_redirect_url`;
flush privileges;
