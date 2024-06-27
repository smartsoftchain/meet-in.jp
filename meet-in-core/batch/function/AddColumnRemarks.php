<?php
/**
 * client_db_approach_target_テーブルとclient_db_approach_target_history_にカラムを追加する
 * @var unknown_type
 */
try{
	debugMeg("AddColumnRemarks_begin");
	
	// DAO読み込み時のエラー回避のため、空のarrayをセットする
	Zend_Registry::set('user', array());
	
	// 新TMOのDBオブジェクトを宣言
	$config  = new Zend_Config_Ini(APP_DIR . 'configs/system.ini', SERVICE_MODE);
	$database = Zend_Db::factory($config->datasource);
	$database->setFetchMode(Zend_Db::FETCH_ASSOC);
	Zend_Db_Table_Abstract::setDefaultAdapter($database);
	// プロファイラ有効
	$database->getProfiler()->setEnabled(true);
	// 暗号化カラムを復号化するためのキー設定
	$database->query("set @key:='{$config->datasource->key}'");
	$newDb = Zend_Db_Table_Abstract::getDefaultAdapter();
	
	// クライアントのDB情報を書き換える処理
	// 全クライアントを取得し、テーブルにカラムを追加する
	$clientList = getClientList($newDb);
	foreach($clientList as $client){
		error_log("client_id:{$client["client_id"]}");
		$sql = "";
		$tableName = "client_db_approach_target_{$client["client_id"]}";
		$result = searchTreeTable($newDb, $tableName);
		if($result){
			$sql = "ALTER TABLE {$tableName} ADD `remarks` text COMMENT '備考' AFTER converted_address;";
			$newDb->query($sql);
		}else{
			error_log("no table [{$tableName}]");
		}
		$tableName = "client_db_approach_target_history_{$client["client_id"]}";
		$result = searchTreeTable($newDb, $tableName);
		if($result){
			$sql = "ALTER TABLE {$tableName} ADD `remarks` text COMMENT '備考' AFTER converted_address;";
			$newDb->query($sql);
		}else{
			error_log("no table [{$tableName}]");
		}
	}
	// tmpテーブルは全クライアントで１つなので別処理で登録する
	$sql = "ALTER TABLE master_db_approach_target ADD `remarks` text COMMENT '備考' AFTER converted_address;";
	$newDb->query($sql);
	$sql = "ALTER TABLE master_db_approach_target_history ADD `remarks` text COMMENT '備考' AFTER converted_address;";
	$newDb->query($sql);
	
	debugMeg("AddColumnRemarks_end");
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
function getClientList($db) {
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
 * ALTERをかけるテーブルが存在するか調べる
 * @param unknown $db
 * @param unknown $tableName
 * @return unknown
 */
function searchTreeTable($db, $tableName){
	$sql = "SHOW TABLES LIKE  '{$tableName}'";
	$row = $db->fetchRow($sql, array());
	return $row;
}
