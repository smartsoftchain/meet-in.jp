<?php
define('SERVICE_MODE', (isset($_SERVER['SERVICE_MODE'])) ? $_SERVER['SERVICE_MODE'] : 'production');
ini_set('display_errors', 1);
date_default_timezone_set('Asia/Tokyo');
define('APP_DIR', dirname(dirname(dirname(__FILE__))) . '/application/');
define('APP_SMARTY_DIR', APP_DIR . '/smarty/');
define('LIBRARY_DIR', '../library/');
define('MANAGER_DIR', APP_DIR.'models/');
require_once 'Zend/Loader/Autoloader.php';
$loader = Zend_Loader_Autoloader::getInstance();
$loader->setFallbackAutoloader(true);
// setup controller
$frontController = Zend_Controller_Front::getInstance();
$frontController->throwExceptions(true);
$router = $frontController->getRouter();
$route  = new Zend_Controller_Router_Route(
		'/:company/:controller/:action',
		array(
				'company'    => null,
				'controller' => 'index',
				'action'     => 'index'
		)
);
$frontController->setControllerDirectory(APP_DIR . 'controllers');
$smarty_template_dir = "templates";
$frontController->setDefaultControllerName('index');
$frontController->setParam('useDefaultControllerAlways', true);		// 存在しないコントローラがリクエストされてとき、デフォルト呼ぶようにするフラグ
$router->addRoute('/', $route);

// インクルードパスの設定
$includePath = array();
$includePath[]  = get_include_path();
$includePath[]   = LIBRARY_DIR;
$includePath   = array_merge($includePath, glob(MANAGER_DIR . '*', GLOB_ONLYDIR));
set_include_path(implode(PATH_SEPARATOR, $includePath));

// コントローラディレクトリをパスに追加
foreach ($frontController->getControllerDirectory() as $directory) {
	set_include_path($directory . PATH_SEPARATOR . get_include_path());
}

// コンフィグロード
try {
	$config = new Zend_Config_Ini(APP_DIR.'configs/system.ini', SERVICE_MODE);
	Zend_Registry::set('config', $config);
}
catch (Exception $e) {
	echo 'invalid configure name "' . SERVICE_MODE . '"';
	exit;
}

// データベース接続
try {
	$database = Zend_Db::factory($config->datasource);
	$database->setFetchMode(Zend_Db::FETCH_ASSOC);
	Zend_Db_Table_Abstract::setDefaultAdapter($database);
}
catch (Exception $e) {
	error_log('could not connect to the database.', Zend_Log::ERR);
	throw new Exception('Database connect error.');
}

// データベース接続
try {
	$config = Zend_Registry::get('config');
	$slaveDbs = $config->slaveDbs;
	if (! is_null($slaveDbs)) {
		foreach ($slaveDbs as $key => $slaveDb) {
			$database = Zend_Db::factory($slaveDb);
			$database->setFetchMode(Zend_Db::FETCH_ASSOC);
			Zend_Registry::set($key, $database);
		}
	}
}
catch (Exception $e) {
	error_log('could not connect to the database. ' .$e->getMessage(), Zend_Log::ERR);
	throw new Exception('Database connect error.');
}


/**
 * 現行データベースの接続オブジェクト
 * @return PDO
 */
function getCurrentDbObject(){
	$dsn  = "mysql:dbname=tmo3_20160114;host=59.106.208.254;";
	$user = "root";
	$password = "90kon6Fmysql";
	$currentDb = new PDO($dsn, $user, $password, array(
			PDO::ATTR_PERSISTENT => true,
			PDO::MYSQL_ATTR_LOCAL_INFILE => true,
			PDO::MYSQL_ATTR_INIT_COMMAND => 'SET @key:="' . $config->datasource->key . '";',
	));
	return $currentDb;
}

/**
 * 移行先データベースの接続オブジェクト
 * @return unknown
 */
