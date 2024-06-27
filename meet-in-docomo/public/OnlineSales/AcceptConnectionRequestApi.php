<?php
define('SERVICE_MODE', "development");
date_default_timezone_set('Asia/Tokyo');
define('APP_DIR', dirname(dirname(dirname(__FILE__))) . '/application/');
require_once 'Zend/Loader/Autoloader.php';
$loader = Zend_Loader_Autoloader::getInstance();
$loader->setFallbackAutoloader(true);

try{
	$result = array();
	
	$id = $_POST["id"];
	$operator_sdp = $_POST["operator_sdp"];
	$user_sdp = $_POST["user_sdp"];

	if (!isset($id)) {
		$id = $_GET["id"];
	}
	if (!isset($operator_sdp)) {
		$operator_sdp = $_GET["operator_sdp"];
	}
	if (!isset($user_sdp)) {
		$user_sdp = $_GET["user_sdp"];
	}

	if (isset($id)) {
		// データベース
		$db = getCurrentDbObject();
	
		// トランザクションスタート
		$db->beginTransaction();
		try{
			if (isset($operator_sdp) && $operator_sdp != "") {
				$sql = "
					UPDATE
						`connection_info`
					SET
						`operator_sdp` = '{$operator_sdp}'
						,`updated_datetime` = NOW( )
					WHERE
						`id` = '{$id}'
					;
				";
			} else if (isset($user_sdp) && $user_sdp != "") {
				$sql = "
					UPDATE
						`connection_info`
					SET
						`user_sdp` = '{$user_sdp}'
						,`updated_datetime` = NOW( )
					WHERE
						`id` = '{$id}'
					;
				";
			} else {
				$result["result"] = 3;
				echo json_encode($result);
				exit;
			}
			
			$db->query($sql);
			$db->commit();
			
			$result["result"] = 1;
		} catch(Exception $e){
			$db->rollBack();
			throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
		}
	} else {
		$result["result"] = 3;
		$result["error_message"] = "入力パラメータがない";
	}
	
	echo json_encode($result);
	exit;
}
catch (Exception $err){
	$result = array();
	$result["result"] = 2;
	$result["error_message"] = $err;
	
	echo json_encode($result);
	exit;
}

/**
 * 現行データベースの接続オブジェクト
 * @return PDO
 */
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
