<?php
/**
 * client_db_company_テーブルとclient_db_approach_target_テーブルに、マスターDBからダウンロードしたか判定する為のIDを設定する
 * @var unknown_type
 */
try{
	debugMeg("AlterAddColumnByMasterDownload_begin");
	
	// 環境によりスキーマ名が違うので設定する
	$dbName = "tel-marketing_tmo";
	//$dbName = "tel-marketing_tmo_20150929";
	
	// クライアントのDB情報を書き換える処理
	// 全クライアントを取得し、テーブルにカラムを追加する
	$clientList = getClientList($dbName);
	foreach($clientList as $client){
		alterAddMasterId($dbName, $client["client_id"]);
	}
	// tmpテーブルは全クライアントで１つなので別処理で登録する
	alterAddMasterIdByTmpTable($dbName);
	
	debugMeg("AlterAddColumnByMasterDownload_end");
}
catch (Exception $err){
	debugMeg("想定外の例外：".$err->getMessage());
}

/**
 * デバッグメッセージ
 * @param unknown $actionName	処理名
 */
function debugMeg($actionName){
	error_log($actionName.":".date("Y-m-d H:i:s"));
}

/**
 * 全クライアントデータを取得する
 */
function getClientList($dbName) {
	// DBのインスタンス作成
	$dsn  = "mysql:dbname={$dbName};host=localhost;";
	$user = "root";
	$password = "90kon6Fmysql";
	$db = new PDO($dsn, $user, $password);

	$sql = "
		SELECT
			client_id 
		FROM
			master_client 
		ORDER BY
			client_id asc;
	";
	$stm = $db->query($sql);
	$list = $stm->fetchAll();
	return $list;
}

/**
 * カラム追加処理
 * @return unknown
 */
function alterAddMasterId($dbName, $clientId){
	// DBのインスタンス作成
	$dsn  = "mysql:dbname={$dbName};host=localhost;";
	$user = "root";
	$password = "90kon6Fmysql";
	$db = new PDO($dsn, $user, $password);
	
	$tableName = "client_db_company_{$clientId}";
	$sql = "ALTER TABLE {$tableName} ADD `master_db_company_id` int (11) DEFAULT NULL COMMENT 'ダウンロード時マスターDBのIDを設定' AFTER inquiry_form;";
	$db->query($sql);
	
	$tableName = "client_db_approach_target_{$clientId}";
	$sql = "ALTER TABLE {$tableName} ADD `master_db_approach_target_id` int (11) DEFAULT NULL COMMENT 'ダウンロード時マスターDBのIDを設定' AFTER free10_value;";
	$db->query($sql);
	
	$tableName = "client_db_company_history_{$clientId}";
	$sql = "ALTER TABLE {$tableName} ADD `master_db_company_id` int (11) DEFAULT NULL COMMENT 'ダウンロード時マスターDBのIDを設定' AFTER inquiry_form;";
	$db->query($sql);
	
	$tableName = "client_db_approach_target_history_{$clientId}";
	$sql = "ALTER TABLE {$tableName} ADD `master_db_approach_target_id` int (11) DEFAULT NULL COMMENT 'ダウンロード時マスターDBのIDを設定' AFTER free10_value;";
	$db->query($sql);
	
	return;
}

/**
 * カラム追加処理
 * @return unknown
 */
function alterAddMasterIdByTmpTable($dbName){
	// DBのインスタンス作成
	$dsn  = "mysql:dbname={$dbName};host=localhost;";
	$user = "root";
	$password = "90kon6Fmysql";
	$db = new PDO($dsn, $user, $password);

	$sql = "ALTER TABLE client_db_tmp_company ADD `master_db_company_id` int (11) DEFAULT NULL COMMENT 'ダウンロード時マスターDBのIDを設定' AFTER inquiry_form;";
	$db->query($sql);

	$sql = "ALTER TABLE client_db_tmp_approach_target ADD `master_db_approach_target_id` int (11) DEFAULT NULL COMMENT 'ダウンロード時マスターDBのIDを設定' AFTER free10_value;";
	$db->query($sql);

	return;
}
