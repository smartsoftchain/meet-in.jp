<?php
define('SERVICE_MODE', "development");
date_default_timezone_set('Asia/Tokyo');
define('APP_DIR', dirname(dirname(dirname(__FILE__))) . '/application/');
require_once 'Zend/Loader/Autoloader.php';
$loader = Zend_Loader_Autoloader::getInstance();
$loader->setFallbackAutoloader(true);

try{
	$result = array();
	
	$connect_no = $_POST["connect_no"];

	if (!isset($connect_no)) {
		$connect_no = $_GET["connect_no"];
	}

	if (isset($connect_no)) {
		// データベース
		$db = getCurrentDbObject();
	
		// トランザクションスタート
		$db->beginTransaction();
		try{
			$sql = "SELECT
						`id`,
						`connect_no`,
						`operator_sdp`,
						`user_sdp`
					FROM 
						`connection_info`
					WHERE 
						`connect_no` = '{$connect_no}'
					;
			";
	
			$stm = $db->query($sql);
			$connectionInfoList = $stm->fetchAll();
			
			$result["result"] = 1;
			$result["id"] = $connectionInfoList[0]['id'];
			$result["connect_no"] = $connectionInfoList[0]['connect_no'];
			$result["operator_sdp"] = $connectionInfoList[0]['operator_sdp'];
			$result["user_sdp"] = $connectionInfoList[0]['user_sdp'];
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