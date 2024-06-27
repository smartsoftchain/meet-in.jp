<?php
/**
 * 月初にプランを更新する
 * @var unknown_type
 */
try{
	debugMeg("UpdatePlan begin");

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
	$db = Zend_Db_Table_Abstract::getDefaultAdapter();

	// トランザクションスタート
	$db->beginTransaction();
	try {
		// プラン変更が行われているクライアントのプランを変更する
		$sql = "
			UPDATE
				master_client_new as a,
				master_client_new as b
			SET
				a.plan_this_month = b.plan,
				a.update_date = now()
			WHERE
				a.client_id = b.client_id AND
				a.plan <> a.plan_this_month;
		";
		$db->query($sql);
		$db->commit();
	}catch(Exception $e){
		$db->rollback();
		debugMeg("query error");
	}
	debugMeg("UpdatePlan end");
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
