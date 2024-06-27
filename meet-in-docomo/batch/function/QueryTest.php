<?php
/**
 * tree_action_clientdbテーブルにカラムを追加し、データを登録する
 * @var unknown_type
 */
try{
	debugMeg("QueryTest_begin");
	
// 	// DAO読み込み時のエラー回避のため、空のarrayをセットする
 	Zend_Registry::set('user', array());
	
// 	// DAOを宣言
// 	$db = Zend_Db_Table_Abstract::getDefaultAdapter();
	
// 	$result = execQuerey($db);
// 	debugMeg($result);

	
	$currentDb = getCurrentDbObject();
	$sql = "
			SELECT 
				a.consumer_URL as url 
			FROM 
				consumer_status as a 
			INNER JOIN 
				consumer as b 
			ON 
				a.consumer_id = b.consumer_id 
			INNER JOIN 
				project as c 
			ON 
				a.consumer_projectid = c.project_id 
			INNER JOIN 
				(
					SELECT 
						DISTINCT result_consumerid, result_id 
					FROM 
						`result` 
					WHERE 
						result_clientid = 42 AND 
						DATE_FORMAT(result_time, '%Y-%m-%d') >= '2016-04-05' AND 
						result_del_flg = 0 
				) as d 
			ON 
				a.consumer_id = d.result_consumerid 
			WHERE 
				a.consumer_URL LIKE 'http://www6.ocn.ne.jp/%' AND 
				(a.consumer_URL <> '' AND consumer_URL IS NOT NULL) AND 
				b.consumer_del_flg = 0 AND 
				c.project_del_flg = 0 AND 
				c.project_clientid = 42 
			";
	$stm = $currentDb->query($sql);
	if(!$stm){
		// 理由は解らないが$stmがnullの場合がある
		error_log($sql);
		exit;
	}
	$consumerList = $stm->fetchAll();
	// コンシューマー起点に架電結果を移行する
	foreach($consumerList as $consumer){
		error_log(escape($consumer["url"]));
	}
	
	debugMeg("QueryTest_end");
}
catch (Exception $err){
	debugMeg("想定外の例外：".$err->getMessage());
}

function escape($word){
	$db = Zend_Db_Table_Abstract::getDefaultAdapter();
	$word = $db->quote($word);
	// 変換するとシングルクウォートで挟まれるので、削除する
	$word = ltrim($word, "'");
	$word = rtrim($word, "'");
	return $word;
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
function execQuerey($db) {
	$sql = "
		SELECT 
		COUNT(DISTINCT a.id) 
	FROM 
		tree_action_832 as a 
	LEFT OUTER JOIN 
		client_db_approach_target_832 as client_db_approach_target_832 
	ON 
		a.approach_target_id = client_db_approach_target_832.id 
	WHERE 
		( ( approach_list_id = 1) ) AND 
		approach_type = 0 AND 
		template_approach_result_id = 0 AND 
		again_flg = 0 AND 
		approach_result_id = 0 AND 
		a.type = 3 AND 
		client_db_approach_target_832.del_flg = 0 
	";
	$row = $db->fetchRow($sql, array());
	return $row["count"];
}

/**
 * カラム追加処理
 * @return unknown
 */
function alterAddRelationId($db, $tableName){
	
	// カラムを追加
	$sql = "ALTER TABLE {$tableName} ADD `relation_id` varchar (32) NOT NULL COMMENT '企業と個人情報紐付けID' AFTER id;";
	$db->query($sql);
	// INDEXを追加
	$sql = "CREATE INDEX idx_relation_id ON {$tableName}(relation_id);";
	$db->query($sql);
	
	return;
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
 * 追加したカラムにデータを登録する
 * @return unknown
 */
function updateRelationId($db, $tableName){
	$sql = "
			UPDATE
				{$tableName} as a,
				(
					SELECT 
						id,
						actiontime,
						path,
						SUBSTRING_INDEX(path, '.', 1) as relation_id 
					FROM
						{$tableName}
				) as b 
			SET 
				a.relation_id = b.relation_id
			WHERE
				a.path = b.path AND 
				a.id = b.id AND 
				a.actiontime = b.actiontime;
			";
	$db->query($sql);
	return;
}

/**
 * tree_action_clientdbテーブルを作成する
 * @param unknown $db
 * @param unknown $tableName
 */
function createTreeAction($db, $tableName){
	$sql = "
		CREATE TABLE `{$tableName}`(
			`id` char (32) NOT NULL,
			`relation_id` varchar (32) NOT NULL COMMENT '企業と個人情報紐付けID', 
			`type` int (4) NOT NULL COMMENT '1:マスターDBの企業・個人・その他情報',
			`name` varchar (200) NOT NULL,
			`actiontime` datetime NOT NULL,
			`comment` varchar (200) DEFAULT NULL COMMENT '説明',
			`path` varchar (200) DEFAULT NULL COMMENT 'IDの編集 ID1.ID2.ID3',
			 KEY `idx` (`path`)
		) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COMMENT='アクション結果のTreeで記録する' ;
		CREATE INDEX id ON {$tableName}(id);
		CREATE INDEX idx_relation_id ON {$tableName}(relation_id);
	";
	$db->query($sql);
}

function dropRelationId($db, $tableName){
	$sql = "DESCRIBE {$tableName} relation_id;";
	$row = $db->fetchRow($sql, array());
	if($row){
		$sql = "ALTER TABLE {$tableName} DROP relation_id;";
		$db->query($sql);
	}
}

function getCurrentDbObject(){
	$config  = new Zend_Config_Ini(APP_DIR . 'configs/system.ini', SERVICE_MODE);
	$dsn  = "mysql:dbname=tel-marketing_tmo_20160923;host=localhost;";
	$user = "root";
	$password = "90kon6Fmysql";
	$currentDb = new PDO($dsn, $user, $password, array(
			PDO::ATTR_PERSISTENT => true,
			PDO::MYSQL_ATTR_LOCAL_INFILE => true,
			PDO::MYSQL_ATTR_INIT_COMMAND => 'SET @key:="' . $config->datasource->key . '";',
	));
	return $currentDb;
}