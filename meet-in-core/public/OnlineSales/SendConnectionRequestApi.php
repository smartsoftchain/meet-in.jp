<?php
define('SERVICE_MODE', "development");
date_default_timezone_set('Asia/Tokyo');
define('APP_DIR', dirname(dirname(dirname(__FILE__))) . '/application/');
require_once 'Zend/Loader/Autoloader.php';
$loader = Zend_Loader_Autoloader::getInstance();
$loader->setFallbackAutoloader(true);

try{
	$result = array();
	
	$userType = $_POST["userType"];
	$sdp = $_POST["sdp"];

	if (!isset($userType)) {
		$userType = $_GET["userType"];
	}
	if (!isset($sdp)) {
		$sdp = $_GET["sdp"];
	}

	if (isset($userType) && isset($sdp)) {
		// データベース
		$db = getCurrentDbObject();
	
		// トランザクションスタート
		$db->beginTransaction();
		try{
			$id = getGUID();
		
			if ("1" == $userType) {
				$sql = "
					INSERT INTO
						`connection_info` (
							`id`
							,`operator_sdp`
							,`user_sdp`
							,`connection_request_start_datetime`
							,`connection_start_datetime`
							,`connection_stop_datetime`
							,`connection_operator_last_alive_datetime`
							,`connection_user_last_alive_datetime`
							,`connection_state`
						)
						VALUES (
							'{$id}'
							,'{$sdp}'
							,NULL
							,NOW( )
							,NULL
							,NULL
							,NULL
							,NULL
							,1
						)
					;
				";
			} else if ("2" == $userType) {
				$sql = "
					INSERT INTO
						`connection_info` (
							`id`
							,`operator_sdp`
							,`user_sdp`
							,`connection_request_start_datetime`
							,`connection_start_datetime`
							,`connection_stop_datetime`
							,`connection_operator_last_alive_datetime`
							,`connection_user_last_alive_datetime`
							,`connection_state`
						)
						VALUES (
							'{$id}'
							,NULL
							,'{$sdp}'
							,NOW( )
							,NULL
							,NULL
							,NULL
							,NULL
							,1
						)
					;
				";
			} else {
				$result["result"] = 3;
				echo json_encode($result);
				exit;
			}
			$db->query($sql);
			$db->commit();
			
			$sql = "SELECT
						`id`,
						`connect_no`
					FROM 
						`connection_info`
					WHERE 
						`id` = '{$id}'
					;
			";

			$stm = $db->query($sql);
			$connectionInfoList = $stm->fetchAll();
			
			$result["result"] = 1;
			$result["id"] = $connectionInfoList[0]['id'];
			$result["connect_no"] = $connectionInfoList[0]['connect_no'];
		} catch(Exception $e){
			$db->rollBack();
			throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
		}
	} else {
		$result["result"] = 3;
		$result["get"] = $_GET;
		$result["post"] = $_POST;
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

function getGUID(){
	if (function_exists('com_create_guid')){
		return com_create_guid();
	}else{
		mt_srand((double)microtime()*10000);//optional for php 4.2.0 and up.
		$charid = strtoupper(md5(uniqid(rand(), true)));
		$hyphen = chr(45);// "-"
		$uuid = ""
		.substr($charid, 0, 8).$hyphen
		.substr($charid, 8, 4).$hyphen
		.substr($charid,12, 4).$hyphen
		.substr($charid,16, 4).$hyphen
		.substr($charid,20,12)
		."";// "}"
		return $uuid;
	}
}