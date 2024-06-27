<?php
/**
 * 一斉架電用の架電結果を登録
 * @var unknown_type
 */
try{
	debugMeg("AddTemplateApproachResult_begin");
	
	// DAO読み込み時のエラー回避のため、空のarrayをセットする
	Zend_Registry::set('user', array());
	
	// DAOを宣言
	$db = Zend_Db_Table_Abstract::getDefaultAdapter();
	$templateApproachResultDao = Application_CommonUtil::getInstance("dao", "TemplateApproachResultDao", $db);
	$templateApproachTabDao = Application_CommonUtil::getInstance("dao", "TemplateApproachTabDao", $db);
	$tabAndResultRelationDao = Application_CommonUtil::getInstance('dao', "TabAndResultRelationDao", $db);
	
	// アプローチ結果とタブに必要な固定値を設定
	$templateApproachTabDict = array(
			'approach_type'		=> "1",
			'name'				=> "一斉発信済",
			'tab_bg_color'		=> "A1BB94",
			'tab_text_color'	=> "ffffff",
			'view_flg'			=> "1",
			'update_staff_type'	=> "AA",
			'update_staff_id'	=> "1",
			'del_flg'			=> "0"
	);
	
	// アプローチ結果とタブの紐付けに必要な固定値を設定
	$tabAndResultRelationDict = array(
			'approach_type'			=> "1",
			'approach_result_id'	=> "10",
			'staff_type'			=> "AA",
			'staff_id'				=> "1"
	);
	
	// トランザクションスタート
	$db->beginTransaction();
	try{
		// クライアントのDB情報を書き換える処理
		// 全クライアントを取得し、テーブルにカラムを追加する
		$clientList = getClientList($db);
		foreach($clientList as $client){
			// 既にID10の架電結果が存在するかチェックする
			$templateApproach = getTemplateApproachTelResultId10($db, $client["client_id"]);
			if($templateApproach){
				// 架電結果更新処理
				$sql = "UPDATE template_approach_result SET name = '一斉発信済', view_flg = '1', update_staff_type = 'AA', update_staff_id = '1', del_flg = '0' WHERE client_id = {$client["client_id"]} AND approach_type = 1 AND id = 10; ";
				$db->query($sql);
			}else{
				// 架電結果新規登録
				$sql = "INSERT INTO template_approach_result (client_id, approach_type, id, name, view_flg, update_staff_type, update_staff_id, del_flg, create_date, update_date) VALUES ('{$client["client_id"]}', 1, 10, '一斉発信済', 1, 'AA', 1, 0, now(), now());";
				$db->query($sql);
			}
			// タブの新規登録
			$templateApproachTabDict["client_id"] = $client["client_id"];
			$templateApproachTabId = $templateApproachTabDao->regist($templateApproachTabDict);
			// 架電結果とタブの紐付け
			$tabAndResultRelationDict["client_id"] = $client["client_id"];
			$tabAndResultRelationDict["approach_tab_id"] = $templateApproachTabId;
			$tabAndResultRelationDao->regist($tabAndResultRelationDict);
		}
		// 登録完了したらコミットする
		$db->commit();
	}catch(Exception $e){
		$db->rollBack();
		throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
	}
		
	debugMeg("AddTemplateApproachResult_end");
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
 * 架電結果のID10が一斉架電用のIDになるので、存在確認
 */
function getTemplateApproachTelResultId10($db, $clientId){
	$sql = "
		SELECT
			id 
		FROM
			template_approach_result 
		WHERE 
			client_id = {$clientId} AND 
			approach_type = 1 AND 
			id = 10;
	";
	$stm = $db->query($sql);
	$row = $stm->fetchAll();
	return $row;
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
		WHERE 
			client_id >= 605
		ORDER BY 
			client_id asc;
	";
	$stm = $db->query($sql);
	$list = $stm->fetchAll();
	return $list;
}
