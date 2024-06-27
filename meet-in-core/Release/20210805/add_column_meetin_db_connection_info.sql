ALTER TABLE `connection_info` ADD users_want_enter_locked_room text default null COMMENT 'ロックされたroomに入室依頼を出したユーザー達';
#ALTER TABLE `connection_info` DROP COLUMN `users_want_enter_locked_room`;
flush privileges;
