<?php
/**
 * tree_action_clientdbテーブルにカラムを追加し、データを登録する
 * @var unknown_type
 */
try{
	debugMeg("AlterTreeActionClientdb_begin");
	
	// DAO読み込み時のエラー回避のため、空のarrayをセットする
	Zend_Registry::set('user', array());
	
	// DAOを宣言
	$db = Zend_Db_Table_Abstract::getDefaultAdapter();
	
	// トランザクションスタート
	$db->beginTransaction();
	try{
		// クライアントのDB情報を書き換える処理
		// 全クライアントを取得し、テーブルにカラムを追加する
		$clientList = getClientList($db);
		foreach($clientList as $client){
			// テーブル名を生成
			$tableName = "tree_action_clientdb_{$client["client_id"]}";
			// relation_idカラムを削除する TODO テスト用
			//dropRelationId($db, $tableName);
			debugMeg("{$tableName}_begin");
			$result = searchTreeTable($db, $tableName);
			if($result){
				// テーブルが存在する場合はALTERを実行する
				alterAddRelationId($db, $tableName);
				updateRelationId($db, $tableName);
			}else{
				// テーブルが存在すしない場合はテーブルを作成する
				createTreeAction($db, $tableName);
			}
			debugMeg("{$tableName}_end");
		}
		// 登録完了したらコミットする
		$db->commit();
	}catch(Exception $e){
		$db->rollBack();
		throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
	}
	debugMeg("AlterTreeActionClientdb_end");
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