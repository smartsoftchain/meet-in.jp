ALTER TABLE `business_discussion_result` ADD `download_url` VARCHAR( 255 ) NULL DEFAULT NULL COMMENT 'ルーム内で画面録画した動画ファイルをダウンロードするためのリンク' AFTER `memo` ;