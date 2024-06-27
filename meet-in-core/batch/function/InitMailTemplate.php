<?php
/**
 * クライアント作成時に作成されるメール関連のデフォルト値を設定する
 * @var unknown_type
 */
try{
	debugMeg("InitMailTemplate_begin");
	
	// DAO読み込み時のエラー回避のため、空のarrayをセットする
	Zend_Registry::set('user', array());
	
	// DAOを宣言
	$db = Zend_Db_Table_Abstract::getDefaultAdapter();
	$templateApproachResultDao = Application_CommonUtil::getInstance("dao", "TemplateApproachResultDao", $db);
	$templateApproachTabDao = Application_CommonUtil::getInstance("dao", "TemplateApproachTabDao", $db);
	$tabAndResultRelationDao = Application_CommonUtil::getInstance('dao', "TabAndResultRelationDao", $db);
	
	$templateApproachMailDmList = array(
			array("id"=>"0", "name"=>"未配信", "tab_bg_color"=>"fdeff2"),
			array("id"=>"1", "name"=>"送信エラー（宛先アドレスなし）", "tab_bg_color"=>"A1BB94"),
			array("id"=>"2", "name"=>"送信エラー（その他のエラー）", "tab_bg_color"=>"A1BB94"),
			array("id"=>"3", "name"=>"配信済み", "tab_bg_color"=>"eaedf7"),
			array("id"=>"4", "name"=>"開封", "tab_bg_color"=>"BC9EB2"),
			array("id"=>"5", "name"=>"リンク押下", "tab_bg_color"=>"BC9EB2"),
	);
	// アプローチ結果とタブに必要な固定値を設定
	$templateApproachResultAndTabDict = array(
			'approach_type'		=> "2",
			'tab_text_color'	=> "ffffff",
			'view_flg'			=> "1",
			'update_staff_type'	=> "AA",
			'update_staff_id'	=> "1",
			'del_flg'			=> "0",
			'create_date'		=> new Zend_Db_Expr('now()'),
			'update_date'		=> new Zend_Db_Expr('now()')
	);
	// アプローチ結果とタブの紐付けに必要な固定値を設定
	$tabAndResultRelationDict = array(
			'staff_type'	=> "AA",
			'staff_id'		=> "1"
	);
	
	// トランザクションスタート
	$db->beginTransaction();
	try{
		// 現在のテンプレートを全て削除する
		deleteTemplateApproachMail($db);
		
		// クライアントのDB情報を書き換える処理
		// 全クライアントを取得し、テーブルにカラムを追加する
		$clientList = getClientList($db);
		foreach($clientList as $client){
			// メールDM結果とタブの設定
			foreach($templateApproachMailDmList as $templateApproachMailDm){
				// アプローチ結果とタブで動的に変更する値を設定
				$templateApproachResultAndTabDict["client_id"] = $client["client_id"];
				$templateApproachResultAndTabDict["id"] = $templateApproachMailDm["id"];
				$templateApproachResultAndTabDict["name"] = $templateApproachMailDm["name"];
				$templateApproachResultAndTabDict["tab_bg_color"] = $templateApproachMailDm["tab_bg_color"];
				// アプローチ結果の登録
				$templateApproachResultId = $templateApproachResultDao->insertMailResult($templateApproachResultAndTabDict);
				// タブ設定にIDは不必要なので削除する
				unset($templateApproachResultAndTabDict["id"]);
				// アプローチタブの登録
				$templateApproachTabId = $templateApproachTabDao->regist($templateApproachResultAndTabDict);
				// アプローチ結果とタブの動的に変更する値を設定
				$tabAndResultRelationDict["client_id"] = $client["client_id"];
				$tabAndResultRelationDict["approach_type"] = "2";
				$tabAndResultRelationDict["approach_tab_id"] = $templateApproachTabId;
				$tabAndResultRelationDict["approach_result_id"] = $templateApproachResultId;
				// アプローチタブと結果連携データの登録
				$tabAndResultRelationDao->regist($tabAndResultRelationDict);
			}
		}
		// 登録完了したらコミットする
		$db->commit();
	}catch(Exception $e){
		$db->rollBack();
		throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
	}
		
	debugMeg("InitMailTemplate_end");
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
function deleteTemplateApproachMail($db){
	// アプローチ結果の削除
	$sql = "DELETE FROM template_approach_result WHERE approach_type = 2;";
	$db->query($sql);
	// アプローチタブの削除
	$sql = "DELETE FROM template_approach_tab WHERE approach_type = 2;";
	$db->query($sql);
	// アプローチ結果とタブの紐付け
	$sql = "DELETE FROM tab_and_result_relation WHERE approach_type = 2;";
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