function getNewDbObject(){
	$config  = new Zend_Config_Ini(APP_DIR . 'configs/system.ini', "development");
	$database = Zend_Db::factory($config->datasource);
	$database->setFetchMode(Zend_Db::FETCH_ASSOC);
	Zend_Db_Table_Abstract::setDefaultAdapter($database);
	// プロファイラ有効
	$database->getProfiler()->setEnabled(true);
	// 暗号化カラムを復号化するためのキー設定
	$database->query("set @key:='{$config->datasource->key}'");
	$newDb = Zend_Db_Table_Abstract::getDefaultAdapter();
	return $newDb;
}

/**
 * 企業情報の移行に使用する区切り文字を返す
 */
function getSplitPatterns(){

	$newDb = getNewDbObject();
	// データ移行に必要なDAOを宣言
	$masterSplitNameDao = Application_CommonUtil::getInstance('dao',"MasterSplitNameDao", $newDb);
	// 企業名から削除する文字列を取得する
	$splitPatterns = array();
	foreach($masterSplitNameDao->getSplitNameList() as $splitName){
		$splitPatterns[] = "/".preg_quote($splitName['name'])."/";
	}
	return $splitPatterns;
}

/**
 * デバッグメッセージ
 * @param unknown $actionName	処理名
 */
function debugMeg($actionName){
	error_log($actionName.":".date("Y-m-d H:i:s"));
}

/**
 * 分割してデータを取得する為のオフセットを生成する
 * @param unknown $page
 * @param unknown $limit
 * @return multitype:number
 */
function getOffset($page, $limit){
	$offset = 0;
	$page = $page - 1;
	if($page > 0){
		$offset = $page * $limit;
	}
	return $offset;
}
















// ===================================================================================================
// 以下、consumer関連を移行する場合のみ使用する共通関数
// ===================================================================================================
/**
 * 企業情報のテーブルカラムに対応したDICTを返す
 * @param unknown $approachTarget
 * @param unknown $splitPatterns
 * @return multitype:string unknown NULL
 */
function getCompanyDict($row, $splitPatterns){
	// DBコネクション取得
	$db = Zend_Db_Table_Abstract::getDefaultAdapter();
	// マネージャーの宣言
	$commonDao = Application_CommonUtil::getInstance('dao','CommonDao', $db);
	// 企業情報登録用DICT
	$companyDict = array();
	$companyDict["genre"] 					= "";
	$companyDict["category1"] 				= "";
	$companyDict["category2"] 				= "";
	$companyDict["category3"] 				= "";
	if(!is_null($row["name"])){
		$companyDict["name"] 					= $commonDao->escape($row["name"]);
		$companyDict["converted_company_name"] 	= Application_CommonUtil::convertCommonString($commonDao->escape($row["name"]));
		$companyName = preg_replace($splitPatterns, "", $commonDao->escape($row["name"]));
		$companyDict["converted_name"] 			= Application_CommonUtil::convertCommonString($companyName);
	}else{
		$companyDict["name"] 					= "";
		$companyDict["converted_company_name"] 	= "";
		$companyDict["converted_name"] 			= "";
	}
	$companyDict["my_number"] 				= "";
	$companyDict["url"] 					= !is_null($row["hp"]) ? $commonDao->escape($row["hp"]) : "";
	if(strlen($companyDict["url"]) > 128){
		// urlは1000から128に変更な為、128を超えている場合は切り取る
		$companyDict["url"] = substr($companyDict["url"], 0, 128);
	}
	$companyDict["detail_url"] 				= "";
	$companyDict["info"] 					= !is_null($row["company_info"]) ? $commonDao->escape($row["company_info"]) : "";
	$companyDict["representative_name"] 	= !is_null($row["representative_name"]) ? $commonDao->escape($row["representative_name"]) : "";
	$companyDict["expertise_field"] 		= !is_null($row["expertise_field"]) ? $commonDao->escape($row["expertise_field"]) : "";
	$companyDict["establishment_date"] 		= !is_null($row["establishment_date"]) ? $commonDao->escape($row["establishment_date"]) : "";
	$companyDict["listing_a_stock_section"] = !is_null($row["listing_a_stock_section"]) ? $commonDao->escape($row["listing_a_stock_section"]) : "";
	$companyDict["employee_count"] 			= !is_null($row["employee_count"]) ? $commonDao->escape($row["employee_count"]) : "";
	$companyDict["relation_company"] 		= !is_null($row["relation_company"]) ? $commonDao->escape($row["relation_company"]) : "";
	$companyDict["main_shareholder"] 		= !is_null($row["main_shareholder"]) ? $commonDao->escape($row["main_shareholder"]) : "";
	$companyDict["closing_period"] 			= !is_null($row["closing_period"]) ? $commonDao->escape($row["closing_period"]) : "";
	$companyDict["capital_stock"] 			= !is_null($row["capital_stock"]) ? $commonDao->escape($row["capital_stock"]) : "";
	$companyDict["sales_volume"] 			= !is_null($row["sales_volume"]) ? $commonDao->escape($row["sales_volume"]) : "";
	$companyDict["ordinary_income"] 		= !is_null($row["ordinary_income"]) ? $commonDao->escape($row["ordinary_income"]) : "";
	$companyDict["employee_count_correct"] 	= !is_null($row["employee_count_correct"]) ? $commonDao->escape($row["employee_count_correct"]) : "";
	$companyDict["ordinary_income_correct"] = !is_null($row["ordinary_income_correct"]) ? $commonDao->escape($row["ordinary_income_correct"]) : "";
	$companyDict["sales_volume_correct"] 	= !is_null($row["sales_volume_correct"]) ? $commonDao->escape($row["sales_volume_correct"]) : "";
	$companyDict["capital_stock_correct"] 	= !is_null($row["capital_stock_correct"]) ? $commonDao->escape($row["capital_stock_correct"]) : "";
	$companyDict["inquiry_form"] 			= "0";
	$companyDict["master_db_company_id"] 	= new Zend_Db_Expr('null');
	return $companyDict;
}

