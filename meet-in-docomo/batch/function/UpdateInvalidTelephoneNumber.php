<?php
/**
 * 架電禁止のアポイント取得時、電話番号が登録されていないのでデータを更新する
 * @var unknown_type
 */
try{
	debugMeg("UpdateInvalidtelephoneNumber_begin");
	// バッチに関するDAOをまとめたモデル
	$manager = getInstance('Manager','BatchCommon');
	
	// コンシューマIDが設定されており、電話番号が未設定のデータを取得する
	$invalidTelephoneList = $manager->getApointNoNumber();
	debugMeg("[invalidTelephoneList count:".count($invalidTelephoneList)."]");
	$updateCount = 0;
	foreach($invalidTelephoneList as $invalidTelephone){
		$formatTel = mb_ereg_replace('[^0-9]', '', $invalidTelephone["consumer_tel"]);
		$manager->updateInvalidTelephoneByTel($invalidTelephone["regist_consumer_id"], $invalidTelephone["consumer_tel"], $formatTel);
		$updateCount++;
	}
	
	debugMeg("update count:".$updateCount);
	
	debugMeg("UpdateInvalidtelephoneNumber_end");
}
catch (Exception $err){
	debugMeg("想定外の例外：".$err->getMessage());
}

/**
 * デバッグメッセージ
 * @param unknown $actionName	処理名
 */
function debugMeg($actionName){
	error_log($actionName.":".date("Y-m-d H:i:s")."\n");
}