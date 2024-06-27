ALTER TABLE `master_staff_new` ADD record_method_type tinyint NOT NULL default 0 COMMENT '録画方式 0: 拡張機能インストール型, 1: アプリダウンロード型(API)' after staff_role;
#ALTER TABLE `master_staff_new` DROP COLUMN `record_method_type`;
# 前回（2021/10/07）追加したカラムを削除するもの
#ALTER TABLE `master_client_new` DROP COLUMN `record_method_type`;
flush privileges;
