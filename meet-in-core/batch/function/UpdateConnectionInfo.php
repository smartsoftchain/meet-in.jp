<?php
/**
 * 接続情報更新バッチ
 * @var unknown_type
 */

define('CONNECT_NO_VALID_DATE', 30);
define('NEGOTIATION_CONNECTION_LOG_VALID_DATE', 30);

// system.iniの使用するデータを制御する
define('SERVICE_MODE', "development");

// ログ出力のパスとファイル名
define('LOG_OUTPUT_PATH', dirname(__FILE__)."/UpdateConnectionInfo.log");

// データ取得時の取得数の上限
define('MAX_DATA_COUNT', 1000);

// 一時ファイルを格納するフォルダ
define('TMP_PATH', dirname(__FILE__)."/tmp/");

// インポート済みの一時ファイルを格納するフォルダ
define('FINISH_PATH', dirname(__FILE__)."/finish/");

// インポート後に一時ファイルを削除するか（true：削除、false：FINISH_PATHへ移動）
define('CLEAR_TMP', true);

// テーブルのバックアップを取るか
define('BACKUP_FLAG', true);

// ログ出力フラグ
define('OUTPUT_LOG', false);

date_default_timezone_set('Asia/Tokyo');
define('APP_DIR', dirname(dirname(dirname(__FILE__))) . '/application/');
require_once 'Zend/Loader/Autoloader.php';
$loader = Zend_Loader_Autoloader::getInstance();
$loader->setFallbackAutoloader(true);

try{
	// バッチの起動日時をログに記録
	outputLog("接続情報更新バッチを起動", true);
	
	// データベース
//	$db = getCurrentDbObject();
	$db = Zend_Db_Table_Abstract::getDefaultAdapter();

	// 不要になった画面キャプチャを削除する
	$totalRemoveDir = deleteScreenCapture($db);
	outputLog("screen_captureから不要な画面キャプチャを削除 = ".$totalRemoveDir, true);

	if (BACKUP_FLAG) {
		// 作業フォルダの作成
		if(!file_exists(TMP_PATH)){
			mkdir(TMP_PATH);
		}
		if(!file_exists(FINISH_PATH)){
			mkdir(FINISH_PATH);
		}
		
		// テーブルをエクスポートする
		$filename = null;
		$filename = exportTable($db, 'connection_info', 'connection_info_history');
	
		if (!empty($filename)) {
			// テーブル_yyyyMMddHHmmss_xxx.sqlをインポートする
			importSqlFile($db, $filename);
		}
		
		// トランザクションスタート
		$db->beginTransaction();
		try{
			$condition = " (DATEDIFF(now(),  created_datetime) > ".NEGOTIATION_CONNECTION_LOG_VALID_DATE.") ";
			
			deleteTableData($db, 'negotiation_connection_log', $condition);
			outputLog("negotiation_connection_logから不要なデータを削除", true);
			$db->commit();
		}catch(Exception $e){
			$db->rollBack();
			outputErrorLog($e, true);
			throw $e;
		}
	} else {
		// トランザクションスタート
		$db->beginTransaction();
		try{
//			$condition = " (connection_state = 5) OR (DATEDIFF(now(),  created_datetime) > ".CONNECT_NO_VALID_DATE.") ";
			$condition = " (connection_state = 5) OR (DATEDIFF(now(),  updated_datetime) > ".CONNECT_NO_VALID_DATE.") ";
		
			deleteTableData($db, 'connection_info', $condition);
			outputLog("connection_infoから不要なデータを削除", true);
			
			$condition = " (DATEDIFF(now(),  created_datetime) > ".NEGOTIATION_CONNECTION_LOG_VALID_DATE.") ";
			
			deleteTableData($db, 'negotiation_connection_log', $condition);
			outputLog("negotiation_connection_logから不要なデータを削除", true);

			$db->commit();
		}catch(Exception $e){
			$db->rollBack();
			outputErrorLog($e, true);
			throw $e;
		}
	}

	// バッチの終了日時をログに記録
	outputLog("接続情報更新バッチを終了", true);
	
	exit;
}
catch (Exception $err){
	echo $err;
	
	// エラーログを出力する
	outputErrorLog($err);
	
	exit;
}

/**
 * 現行データベースの接続オブジェクト
 * @return PDO
 */