/**
 * 部署・拠点又は個人情報のテーブルカラムに対応したDICTを返す
 * @param unknown $row
 * @return Ambigous <string, unknown>
 */
function getApproachTargetDict($row, $companyDict){
	// DBコネクション取得
	$db = Zend_Db_Table_Abstract::getDefaultAdapter();
	// マネージャーの宣言
	$commonDao = Application_CommonUtil::getInstance('dao','CommonDao', $db);
	// 部署拠点・個人用DICT
	if(!is_null($row["tanto_dept"])){
		$approachTargetDict["base_name"] 				= $commonDao->escape($row["tanto_dept"]);
		$approachTargetDict["converted_base_name"] 		= Application_CommonUtil::convertCommonString($commonDao->escape($row["tanto_dept"]));
	}else{
		$approachTargetDict["base_name"] 				= "";
		$approachTargetDict["converted_base_name"] 		= "";
	}
	$approachTargetDict["company_and_base_name"] 		= $companyDict["converted_name"].$approachTargetDict["converted_base_name"];
	$approachTargetDict["position"] 					= "";
	if(!is_null($row["tanto_name"])){
		$approachTargetDict["person_name"] 				= $commonDao->escape($row["tanto_name"]);
		$approachTargetDict["converted_person_name"] 	= Application_CommonUtil::convertCommonString($commonDao->escape($row["tanto_name"]));
	}else{
		$approachTargetDict["person_name"] 				= "";
		$approachTargetDict["converted_person_name"] 	= "";
	}
	$approachTargetDict["person_kana"] 					= "";
	if(!is_null($row["tel"])){
		$approachTargetDict["tel"] 						= $commonDao->escape($row["tel"]);
		$approachTargetDict["tel_only_numbers"] 		= Application_CommonUtil::getOnlyNumbers($commonDao->escape($row["tel"]));
	}else{
		$approachTargetDict["tel"] 						= "";
		$approachTargetDict["tel_only_numbers"] 		= "";
	}
	if(!is_null($row["fax"])){
		$approachTargetDict["fax"] 						= $commonDao->escape($row["fax"]);
		$approachTargetDict["fax_only_numbers"] 		= Application_CommonUtil::getOnlyNumbers($commonDao->escape($row["fax"]));
	}else{
		$approachTargetDict["fax"] 						= "";
		$approachTargetDict["fax_only_numbers"] 		= "";
	}
	$approachTargetDict["mail"] 						= !is_null($row["counter_mail_address"]) ? $commonDao->escape($row["counter_mail_address"]) : "";
	$approachTargetDict["postcode"] 					= !is_null($row["postcode"]) ? Application_CommonUtil::getOnlyNumbers($commonDao->escape($row["postcode"])) : "";
	if(!is_null($row["address"])){
		$approachTargetDict["address"] 					= $commonDao->escape($row["address"]);
		$approachTargetDict["converted_address"] 		= Application_CommonUtil::convertCommonString($commonDao->escape($approachTargetDict["address"]));
	}else{
		$approachTargetDict["address"] 					= "";
		$approachTargetDict["converted_address"] 		= "";
	}
	$approachTargetDict["free1_name"] 					= !is_null($row["free1_name"]) ? $commonDao->escape($row["free1_name"]) : "";
	$approachTargetDict["free1_value"] 					= !is_null($row["free1_value"]) ? $commonDao->escape($row["free1_value"]) : "";
	$approachTargetDict["free2_name"] 					= !is_null($row["free2_name"]) ? $commonDao->escape($row["free2_name"]) : "";
	$approachTargetDict["free2_value"] 					= !is_null($row["free2_value"]) ? $commonDao->escape($row["free2_value"]) : "";
	$approachTargetDict["free3_name"] 					= !is_null($row["free3_name"]) ? $commonDao->escape($row["free3_name"]) : "";
	$approachTargetDict["free3_value"] 					= !is_null($row["free3_value"]) ? $commonDao->escape($row["free3_value"]) : "";
	$approachTargetDict["free4_name"] 					= !is_null($row["free4_name"]) ? $commonDao->escape($row["free4_name"]) : "";
	$approachTargetDict["free4_value"] 					= !is_null($row["free4_value"]) ? $commonDao->escape($row["free4_value"]) : "";
	$approachTargetDict["free5_name"] 					= !is_null($row["free5_name"]) ? $commonDao->escape($row["free5_name"]) : "";
	$approachTargetDict["free5_value"] 					= !is_null($row["free5_value"]) ? $commonDao->escape($row["free5_value"]) : "";
	$approachTargetDict["free6_name"] 					= !is_null($row["free6_name"]) ? $commonDao->escape($row["free6_name"]) : "";
	$approachTargetDict["free6_value"] 					= !is_null($row["free6_value"]) ? $commonDao->escape($row["free6_value"]) : "";
	$approachTargetDict["free7_name"] 					= !is_null($row["free7_name"]) ? $commonDao->escape($row["free7_name"]) : "";
	$approachTargetDict["free7_value"] 					= !is_null($row["free7_value"]) ? $commonDao->escape($row["free7_value"]) : "";
	$approachTargetDict["free8_name"] 					= !is_null($row["free8_name"]) ? $commonDao->escape($row["free8_name"]) : "";
	$approachTargetDict["free8_value"] 					= !is_null($row["free8_value"]) ? $commonDao->escape($row["free8_value"]) : "";
	$approachTargetDict["free9_name"] 					= !is_null($row["free9_name"]) ? $commonDao->escape($row["free9_name"]) : "";
	$approachTargetDict["free9_value"] 					= !is_null($row["free9_value"]) ? $commonDao->escape($row["free9_value"]) : "";
	$approachTargetDict["free10_name"] 					= !is_null($row["free10_name"]) ? $commonDao->escape($row["free10_name"]) : "";
	$approachTargetDict["free10_value"] 				= !is_null($row["free10_value"]) ? $commonDao->escape($row["free10_value"]) : "";
	$approachTargetDict["master_db_approach_target_id"] = new Zend_Db_Expr('null');
	return $approachTargetDict;
}

