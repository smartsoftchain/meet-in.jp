<?php
define('SERVICE_MODE', (isset($_SERVER['SERVICE_MODE'])) ? $_SERVER['SERVICE_MODE'] : 'production');

//error_reporting(E_ALL|E_STRICT);
ini_set('display_errors', 1);
date_default_timezone_set('Asia/Tokyo');

define('APP_DIR', dirname(dirname(__FILE__)) . '/application/');
define('APP_SMARTY_DIR', APP_DIR . '/smarty/');
//define('SMARTY_DIR', '../library/Smarty/');
define('LIBRARY_DIR', '../library/');
define('MANAGER_DIR', APP_DIR.'models/');

// directory setup and class loading
//set_include_path('.' . PATH_SEPARATOR . '../library/'
//    . PATH_SEPARATOR . SMARTY_DIR
//    . PATH_SEPARATOR . MANAGER_DIR
//    . PATH_SEPARATOR . get_include_path());

require_once 'Zend/Loader/Autoloader.php';
$loader = Zend_Loader_Autoloader::getInstance();
//$loader->registerNamespace('App_');
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
	$config = new Zend_Config_Ini(APP_DIR . 'configs/system.ini', SERVICE_MODE);
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
	$this->clog('could not connect to the database.', Zend_Log::ERR);
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
	$this->clog('could not connect to the database. ' .$e->getMessage(), Zend_Log::ERR);
	throw new Exception('Database connect error.');
}

// 各種バッチの呼び出し
$arg = $argv[1];
if(!empty($arg)){
	$file = './function/'.$arg.'.php';
	$pid = $arg.".pid";
	// ロックファイルが存在する場合は処理実行せずに終了
	if(file_exists($pid)){
		echo "function is already running.";
		//exit;
	}

	if(file_exists($file)){
		// ロックファイル作成
		touch($pid);
		// 処理実行
		require_once ($file);
		// ロックファイル削除
		unlink($pid);
	}
	else{
		echo "function not found.";
	}
}
else{
	echo "fill a function name";
}

function getInstance($model, $controller = ''){
	$file = sprintf("%s/models/%s/%s.php", APP_DIR, $model, $controller);
	require_once($file);
	$class = sprintf("%s_%s", $model, $controller);
	$instance = new $class;
	return $instance;
}
