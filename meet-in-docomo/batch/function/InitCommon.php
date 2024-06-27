<?php
/**
 * 定時で実行する初期化処理の共通ファイル
 * @var unknown_type
 */
try{
	debugMeg("InitCommon begin");
	
	// ゲストが登録した背景画像フォルダを初期化するための処理
	exec('rm ../public/img/bodypix/guest/* -f');

	debugMeg("InitCommon end");
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