/**
 * 企業履歴SQLを生成する
 * @param unknown $companyDict
 * @return NULL
 */
function getCompanyHistorySql($oldCompanyDict, $newCompanyDict, $clientDbHistoryDao){
	// 戻り値
	$result = "";
	// 履歴を作成する為に必要な情報を設定する
	$newCompanyDict["id"] = $oldCompanyDict["id"];
	$newCompanyDict["relation_id"] = $oldCompanyDict["relation_id"];
	if(!is_null($oldCompanyDict["master_db_company_id"])){
		$newCompanyDict["master_db_company_id"] = $oldCompanyDict["master_db_company_id"];
	}else{
		$oldCompanyDict["master_db_company_id"] = new Zend_Db_Expr('null');
	}
	// 更新企業の履歴が存在するか確認する
	$companyHistory = $clientDbHistoryDao->getHaveCompanyHistoryById($oldCompanyDict["id"]);
	if(!$companyHistory){
		// 履歴が１件も存在しない場合、１件目の履歴と次に変更する履歴を作成する
		$result = $clientDbHistoryDao->createClientDbCompanyHistoryInsertSql($oldCompanyDict);
		$result .= $clientDbHistoryDao->createClientDbCompanyHistoryInsertSql($newCompanyDict);
	}else{
		// 既に存在する場合、今回変更する履歴のみ作成する
		$result = $clientDbHistoryDao->createClientDbCompanyHistoryInsertSql($newCompanyDict);
	}
	return $result;
}

