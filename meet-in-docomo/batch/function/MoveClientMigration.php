<?php
require_once 'CommonMigration.php';		// DBの接続や共通関数をまとめたファイル
/**
 * sales-crowdに既に登録されているクライアントを現行クライアントの後に追加する
 * @var unknown_type
 */
try{
	debugMeg("MoveClientMigration_begin");
	
	// DAO読み込み時のエラー回避のため、空のarrayをセットする
	Zend_Registry::set('user', array());
	
	// 現行TMOのDBオブジェクトを宣言
	$currentDb = getCurrentDbObject();
	
	// 新TMOのDBオブジェクトを宣言
	$newDb = getNewDbObject();
	
	// 現行のクライアントIDの最大値を取得する
	$currentLastClientId = getCurrentLastClientId($currentDb);
	// 新クライアントのカウントを取得する
	$newClientCount = getNewClientCount($newDb);
	// 現在登録中のクライアントをIDの降順で取得する
	$newClientList = getNewClientList($newDb);
	
	debugMeg("currentLastClientId:{$currentLastClientId}");
	debugMeg("newClientCount:{$newClientCount}");
	
	// トランザクションスタート
	$newDb->beginTransaction();
	try{
		foreach($newClientList as $newClient){
			// 振り直すIDを計算する
			$newClientId = $currentLastClientId + $newClientCount;
			debugMeg("newClientId:{$newClientId}");
			
			// クライアントIDの存在するテーブルのデータを更新する
			updateClientId($newClient["client_id"], $newClientId, $newDb);
			
			// テーブル名にクライアントIDが存在するテーブルを更新する
			alterTableName($newClient["client_id"], $newClientId, $newDb);
			
			// 全ての変換が終わったらクライアントの数を１減らす
			$newClientCount--;
		}
		// 登録完了したらコミットする
		$newDb->commit();
	}catch(Exception $e){
		$newDb->rollBack();
		throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
	}
		
	debugMeg("MoveClientMigration_end");
}
catch (Exception $err){
	debugMeg("想定外の例外：".$err->getMessage());
}


/**
 * 現行クライアントテーブルの最終IDを取得する
 * @param unknown $currentDb
 * @return unknown
 */
function getCurrentLastClientId($currentDb){
	$sql = "SELECT MAX(client_id) as last_client_id FROM client;";
	$stm = $currentDb->query($sql);
	$client = $stm->fetch();
	return $client["last_client_id"];
}

/**
 * 新クライアントの現在の登録数を取得する
 * @param unknown $newDb
 * @return unknown
 */
function getNewClientCount($newDb){
	$sql = "SELECT COUNT(client_id) as count FROM master_client";
	$rtn = $newDb->fetchRow($sql, array());
	return $rtn["count"];
}

/**
 * クライアントIDのリストをIDの降順で取得する
 * @param unknown $newDb
 * @return unknown
 */
function getNewClientList($newDb){
	$sql = "SELECT client_id FROM master_client ORDER BY client_id DESC";
	$rtn = $newDb->fetchAll($sql, array());
	return $rtn;
}

/**
 * クライアントIDを変換する
 * @param unknown $currentClientId
 * @param unknown $newClientId
 */
