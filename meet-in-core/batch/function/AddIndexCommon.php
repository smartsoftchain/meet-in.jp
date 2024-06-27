<?php
/**
 * インデックスを追加為の共通バッチ
 * @var unknown_type
 */
try{
	debugMeg("AddIndexCommon_begin");
	
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
			$tableName = "tree_action_{$client["client_id"]}";
			debugMeg($tableName);
			$result = searchTreeTable($db, $tableName);
			if($result){
				$sql = "CREATE INDEX idx_id ON {$tableName}(id);";
				$db->query($sql);
				$sql = "CREATE INDEX idx_type_and_templateid ON {$tableName}(approach_type, template_approach_result_id);";
				$db->query($sql);
				$sql = "CREATE INDEX idx_list_and_type_and_template ON {$tableName}(approach_list_id, approach_type, template_approach_result_id);";
				$db->query($sql);
				
			}else{
				debugMeg("[not client_db_company][client id:{$client["client_id"]}]");
			}
		}
		// 登録完了したらコミットする
		$db->commit();
	}catch(Exception $e){
		$db->rollBack();
		throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
	}
	debugMeg("AddIndexCommon_end");
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