/**
 * 部署拠点又は個人情報の履歴SQLを生成する
 * @param unknown $oldCompanyDict
 * @param unknown $newCompanyDict
 * @param unknown $clientDbHistoryDao
 */
function getApproachTargetHistorySql($oldApproachTargetDict, $newApproachTargetDict, $clientDbHistoryDao){
	// 戻り値
	$result = "";
	// 履歴を作成する為に必要な情報を設定する
	$newApproachTargetDict["id"] = $oldApproachTargetDict["id"];
	$newApproachTargetDict["relation_id"] = $oldApproachTargetDict["relation_id"];
	if(!is_null($oldApproachTargetDict["master_db_approach_target_id"])){
		$newApproachTargetDict["master_db_approach_target_id"] = $oldApproachTargetDict["master_db_approach_target_id"];
	}else{
		$oldApproachTargetDict["master_db_approach_target_id"] = new Zend_Db_Expr('null');
	}
	// 更新企業の履歴が存在するか確認する
	$approachTargetHistory = $clientDbHistoryDao->getHaveApproachTargetHistoryById($oldApproachTargetDict["id"]);
	if(!$approachTargetHistory){
		// 履歴が１件も存在しない場合、１件目の履歴と次に変更する履歴を作成する
		$result = $clientDbHistoryDao->createClientDbApproachTargetHistoryInsertSql($oldApproachTargetDict);
		$result .= $clientDbHistoryDao->createClientDbApproachTargetHistoryInsertSql($newApproachTargetDict);
	}else{
		// 既に存在する場合、今回変更する履歴のみ作成する
		$result = $clientDbHistoryDao->createClientDbApproachTargetHistoryInsertSql($newApproachTargetDict);
	}
	return $result;
}

/**
 * 企業情報を直接登録するかSQL文を返す
 */
function registOrSqlStrByCompany($newDb, $newCompanyDict, $oldCompanyDict, $tableName, $clientDbCompanyDao){
	$clientDbCompanySql = "";
	$companyId = $oldCompanyDict["id"];
	$newCompanyDict = array_merge($oldCompanyDict, $newCompanyDict);
	$resultCompanyId = getMigrationResultId($newDb, $tableName, $companyId);
	if($resultCompanyId){
		// 登録処理
		$clientDbCompanyDao->regist($newCompanyDict);
	}else{
		// 更新SQLを作成
		$clientDbCompanySql = $clientDbCompanyDao->createClientDbCompanyUpdateSql($newCompanyDict, $companyId);
	}
	return $clientDbCompanySql;
}

/**
 * 部署拠点・個人情報を直接登録するかSQL文を返す
 */
function registOrSqlStrByApproachTarget($newDb, $newApproachTargetDict, $oldApproachTargetDict, $tableName, $clientDbApproachTargetDao){
	$clientDbApproachTargetSql = "";
	$approachTargetId = $oldApproachTargetDict["id"];
	$newApproachTargetDict = array_merge($oldApproachTargetDict, $newApproachTargetDict);
	$resultApproachTargeId = getMigrationResultId($newDb, $tableName, $approachTargetId);
	if($resultApproachTargeId){
		// 登録処理
		$clientDbApproachTargetDao->regist($newApproachTargetDict);
	}else{
		// 更新SQLを作成
		$clientDbApproachTargetSql = $clientDbApproachTargetDao->createClientDbApproachTargetUpdateSql($newApproachTargetDict, $approachTargetId);
	}
	return $clientDbApproachTargetSql;
}

