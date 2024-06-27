<?php
/**
 * クライアント作成時に作成されるメール関連のデフォルト値を設定する
 * @var unknown_type
 */
try{
	debugMeg("InitMailTemplate_begin");
	
	// DAO読み込み時のエラー回避のため、空のarrayをセットする
	Zend_Registry::set('user', array());
	
	
	
	// 全クライアントを取得し、テーブルにカラムを追加する
	$clientStaffList = getClientStaffList();
	foreach($clientStaffList as $clientStaff){
		error_log($clientStaff["seq"]);
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
 * 全クライアントデータを取得する
 */
function getClientStaffList() {
	// DBのインスタンス作成
	$dsn  = "mysql:dbname=tel-marketing_tmo_20150820;host=localhost;";
	$user = "root";
	$password = "90kon6Fmysql";
	$db = new PDO($dsn, $user, $password);
	
	$sql = "
		select 
			client_id, 
			AES_DECRYPT(name,@key) as name 
		FROM 
			client_staff 
		GROUP BY 
			client_id, AES_DECRYPT(name,@key) 
		HAVING 
			count(AES_DECRYPT(name,@key)) > 1;
	";
	$stm = $db->query($sql);
	$list = $stm->fetchAll();
	return $list;
}
