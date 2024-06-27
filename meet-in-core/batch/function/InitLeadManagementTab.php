<?php
/**
 * リード管理のデフォルト値を設定する
 * @var unknown_type
 */
try{
	debugMeg("InitLeadManagementTab_begin");
	
	// DAO読み込み時のエラー回避のため、空のarrayをセットする
	Zend_Registry::set('user', array());
	
	// DAOを宣言
	$db = Zend_Db_Table_Abstract::getDefaultAdapter();
	$templateApproachResultDao = Application_CommonUtil::getInstance("dao", "TemplateApproachResultDao", $db);
	$templateApproachTabDao = Application_CommonUtil::getInstance("dao", "TemplateApproachTabDao", $db);
	$tabAndResultRelationDao = Application_CommonUtil::getInstance('dao', "TabAndResultRelationDao", $db);
	$leadTabAndResultRelationDao = Application_CommonUtil::getInstance("dao", "LeadTabAndResultRelationDao", $db);
	
	
	// アプローチ結果とタブに必要な固定値を設定
	$templateApproachResultAndTabLit = array();
	$templateApproachResultAndTabLit[] = array(
			'approach_type'		=> "4",
			'name'				=> "資料請求全件",
			'tab_bg_color'		=> "A1BB94",
			'tab_text_color'	=> "ffffff",
			'view_flg'			=> "1",
			'update_staff_type'	=> "AA",
			'update_staff_id'	=> "1",
			'del_flg'			=> "0",
			'create_date'		=> new Zend_Db_Expr('now()'),
			'update_date'		=> new Zend_Db_Expr('now()')
	);
	$templateApproachResultAndTabLit[] = array(
			'approach_type'		=> "4",
			'name'				=> "受付資料請求",
			'tab_bg_color'		=> "A1BB94",
			'tab_text_color'	=> "ffffff",
			'view_flg'			=> "1",
			'update_staff_type'	=> "AA",
			'update_staff_id'	=> "1",
			'del_flg'			=> "0",
			'create_date'		=> new Zend_Db_Expr('now()'),
			'update_date'		=> new Zend_Db_Expr('now()')
	);
	$templateApproachResultAndTabLit[] = array(
			'approach_type'		=> "4",
			'name'				=> "本人資料請求",
			'tab_bg_color'		=> "A1BB94",
			'tab_text_color'	=> "ffffff",
			'view_flg'			=> "1",
			'update_staff_type'	=> "AA",
			'update_staff_id'	=> "1",
			'del_flg'			=> "0",
			'create_date'		=> new Zend_Db_Expr('now()'),
			'update_date'		=> new Zend_Db_Expr('now()')
	);
	$templateApproachResultAndTabLit[] = array(
			'approach_type'		=> "4",
			'name'				=> "アポイント",
			'tab_bg_color'		=> "BC9EB2",
			'tab_text_color'	=> "ffffff",
			'view_flg'			=> "1",
			'update_staff_type'	=> "AA",
			'update_staff_id'	=> "1",
			'del_flg'			=> "0",
			'create_date'		=> new Zend_Db_Expr('now()'),
			'update_date'		=> new Zend_Db_Expr('now()')
	);
	// アプローチ結果とタブの紐付けに必要な固定値を設定
	$leadtabAndResultRelationList = array();
	$leadtabAndResultRelationList[] = array(
			'approach_type'			=> "1",
			'approach_tab_id'		=> "1",
			'approach_result_id'	=> "2",
			'staff_type'			=> "AA",
			'staff_id'				=> "1",
			'create_date'			=> new Zend_Db_Expr('now()'),
	);
	$leadtabAndResultRelationList[] = array(
			'approach_type'			=> "1",
			'approach_tab_id'		=> "1",
			'approach_result_id'	=> "5",
			'staff_type'			=> "AA",
			'staff_id'				=> "1",
			'create_date'			=> new Zend_Db_Expr('now()'),
	);
	$leadtabAndResultRelationList[] = array(
			'approach_type'			=> "1",
			'approach_tab_id'		=> "2",
			'approach_result_id'	=> "2",
			'staff_type'			=> "AA",
			'staff_id'				=> "1",
			'create_date'			=> new Zend_Db_Expr('now()'),
	);
	$leadtabAndResultRelationList[] = array(
			'approach_type'			=> "1",
			'approach_tab_id'		=> "3",
			'approach_result_id'	=> "5",
			'staff_type'			=> "AA",
			'staff_id'				=> "1",
			'create_date'			=> new Zend_Db_Expr('now()'),
	);
	$leadtabAndResultRelationList[] = array(
			'approach_type'			=> "1",
			'approach_tab_id'		=> "4",
			'approach_result_id'	=> "6",
			'staff_type'			=> "AA",
			'staff_id'				=> "1",
			'create_date'			=> new Zend_Db_Expr('now()'),
	);
	
	// トランザクションスタート
	$db->beginTransaction();
	try{
		// 現在のテンプレートを全て削除する(タブ情報と紐づき情報)
		deleteTemplateLeadManagementTab($db);
		
		// 全クライアントを取得し、デフォルト値を追加する
		$clientList = getClientList($db);
		foreach($clientList as $client){
			// タブの設定
			foreach($templateApproachResultAndTabLit as &$templateApproachResultAndTab){
				// アプローチ結果とタブで動的に変更する値を設定
				$templateApproachResultAndTab["client_id"] = $client["client_id"];
				// アプローチタブの登録
				$templateApproachTabId = $templateApproachTabDao->regist($templateApproachResultAndTab);
			}
			// リード管理用アプローチタブとアプローチ結果の紐付け
			foreach($leadtabAndResultRelationList as &$leadtabAndResultRelation){
				$leadtabAndResultRelation["client_id"] = $client["client_id"];
				// アプローチタブと結果連携データの登録
				$leadTabAndResultRelationDao->regist($leadtabAndResultRelation);
			}
		}
		// 登録完了したらコミットする
		$db->commit();
	}catch(Exception $e){
		$db->rollBack();
		throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
	}
		
	debugMeg("InitLeadManagementTab_end");
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
 * 現在作成されるメールテンプレートを全て削除する
 */
function deleteTemplateLeadManagementTab($db){
	// アプローチタブの削除
	$sql = "DELETE FROM template_approach_tab WHERE approach_type = 4;";
	$db->query($sql);
	// アプローチ結果とタブの紐付け
	$sql = "DELETE FROM leadtab_and_result_relation;";
	$db->query($sql);
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