function updateClientId($currentClientId, $newClientId, $newDb){
	// 変更するデータを設定
	$record["client_id"] = $newClientId;
	// 変更する条件を設定
	$where = "client_id = {$currentClientId}";
	// 以下単純変換処理
	$newDb->update('appoint', $record, $where);
	$newDb->update('approach_list', $record, $where);
	$newDb->update('approach_list_and_staff_relation', $record, $where);
	$newDb->update('approach_list_answer', $record, $where);
	$newDb->update('approach_list_question', $record, $where);
	$newDb->update('bookmark', $record, $where);
	$newDb->update('bookmark_session_params', $record, $where);
	$newDb->update('client_db_relation', $record, $where);
	$newDb->update('client_db_tmp_approach_target', $record, $where);
	$newDb->update('client_db_tmp_company', $record, $where);
	$newDb->update('folder', $record, $where);
	$newDb->update('folder_auth', $record, $where);
	$newDb->update('folder_and_approachlist_relation', $record, $where);
	$newDb->update('forbidden_approach', $record, $where);
	$newDb->update('forbidden_and_approach_target_relation', $record, $where);
	$newDb->update('free_label', $record, $where);
	$newDb->update('leadtab_and_result_relation', $record, $where);
	$newDb->update('logs', $record, $where);
	$newDb->update('mail_notify_setting', $record, $where);
	$newDb->update('mail_template', $record, $where);
	$newDb->update('master_client', $record, $where);
	$newDb->update('master_client_cc', $record, $where);
	$newDb->update('master_client_service', $record, $where);
	$newDb->update('master_client_download_option', $record, $where);
	$newDb->update('master_staff', $record, $where);
	$newDb->update('master_db_download_history', $record, $where);
	$newDb->update('mta_setting', $record, $where);
	$newDb->update('mylist', $record, $where);
	$newDb->update('report_setting', $record, $where);
	$newDb->update('report_setting_relation', $record, $where);
	$newDb->update('result_inquiry', $record, $where);
	$newDb->update('result_telephone', $record, $where);
	$newDb->update('result_question_and_answer', $record, $where);
	$newDb->update('result_mail', $record, $where);
	$newDb->update('script_relation', $record, $where);
	$newDb->update('send', $record, $where);
	$newDb->update('send_mail_task', $record, $where);
	$newDb->update('tab_and_result_relation', $record, $where);
	$newDb->update('talk_bind', $record, $where);
	$newDb->update('template_appoint_situation', $record, $where);
	$newDb->update('template_approach_result', $record, $where);
	$newDb->update('template_approach_tab', $record, $where);
	$newDb->update('template_result_memo', $record, $where);
	$newDb->update('template_send_method', $record, $where);
	$newDb->update('template_send_situation', $record, $where);
	
	// 以下tree変換処理
	$subStrIndex = strlen($currentClientId) + 1;
	$tableName = "tree_action_{$currentClientId}";
	$sql = "UPDATE {$tableName} SET path = CONCAT('{$newClientId}', SUBSTR(path, {$subStrIndex}, LENGTH(path)))";
	$newDb->query($sql);
}

/**
 * テーブル名にクライアントIDが存在するテーブルを更新する
 * @param unknown $currentClientId
 * @param unknown $newClientId
 * @param unknown $newDb
 */
function alterTableName($currentClientId, $newClientId, $newDb){
	// client_db_approach_targetのテーブル名変更
	$currentTableName = "client_db_approach_target_{$currentClientId}";
	$newTableName = "client_db_approach_target_{$newClientId}";
	if(searchTreeTable($newDb, $currentTableName)){
		$sql = "ALTER TABLE {$currentTableName} RENAME TO {$newTableName};";
		$newDb->query($sql);
	}else{
		debugMeg("no table [current:{{$currentTableName}}][new:{$newTableName}]");
	}
	// client_db_approach_target_historyのテーブル名変更
	$currentTableName = "client_db_approach_target_history_{$currentClientId}";
	$newTableName = "client_db_approach_target_history_{$newClientId}";
	if(searchTreeTable($newDb, $currentTableName)){
		$sql = "ALTER TABLE {$currentTableName} RENAME TO {$newTableName};";
		$newDb->query($sql);
	}else{
		debugMeg("no table [current:{{$currentTableName}}][new:{$newTableName}]");
	}
	// client_db_companyのテーブル名変更
	$currentTableName = "client_db_company_{$currentClientId}";
	$newTableName = "client_db_company_{$newClientId}";
	if(searchTreeTable($newDb, $currentTableName)){
		$sql = "ALTER TABLE {$currentTableName} RENAME TO {$newTableName};";
		$newDb->query($sql);
	}else{
		debugMeg("no table [current:{{$currentTableName}}][new:{$newTableName}]");
	}
	// client_db_company_historyのテーブル名変更
	$currentTableName = "client_db_company_history_{$currentClientId}";
	$newTableName = "client_db_company_history_{$newClientId}";
	if(searchTreeTable($newDb, $currentTableName)){
		$sql = "ALTER TABLE {$currentTableName} RENAME TO {$newTableName};";
		$newDb->query($sql);
	}else{
		debugMeg("no table [current:{{$currentTableName}}][new:{$newTableName}]");
	}
	// tree_actionのテーブル名変更
	$currentTableName = "tree_action_{$currentClientId}";
	$newTableName = "tree_action_{$newClientId}";
	if(searchTreeTable($newDb, $currentTableName)){
		$sql = "ALTER TABLE {$currentTableName} RENAME TO {$newTableName};";
		$newDb->query($sql);
	}else{
		debugMeg("no table [current:{{$currentTableName}}][new:{$newTableName}]");
	}
	// tree_action_clientdbのテーブル名変更
	$currentTableName = "tree_action_clientdb_{$currentClientId}";
	$newTableName = "tree_action_clientdb_{$newClientId}";
	if(searchTreeTable($newDb, $currentTableName)){
		$sql = "ALTER TABLE {$currentTableName} RENAME TO {$newTableName};";
		$newDb->query($sql);
	}else{
		debugMeg("no table [current:{{$currentTableName}}][new:{$newTableName}]");
	}
}
