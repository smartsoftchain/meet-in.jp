<?php
/**
 * ウェビナーで使い回し用のバッチ
 * 後でカラム追加になった際に使用する
 * @var unknown_type
 */
try{
	debugMeg("UpdateWebinar begin");

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
		// ユニークキーを保持していない参加者情報を取得
		$sql = "
			SELECT 
				* 
			FROM 
				webinar_participant 
			WHERE
				participant_key IS NULL;
		";
		$webinarParticipantList = $db->fetchAll($sql);
		foreach($webinarParticipantList as $webinarParticipant){
			$participantKey = md5("{$webinarParticipant["webinar_id"]}_{$webinarParticipant["id"]}_{$webinarParticipant["client_id"]}" . date("Y-m-d H:i:s"));
			debugMeg("[webinar_id:{$webinarParticipant["webinar_id"]}][id:{$webinarParticipant["id"]}][client_id:{$webinarParticipant["client_id"]}][participantKey:{$participantKey}]");
			$sql = "
				UPDATE
					webinar_participant
				SET
					participant_key = '{$participantKey}'
				WHERE
					webinar_id = {$webinarParticipant['webinar_id']} AND 
					id = {$webinarParticipant['id']} AND 
					client_id = {$webinarParticipant['client_id']};
			";
			$db->query($sql);
		}
		$db->commit();
	}catch(Exception $e){
		$db->rollback();
		debugMeg($e->getMessage());
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