/*
function getCurrentDbObject(){
	$config  = new Zend_Config_Ini(APP_DIR . 'configs/system.ini', SERVICE_MODE);
	$dsn  = "mysql:dbname={$config->datasource->params->dbname};host={$config->datasource->params->host};";
	$user = $config->datasource->params->username;
	$password = $config->datasource->params->password;
	$currentDb = new PDO($dsn, $user, $password, array(
			PDO::ATTR_PERSISTENT => true,
			PDO::MYSQL_ATTR_LOCAL_INFILE => true,
			PDO::MYSQL_ATTR_INIT_COMMAND => 'SET @key:="' . $config->datasource->key . '";',
	));
	
	return $currentDb;
}
*/

/**
 * ログ出力の文字列を作成
 * @return ログ出力の文字列
 */
function getLogOutputLine($msg) {
	$dateTime = new DateTime();
	$output = "[".$dateTime->format('Y-m-d H:i:s')."] ".$msg."\n";
	return $output;
}

/**
 * ログ出力
 * @return unknown
 */
function outputLog($msg, $showEcho = false) {
	if ($showEcho) {
		echo $msg."\n";
	}

	if (OUTPUT_LOG) {
		$fp = fopen(LOG_OUTPUT_PATH, "a");
		fwrite($fp, getLogOutputLine($msg));
		fclose($fp);
	}
}

/**
 * エラーをログに出力する
 * @return unknown
 */
function outputErrorLog($msg) {
	echo $msg."\n";

	$fp = fopen(LOG_OUTPUT_PATH, "a");
	fwrite($fp, getLogOutputLine("[ERROR] ".$msg));
	fclose($fp);
}

function remove_directory($dir) {
	$result = false;

	if ($handle = opendir("$dir")) {
		while (false !== ($item = readdir($handle))) {
			if ($item != "." && $item != "..") {
				if (is_dir("$dir/$item")) {
					remove_directory("$dir/$item");
				} else {
					unlink("$dir/$item");
				}
			}
		}
		closedir($handle);
		rmdir($dir);
		$result = true;
	}
	
	return $result;
}

/**
 * 不要になった画面キャプチャを削除
 */
function deleteScreenCapture($db) {
	$total = 0;
	
//	$condition = " (connection_state = 5) OR (DATEDIFF(now(),  created_datetime) > ".CONNECT_NO_VALID_DATE.") ";
	$condition = " (connection_state = 5) OR (DATEDIFF(now(),  updated_datetime) > ".CONNECT_NO_VALID_DATE.") ";
	$list = getTableList($db, 'connection_info', $condition);
	foreach ($list as $row) {
		$dir = "/var/www/html/public/screen_capture/screen_capture_{$row['id']}";
		if (remove_directory($dir)) {
			$total = $total + 1;
		}
	}
	
	return $total;
}

/**
 * テーブルのデータ数を取得
 * @return テーブルのデータ数
 */
function getTableRowCount($db, $tableName, $condition) {
	$sql = "SELECT
				count(*) as count
			FROM 
				{$tableName}
			WHERE 
				{$condition} 
			;
	";
	$result = $db->fetchRow($sql);
	return $result["count"];
	//$stm = $db->query($sql);
	//$result = $stm->fetchAll();
	//return $result[0]["count"];
}

/**
 * テーブルのデータを取得
 * @return テーブルのデータ
 */
function getTableList($db, $tableName, $condition) {
	$sql = "SELECT
				*
			FROM 
				{$tableName}
			WHERE 
				{$condition} 
			;
	";

	$stm = $db->query($sql);
	$result = $stm->fetchAll();
	return $result;
}


/**
 * テーブルのデータを削除
 * @return テーブルのデータ
 */
function deleteTableData($db, $tableName, $condition) {
	$sql = "
			DELETE FROM
				`{$tableName}`
			WHERE
				{$condition}
			;";
	$db->query($sql);
}

/**
 * テーブルのデータを取得・保存する
 * @return unknown
 */