/**
 * アプローチリストのtreeを生成する
 * @param unknown $approachListId
 * @param unknown $approachTargetId
 * @param unknown $treeApproachTargetIds
 * @param unknown $treeActionDao
 */
function getApproachListTreeSql($newDb, $approachListId, $approachTargetId, $tableName, $treeActionDao){
	$sql = "";
	$resultTreeApproachTargeId = getMigrationResultId($newDb, $tableName, $approachTargetId);
	if(!$resultTreeApproachTargeId){
		// 登録していないapproachTargetIdの場合のみtreeを作成する
		$sql = $treeActionDao->getApproachListTreeSql($approachListId, $approachTargetId);
		// 登録したのでtreeApproachTargetIdsにidを設定し２回目以降の登録を行わない
		setMigrationResultId($newDb, $tableName, $approachTargetId);
	}
	return $sql;
}

/**
 * 同じIDが存在するか検索する
 * 元々jsonでIDをやり取りしていたが膨大なデータになるためテンポラリーテーブルに変更
 * @param unknown $db
 * @param unknown $tableName
 * @param unknown $id
 * @return unknown
 */
function getMigrationResultId($db, $tableName, $id){
	$sql = "SELECT id FROM {$tableName} WHERE id = {$id};";
	$stm = $db->query($sql);
	$row = $stm->fetch();
	return $row;
}

/**
 * IDを登録する
 * @param unknown $db
 * @param unknown $tableName
 * @param unknown $id
 */
function setMigrationResultId($db, $tableName, $id){
	$sql = "INSERT INTO {$tableName} (id) VALUES ({$id});";
	$db->query($sql);
	return;
}

/**
 * ファイル書き込みのオブジェクトを初期化
 */
function initFileObject($newClientId){
	$config = Zend_Registry::get('config');
	$dirPath = $config->file->migration->path;
	$fileName = "{$newClientId}_{$config->file->migration->name}";
	$fullPath = "{$dirPath}/{$fileName}";
	// ファイルの存在確認
	if(file_exists($fullPath)){
		// ファイルが存在すれば削除し、作成する
		unlink($fullPath);
		touch($fullPath);
	}else{
		// ファイルが存在しなければ作成する
		touch($fullPath);
	}
	// ファイルの権限を変更する
	chmod($fullPath, 0777);
	//debugMeg("initFileObject:{$fullPath}");
}

/**
 * ファイル書き込みのオブジェクトを生成する
 */
function createFileObject($newClientId){
	$config = Zend_Registry::get('config');
	$dirPath = $config->file->migration->path;
	$fileName = "{$newClientId}_{$config->file->migration->name}";
	$fullPath = "{$dirPath}/{$fileName}";
	//debugMeg("createFileObject:{$fullPath}");
	// ファイルを開く
	$fp = fopen($fullPath, "w");
	return $fp;
}

/**
 * クエリファイルを削除する
 */
function removeQueryFile($newClientId){
	$config = Zend_Registry::get('config');
	$dirPath = $config->file->migration->path;
	$fileName = "{$newClientId}_{$config->file->migration->name}";
	$fullPath = "{$dirPath}/{$fileName}";
	//debugMeg("removeQueryFile:{$fullPath}");
	if(file_exists($fullPath)){
		unlink($fullPath);
	}
}

/**
 * ファイルに書き出したクエリを実行
 * @return multitype:unknown
 */
function execFileInsertQuery($newClientId){
	// コマンド実行でファイル登録
	$config = Zend_Registry::get('config');
	$dirPath = $config->file->migration->path;
	$fileName = "{$newClientId}_{$config->file->migration->name}";
	$fullPath = "{$dirPath}/{$fileName}";
	//debugMeg("execFileInsertQuery:{$fullPath}");
	$cmd = "mysql -u {$config->datasource->params->username} -p{$config->datasource->params->password} {$config->datasource->params->dbname} < {$fullPath}";
	exec($cmd, $output, $return);
	return array("output"=>$output, "return"=>$return);
}