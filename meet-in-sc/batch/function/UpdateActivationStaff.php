<?php
/**
 * アクティベーション情報更新バッチ
 * @var unknown_type
 */
try{
	debugMeg("UpdateActivationStaff_begin");
	
	// DAOを宣言
	$db = Zend_Db_Table_Abstract::getDefaultAdapter();
	
	// トランザクションスタート
	$db->beginTransaction();
	try {
		// 1日経過したアクティベーションレコードを削除する
		deleteExpiredActivationStaff($db);
		$db->commit();
	}catch(Exception $e){
		$db->rollback();
		debugMeg("DB例外：".$e->getMessage());
	}
	debugMeg("UpdateActivationStaff_end");
} catch (Exception $err){
	debugMeg("想定外の例外：".$err->getMessage());
}

/**
 * デバッグメッセージ
 * @param unknown $actionName	処理名
 */
function debugMeg($actionName){
	error_log($actionName.":".date("Y-m-d H:i:s")."\n");
}

/**
 * ログテーブルを再作成する
 */
function deleteExpiredActivationStaff($db){
	$condition = "DATEDIFF(NOW(), `create_date`) > 0";
	$sql = "DELETE FROM activation_staff WHERE {$condition}";
	$db->query($sql);
//	$db->delete('activation_staff', 'DATEDIFF(NOW(), `create_date`) > 0');
}

?>
