<?php
/**
 * master_db_companyテーブルに登録されている会社名を変換し登録する実処理
 * @var unknown_type
 */
try{
	debugMeg("ConvertedCompanyNameProcessing_begin");
	
	// コマンドライン引数を受け取る
	$dbname = $argv[1];
	$tableName = $argv[2];
	$offset = $argv[3];
	$limit = $argv[4];
	
	// DBのインスタンス作成
	$dsn  = "mysql:dbname={$dbName};host=localhost;";
	$user = "root";
	$password = "90kon6Fmysql";
	$db = new PDO($dsn, $user, $password);
	
	$column = "";
	if(preg_match('/^master_db_company_history$/', $tableName)){
		$column = "master_db_company_id, id, name ";
	}else if(preg_match('/^client_db_company_history_.*$/', $tableName)){
		$column = "client_db_company_id, id, name ";
	}else if(preg_match('/^master_db_tmp_company$/', $tableName) || preg_match('/^client_db_tmp_company/', $tableName)){
		$column = "relation_id, name ";
	}else if(preg_match('/^master_db_company$/', $tableName) || preg_match('/^client_db_company_.*$/', $tableName)){
		$column = "id, name ";
	} 
	$getCount = $offset * $limit;
	// UPDATE文を全て実行するとメモリーが足りないので、ファイルに書き出す
	$filePath = "/var/www/html/batch/function/work/{$tableName}_{$getCount}.sql";
	// ファイルの存在確認
	if( !file_exists($filePath) ){
		// ファイル作成
		touch( $filePath );
	}
	$fp = fopen($filePath, 'a');
	$sql = "";
	$delIds = array();
	$masterDbCompanyList = getMasterDbCompany($dbname, $tableName, $column, $offset, $limit);
	foreach($masterDbCompanyList as $masterDbCompany){
		$convertedCompanyName = convertCommonString($db, $masterDbCompany["name"]);
		if(preg_match('/^master_db_company_history$/', $tableName)){
			$sql = "UPDATE {$tableName} SET converted_company_name = '{$convertedCompanyName}' WHERE master_db_company_id = {$masterDbCompany["master_db_company_id"]} AND id = {$masterDbCompany["id"]};";
		}else if(preg_match('/^client_db_company_history_.*$/', $tableName)){
			$sql = "UPDATE {$tableName} SET converted_company_name = '{$convertedCompanyName}' WHERE client_db_company_id = {$masterDbCompany["client_db_company_id"]} AND id = {$masterDbCompany["id"]};";
		}else if(preg_match('/^master_db_tmp_company$/', $tableName) || preg_match('/^client_db_tmp_company/', $tableName)){
			$sql = "UPDATE {$tableName} SET converted_company_name = '{$convertedCompanyName}' WHERE relation_id = '{$masterDbCompany["relation_id"]}';";
		}else if(preg_match('/^master_db_company$/', $tableName) || preg_match('/^client_db_company_.*$/', $tableName)){
			$sql = "UPDATE {$tableName} SET converted_company_name = '{$convertedCompanyName}' WHERE id = {$masterDbCompany["id"]};";
		} 
		fwrite($fp, $sql);
	}
	fwrite($fp, "commit;");
	fclose($fp);
	
	// ファイルに貯めたUPDATE文を実行する
	$cmd = "mysql -u {$user} -p{$password} {$dbname} < {$filePath}";
	exec($cmd, $output, $return);
	if($return == 1){
		error_log("失敗");
	}else{
		error_log("成功");
		// ファイルを削除する
		$cmd = "rm -f {$filePath}";
	}
	exec($cmd, $output, $return);
	debugMeg("ConvertedCompanyNameProcessing_end");
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
 * limit分だけデータを取得する
 */
function getMasterDbCompany($dbName, $tableName, $column, $page, $limit) {
	// DBのインスタンス作成
	$dsn  = "mysql:dbname={$dbName};host=localhost;";
	$user = "root";
	$password = "90kon6Fmysql";
	$db = new PDO($dsn, $user, $password);
	
	$offset = 0;
	$page = $page - 1;
	if($page > 0){
		$offset = $page * $limit;
	}
	$sql = "
			SELECT
				{$column} 
			FROM
				{$tableName} 
			ORDER BY
				create_date asc 
			LIMIT {$limit} 
			OFFSET {$offset};
	";
	$stm = $db->query($sql);
	$list = $stm->fetchAll();
	return $list;
}

/**
 * 文字列を変換する
 * スペースを全て削除
 * 「半角カタカナ」を「全角カタカナ」に変換
 * 「全角」英数字を「半角」
 * 大文字アルファベットを小文字アルファベットに変換
 * @param unknown $str
 * @return unknown
 */
function convertCommonString(&$db, $str){
	// スペースを削除する
	$str = preg_replace("/( |　)/", "", $str);
	// 「半角カタカナ」を「全角カタカナ」に変換し、「全角」英数字を「半角」に変換
	$str = mb_convert_kana($str, "KVa");
	// 大文字アルファベットを小文字アルファベットに変換
	$str = strtolower($str);
	
	$str = $db->quote($str);
	// 変換するとシングルクウォートで挟まれるので、削除する
	$str = ltrim($str, "'");
	$str = rtrim($str, "'");
	
	return $str;
}

