<?php


try{
	debugMeg("SplitTreeActionPath_begin");

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

	$newDb->beginTransaction();

	// クライアントのDB情報を書き換える処理
	// 全クライアントを取得し、テーブルにカラムを追加する
	$clientList = getClientList($newDb);

	foreach($clientList as $client){
		error_log("client_id:{$client["client_id"]}");
		// 分割処理
		splitPath($newDb,"tree_action_{$client["client_id"]}");

		//index追加処理
		addIndex($newDb,"tree_action_{$client["client_id"]}","id");
		addIndex($newDb,"tree_action_{$client["client_id"]}","approach_list_id");
		addIndex($newDb,"client_db_company_{$client["client_id"]}","update_date");
	}
	// 登録完了したらコミットする
	$newDb->commit();

	debugMeg("SplitTreeActionPath_end");
}
catch (Exception $err){
	debugMeg("想定外の例外：".$err->getMessage());
	$newDb->rollBack();
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

/**
 * ALTERをかけるテーブルが存在するか調べる
 * @param unknown $db
 * @param unknown $tableName
 * @param unknown $columns
 * @return unknown
 */
function addIndex($db, $tableName, $columns){
	if(!is_array($columns)){
		$columns=array($columns);
	}

	$sql = "ALTER TABLE {$tableName} ADD INDEX index_".implode("_",$columns)."(".implode(",",$columns).");";
	$row = $db->query($sql, array());
	return $row;
}

/**
 * パス分割のメイン処理
 * @param $db
 * @param $tableName
 * @return mixed
 */
function splitPath($db, $tableName){
	if(searchTreeTable($db,$tableName)){

		// カラムに変更をかけ、新規カラムを追加する
		$sql = "ALTER TABLE {$tableName} CHANGE COLUMN id approach_target_id int (11) NOT NULL COMMENT 'client_db_approach_targetテーブルのID';
ALTER TABLE {$tableName} ADD `approach_list_id` int (11) NOT NULL COMMENT 'approach_listテーブルのID' FIRST;
ALTER TABLE {$tableName} ADD `approach_type` tinyint NOT NULL DEFAULT 0 COMMENT 'アプローチ種別[1:架電,2:メールDM,3:お問い合わせ]' AFTER approach_target_id;
ALTER TABLE {$tableName} ADD `template_approach_result_id` int (11) NOT NULL DEFAULT 0 COMMENT 'template_approach_resultテーブルのID' AFTER approach_type;
ALTER TABLE {$tableName} ADD `again_flg` tinyint NOT NULL DEFAULT 0 COMMENT '掛け直しフラグ' AFTER template_approach_result_id;
ALTER TABLE {$tableName} ADD `approach_result_id` DECIMAL(32,0) NOT NULL DEFAULT 0 COMMENT 'アプローチ結果のID' AFTER again_flg;
";
		$db->query($sql);

		// カラムに変更をかけたぶんを戻す
		$sql = "
ALTER TABLE {$tableName} ADD `id` int (11) NOT NULL DEFAULT 0 COMMENT '旧ID' AFTER again_flg;
";
		$db->query($sql);

		// type 3のパスを分割
		$sql = "UPDATE
	{$tableName} as a,
	(
		SELECT 
			approach_target_id,
			type,
			actiontime,
			path,
			SUBSTRING_INDEX(SUBSTRING_INDEX(path, '.', 2), '.', -1) as approach_list_id, 
			'0' as approach_type,
			'0' as template_approach_result_id,
			'0' as again_flg 
		FROM
			{$tableName} 
		WHERE 
			type = 3 AND 
			((LENGTH(path) - LENGTH(REPLACE(path, '.', ''))) / LENGTH('.')) = 2 
		UNION 
		SELECT 
			approach_target_id,
			type,
			actiontime,
			path,
			SUBSTRING_INDEX(SUBSTRING_INDEX(path, '.', 2), '.', -1) as approach_list_id, 
			SUBSTRING_INDEX(SUBSTRING_INDEX(path, '.', 4), '.', -1) as approach_type,
			SUBSTRING_INDEX(SUBSTRING_INDEX(path, '.', 5), '.', -1) as template_approach_result_id,
			SUBSTRING_INDEX(SUBSTRING_INDEX(path, '.', 6), '.', -1) as again_flg 
		FROM
			{$tableName} 
		WHERE 
			type = 3 AND 
			((LENGTH(path) - LENGTH(REPLACE(path, '.', ''))) / LENGTH('.')) > 2
	) as b 
SET 
	a.approach_list_id = b.approach_list_id, 
	a.approach_type = b.approach_type, 
	a.template_approach_result_id = b.template_approach_result_id, 
	a.again_flg = b.again_flg 
WHERE 
	a.type = b.type AND 
	a.path = b.path AND 
	a.approach_target_id = b.approach_target_id AND 
	a.actiontime = b.actiontime;
";
		$db->query($sql);


		// タイプ4のパス分割　
		$sql = "UPDATE
	{$tableName} as a,
	(
		SELECT 
			approach_target_id,
			type,
			actiontime,
			path,
			SUBSTRING_INDEX(SUBSTRING_INDEX(path, '.', 2), '.', -1) as approach_list_id, 
			SUBSTRING_INDEX(SUBSTRING_INDEX(path, '.', 4), '.', -1) as approach_type,
			SUBSTRING_INDEX(SUBSTRING_INDEX(path, '.', 5), '.', -1) as template_approach_result_id,
			SUBSTRING_INDEX(SUBSTRING_INDEX(path, '.', 6), '.', -1) as approach_result_id 
		FROM
			{$tableName} 
		WHERE 
			type = 4 AND 
			((LENGTH(path) - LENGTH(REPLACE(path, '.', ''))) / LENGTH('.')) > 2
	) as b 
SET 
	a.approach_list_id = b.approach_list_id, 
	a.approach_type = b.approach_type, 
	a.template_approach_result_id = b.template_approach_result_id, 
	a.approach_result_id = b.approach_result_id 
WHERE 
	a.type = b.type AND 
	a.path = b.path AND 
	a.approach_target_id = b.approach_target_id AND 
	a.actiontime = b.actiontime;
";
		$db->query($sql);

		$sql = "UPDATE
	{$tableName} as a,
	(
		SELECT 
			approach_target_id,
			type,
			actiontime,
			path,
			SUBSTRING_INDEX(SUBSTRING_INDEX(path, '.', 2), '.', -1) as approach_list_id, 
			'0' as approach_type,
			'0' as template_approach_result_id,
			'0' as again_flg 
		FROM
			{$tableName} 
	) as b 
SET 
	a.id = b.approach_target_id
WHERE 
	a.type = b.type AND 
	a.path = b.path AND 
	a.approach_target_id = b.approach_target_id AND 
	a.actiontime = b.actiontime;
";
		$db->query($sql);

	}else{
		error_log("no table [{$tableName}]");
	}
}
