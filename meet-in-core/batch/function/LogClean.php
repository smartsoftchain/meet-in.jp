<?php
/**
 * 1週間毎にログをファイルに出力し、ログテーブルを空にする
 * @var unknown_type
 */
try{
	debugMeg("LogClean_begin");
	
	// DAOを宣言
	$db = Zend_Db_Table_Abstract::getDefaultAdapter();
	
	// 全てのログデータを取得する
	chdir("/var/www/html/batch/function");
	$cmd = "./LogClean.sh";
	exec($cmd, $result);

	// テーブルを再作成する
	reCreateTable($db);
	
	debugMeg("LogClean_end");
}
catch (Exception $err){
	debugMeg("想定外の例外：".$err->getMessage());
}

/**
 * デバッグメッセージ
 * @param unknown $actionName	処理名
 */
function debugMeg($actionName){
	error_log($actionName.":".date("Y-m-d H:i:s")."\n");
}

/**
 * ログテーブルを再作成する
 */
function reCreateTable($db){
	$sql = "
		DROP TABLE `logs`;
		CREATE TABLE IF NOT EXISTS `logs` (
			`staff_id` int(11) NOT NULL COMMENT 'スタッフID',
			`staff_type` varchar(4) NOT NULL COMMENT 'スタッフ種別[AA,TA,CE]',
			`client_id` int(11) COMMENT 'クライアントID',
			`create_time` datetime NOT NULL COMMENT '作成日時',
			`action_name` varchar(64) NOT NULL COMMENT 'アクション名',
			`send_data` longtext NOT NULL COMMENT 'サーバーへ送信したデータ'
		) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE utf8_unicode_ci;
		";
	$db->exec($sql);
}