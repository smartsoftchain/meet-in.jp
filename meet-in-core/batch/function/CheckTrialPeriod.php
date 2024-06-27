<?php
/**
 * トライアル期間を超えたユーザーはログイン出来ないようにする
 * @var unknown_type
 */
try{
	debugMeg("CheckTrialPeriod begin");

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
		// ７日間を超えたトライアルユーザーはログインフラグを落とす
		$sql = "
			UPDATE
				master_staff_new
			SET
				login_flg = 0
			WHERE
				client_id = {$config->trial->clientId} AND
				DATE_FORMAT(create_date, '%Y-%m-%d') <= DATE_FORMAT(DATE_ADD(NOW(), INTERVAL -8 DAY), '%Y-%m-%d') AND
				login_flg = 1;
		";
		$db->query($sql);
		$db->commit();
	}catch(Exception $e){
		$db->rollback();
		debugMeg("query error");
	}
	debugMeg("CheckTrialPeriod end");
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
