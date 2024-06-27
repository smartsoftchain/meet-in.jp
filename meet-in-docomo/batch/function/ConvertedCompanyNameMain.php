<?php
/**
 * master_db_companyテーブルに登録されている会社名を法人格有り且つカナ・英数・ローマ字を変換した名称に変換し登録する処理を起動する
 * PHPは同リスクエスト内ではメモリーを解放しないので、処理速度を落とさないために細かいリクエストにする
 * @var unknown_type
 */
try{
	debugMeg("ConvertedCompanyNameMain_begin");
	
	// 環境によりスキーマ名が違うので設定する
	$dbName = "tel-marketing_tmo";
	//$dbName = "tel-marketing_tmo_20150929";
	
// 	$tableNames = array("master_db_company", "master_db_company_history", "master_db_tmp_company", "client_db_tmp_company");
	
// 	foreach($tableNames as $tableName){
// 		debugMeg("[tableName][{$tableName}]");
// 		// 総件数を取得する
// 		debugMeg("getMasterDbCompanyCount_begin");
// 		$masterDbCompanyCount = getMasterDbCompanyCount($dbName, $tableName);
// 		debugMeg("getMasterDbCompanyCount_end");
		
// 		// 分割実行する値を設定しmaster_db_companyの変換処理を実行する
// 		$getCount = 0;
// 		$offset = 1;
// 		$limit = 50000;
// 		while($getCount < $masterDbCompanyCount){
// 			debugMeg("[count:{$getCount}] Processing Begin");
// 			// データを取得しファイルに書き出す処理を実行する
// 			$cmd = "php ./function/ConvertedCompanyNameProcessing.php '{$dbName}' '{$tableName}' '{$offset}' '{$limit}'";
// 			exec($cmd, $arr, $res);
// 			debugMeg("[count:{$getCount}] Processing End");
// 			$getCount = $offset * $limit;
// 			$offset++;
// 		}
// 	}
	
	// クライアントのDB情報を書き換える処理
	$tableNames = array("client_db_company", "client_db_company_history");
	// 全クライアントを取得し、テーブルにカラムを追加する
	$clientList = getClientList($dbName);
	foreach($clientList as $client){
		alterAddConvertedCompanyName($dbName, $client["client_id"]);
		foreach($tableNames as $tableName){
			if($client["client_id"] >= 3){
				$clientTableName = $tableName."_{$client["client_id"]}";
				debugMeg("[tableName][{$clientTableName}]");
				// 総件数を取得する
				debugMeg("getMasterDbCompanyCount_begin");
				$clientDbCompanyCount = getMasterDbCompanyCount($dbName, $clientTableName);
				debugMeg("getMasterDbCompanyCount_end");
			
				// 分割実行する値を設定しmaster_db_companyの変換処理を実行する
				$getCount = 0;
				$offset = 1;
				$limit = 50000;
				while($getCount < $clientDbCompanyCount){
					debugMeg("[count:{$getCount}] Processing Begin");
					// データを取得しファイルに書き出す処理を実行する
					$cmd = "php ./function/ConvertedCompanyNameProcessing.php '{$dbName}' '{$clientTableName}' '{$offset}' '{$limit}'";
					exec($cmd, $arr, $res);
					debugMeg("[count:{$getCount}] Processing End");
					$getCount = $offset * $limit;
					$offset++;
				}
			}
		}
	}
	debugMeg("ConvertedCompanyNameMain_end");
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
 * 件数を取得
 * @return unknown
 */
function getMasterDbCompanyCount($dbName, $tableName){
	// DBのインスタンス作成
	$dsn  = "mysql:dbname={$dbName};host=localhost;";
	$user = "root";
	$password = "90kon6Fmysql";
	$db = new PDO($dsn, $user, $password);
	
	$sql = "
			SELECT
				count(relation_id) as count
			FROM
				{$tableName};
	";
	$stm = $db->query($sql);
	$row = $stm->fetch();
	return $row["count"];
}

/**
 * 全クライアントデータを取得する
 */
function getClientList($dbName) {
	// DBのインスタンス作成
	$dsn  = "mysql:dbname={$dbName};host=localhost;";
	$user = "root";
	$password = "90kon6Fmysql";
	$db = new PDO($dsn, $user, $password);

	$sql = "
		SELECT
			client_id 
		FROM
			master_client 
		ORDER BY
			client_id asc;
	";
	$stm = $db->query($sql);
	$list = $stm->fetchAll();
	return $list;
}

/**
 * カラム追加処理
 * @return unknown
 */
function alterAddConvertedCompanyName($dbName, $clientId){
	// DBのインスタンス作成
	$dsn  = "mysql:dbname={$dbName};host=localhost;";
	$user = "root";
	$password = "90kon6Fmysql";
	$db = new PDO($dsn, $user, $password);
	
	$tableName = "client_db_company_{$clientId}";
	$sql = "ALTER TABLE {$tableName} ADD converted_company_name varchar(100) NOT NULL COMMENT '法人格有り且つカナ・英数・ローマ字を変換した名称(システムで変換して登録)' AFTER name;";
	$db->query($sql);
	
	$tableName = "client_db_company_history_{$clientId}";
	$sql = "ALTER TABLE {$tableName} ADD converted_company_name varchar(100) NOT NULL COMMENT '法人格有り且つカナ・英数・ローマ字を変換した名称(システムで変換して登録)' AFTER name;";
	$db->query($sql);
	return;
}