function getAndWriteTableList($db, $tableName, $targetTableName, $condition, $saveFilename) {
	// 対象データ数を調べる
	$total = getTableRowCount($db, $tableName, $condition);

	if ($total > 0) {

		// カウンター
		$counter = 0;
	
		// データを保存する
		if ($fp = fopen($saveFilename, 'w')) {
			$startTime = microtime(TRUE);
			do {
				$canWrite = flock($fp, LOCK_EX);
				// If lock not obtained sleep for 0 - 100 milliseconds, to avoid collision and CPU load
				if(!$canWrite) {
					usleep(round(rand(0, 100)*1000));
				}
			} 
			while ((!$canWrite)and((microtime(TRUE)-$startTime) < 5));
			
			//file was locked so now we can store information
			if ($canWrite) {

				// トランザクションスタート
				$db->beginTransaction();
				try{
					$dateTime = new DateTime();
					$dateTimeString = $dateTime->format('Y-m-d H:i:s');
				
					// テーブルのデータを複数回にわたって取得・保存する（phpのmemory_limitの対策）
					while ($counter < $total) {
						// 検索条件を追加する
						$conditionWithLimit = $condition." LIMIT {$counter}, ".MAX_DATA_COUNT;
						
						// データを取得する
						$list = getTableList($db, $tableName, $conditionWithLimit);
						
						foreach ($list as $rowWork) {
							$str = "INSERT INTO `{$targetTableName}` ";
							$strColumn = " ";
							$strValue = " ";
						
							$countColumn = 0;
							foreach ($rowWork as $key => $value) {
								if (!is_int($key)) {
									if (isset($value)) {
										$valueNew = str_replace(array('\\', "\0", "\n", "\r", "'", '"', "\x1a"), array('\\\\', '\\0', '\\n', '\\r', "\\'", '\\"', '\\Z'), $value);
										
										if ($countColumn < 1) {
											$strColumn = $strColumn."`{$key}`";
											$strValue = $strValue."'{$valueNew}'";
										} else {
											$strColumn = $strColumn.",`{$key}`";
											$strValue = $strValue.",'{$valueNew}'";
										}
										
										$countColumn += 1;
									}
								}
							}
							
							$str = $str."(".$strColumn.") VALUES (".$strValue.");\n";
							
							fwrite($fp, $str);
						}
					
						$counter += MAX_DATA_COUNT;
					}
					
					fwrite($fp, "commit;\n");
			
					flock($fp, LOCK_UN);

					deleteTableData($db, $tableName, $condition);

					$db->commit();
				}catch(Exception $e){
					$db->rollBack();
					outputErrorLog($e, true);
					throw $e;
				}
			}
			fclose($fp);
		} else {
			outputErrorLog("{$saveFilename}が作成できなかった");
		}
	}
	
	return $total;
}


/**
 * テーブルをエクスポートする
 * @return unknown
 */
function exportTable($db, $tableName, $targetTableName) {
	outputLog("{$tableName}のエクスポートが開始", true);

//	$condition = " (connection_state = 5) OR (DATEDIFF(now(),  created_datetime) > ".CONNECT_NO_VALID_DATE.") ";
	$condition = " (connection_state = 5) OR (DATEDIFF(now(),  updated_datetime) > ".CONNECT_NO_VALID_DATE.") ";

	$dateTime = new DateTime();

	// 保存パス
	$saveFilename = TMP_PATH."{$tableName}_".$dateTime->format('YmdHis').".sql";
	
	// テーブルのデータを取得・保存する
	$total = getAndWriteTableList($db, $tableName, $targetTableName, $condition, $saveFilename);
	
	outputLog("{$tableName}のエクスポートが完了（件数={$total}）", true);
	
	if ($total > 0) {
		return $saveFilename;
	} else {
		return null;
	}
}

/**
 * sqlファイルをインポートする
 * @return unknown
 */
function importSqlFile($db, $filename) {
	outputLog("{$filename}のインポートが開始", true);

	$config  = new Zend_Config_Ini(APP_DIR . 'configs/system.ini', SERVICE_MODE);
	
	// トランザクションスタート
	$db->beginTransaction();
	try{
		$cmd = "mysql -u {$config->datasource->params->username} -p{$config->datasource->params->password} {$config->datasource->params->dbname} < {$filename}";
		exec($cmd, $output, $return);
		if($return == 1){
			// 登録失敗
			$db->rollBack();
			outputErrorLog("{$filename}のインポートができなかった", true);
		}else{
			// 登録成功
			$db->commit();
			outputLog("{$filename}のインポートが完了", true);
			
			if (CLEAR_TMP) {
				// インポート後に一時ファイルを削除する
				if (unlink($filename)) {
					outputLog("{$filename}を削除", true);
				} else {
					outputErrorLog("{$filename}が削除できなかった", true);
				}
			} else {
				$pathData = pathinfo($filename);
				$destPath = FINISH_PATH.$pathData["filename"]."_imported.".$pathData["extension"];
				// 一時ファイルをfinishフォルダに移動
				if (rename($filename, $destPath)) {
					outputLog("{$filename}を{$destPath}へ移動", true);
				} else {
					outputErrorLog("{$filename}が移動・名前変更できなかった", true);
				}
			}
		}
	}catch(Exception $e){
		$db->rollBack();
		outputErrorLog("{$filename}のインポートができなかった[".$e."]", true);
		throw $e;
	}
}
