<?php
/**
 * 架電ステータス追加に伴う初期設定
 * @var unknown_type
 */
try{
	debugMeg("AddStatus_begin");
	// バッチに関するDAOをまとめたモデル
	$manager = getInstance('Manager','BatchCommon');
	
	// ステータスの追加
	debugMeg("addStatus_begin");
	$manager->addStatus();
	debugMeg("addStatus_begin");
	
	// paramテーブルにカラムを追加し、初期値を設定する
	debugMeg("addStatus_begin");
	$manager->alterParamTable();
	debugMeg("addStatus_begin");
	
	// テンプレートの初期値を設定する
	debugMeg("addStatus_begin");
	$manager->initTemplate();
	debugMeg("addStatus_begin");
	
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