<?php
/**
 * 現在日付より30日間経過したチャットメッセージを削除する
 * @var unknown_type
 */
try {
	
	debugMeg("DeleteOldChatMessage_Begin");
	
	// DAO読み込み時のエラー回避のため、空のarrayをセットする
	Zend_Registry::set('user', array());
	
	// DAOを宣言
	$db = Zend_Db_Table_Abstract::getDefaultAdapter();
	$chatMessageDao        = Application_CommonUtil::getInstance("dao", "ChatMessageDao", $db);
	$chatMessageArchiveDao = Application_CommonUtil::getInstance("dao", "ChatMessageArchiveDao", $db);
	
	// トランザクションスタート
	$db->beginTransaction();
	
	try{
		
		// 現在日付より30日間経過したチャットメッセージを取得し、そのままINSERT
		$chatMessageArchiveDao->insertChatMessageArchiveBySelect();

		debugMeg("1) : Successed Copy(Select Insert) ChatMessage List");
		
		// 現在日付より30日間経過したチャットメッセージを削除する
		$chatMessageDao->deleteOneMonthElapsedChatMessage();
		
		debugMeg("2) : Successed Delete ChatMessage List");
		
		$db->commit();
		
	} catch(Exception $e) {
		
		$db->rollBack();
		throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
	}
		
	debugMeg("DeleteOldChatMessage_End");
	
} catch (Exception $err) {
	debugMeg("想定外の例外：".$err->getMessage());
}

/**
 * デバッグメッセージ
 * @param unknown $actionName	処理名
 */
function debugMeg($actionName){
	error_log($actionName.":".date("Y-m-d H:i:s"));
}