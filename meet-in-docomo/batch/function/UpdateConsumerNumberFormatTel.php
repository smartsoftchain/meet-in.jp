<?php
/**
 * コンシューマーの電話番号を数値のみに変換する
 * @var unknown_type
 */
try{
	debugMeg("UpdateConsumerNumberFormatTel_begin");
	// バッチに関するDAOをまとめたモデル
	$manager = getInstance('Manager','BatchCommon');
	
	// 作業終了後にデータチェックを行うIDを保持する
	$ids = array();
	// consumer_number_format_telが未設定のデータを取得する
	$consumerList = $manager->getConsumerByNotFormatTel();
	debugMeg("[consumer count:".count($consumerList)."]");
	foreach($consumerList as $consumer){
		if($consumer['consumer_tel'] != ""){
			$formatTel = mb_ereg_replace('[^0-9]', '', $consumer['consumer_tel']);
			debugMeg("[consumer_id:".$consumer["consumer_id"]."]");
			debugMeg("[consumer_tel:".$consumer['consumer_tel']."]");
			debugMeg("[format_tel:".$formatTel."]");
			$manager->updateConsumerFormatTel($consumer["consumer_id"], $formatTel );
			$ids[] = $consumer["consumer_id"];
		}
	}
	
	debugMeg(join(",", $ids));
	
	debugMeg("UpdateConsumerNumberFormatTel_end");
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