<?php
define('SERVICE_MODE', (isset($_SERVER['SERVICE_MODE'])) ? $_SERVER['SERVICE_MODE'] : 'production');
ini_set('display_errors', 1);
date_default_timezone_set('Asia/Tokyo');
define('APP_DIR', dirname(dirname(dirname(__FILE__))) . '/application/');
define('APP_SMARTY_DIR', APP_DIR . 'smarty/');
define('LIBRARY_DIR', dirname(dirname(dirname(__FILE__))) .'/library/');
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


// 移行対象外のクライアントのID配列
$excludedClient = array(
//    47
);


// *****************DB情報設定
// 移行元DB
$currentDbConf = array(
    "dsn"=> "mysql:dbname=tmo3_20160114;host=localhost;",
    "user"=> "root",
    "password"=> "90kon6Fmysql"
);
// 移行先DB
//$destinationDbConf = new Zend_Config(array(
//    'database' => array(
//        'adapter' => 'pdo_mysql',
//        'params'  => array(
//            'host'     => '59.106.208.254',
//            'dbname'   => 'migration_test_matsu2',
//            'username' => 'root',
//            'password' => '90kon6Fmysql',
//        )
//    )
//));
//$dbKey="VW2KlB5Dpy5Qt2FzVxsrl0O974otf7";
$destinationDbConf  = new Zend_Config_Ini(APP_DIR . 'configs/system.ini', "development");
$dbKey = $destinationDbConf->datasource->key;


/**
 * DBへの接続を試みる
 * @var unknown_type
 */
try{

    // DAO読み込み時のエラー回避のため、空のarrayをセットする
    Zend_Registry::set('user', array());

    // 現行TMOのDBオブジェクトを宣言
    // DBのインスタンス作成
    $currentDb = currentDbConnection($currentDbConf,$dbKey);

    // 移行先TMOのDBオブジェクトを生成
    $database = Zend_Db::factory($destinationDbConf->database);
    $database->setFetchMode(Zend_Db::FETCH_ASSOC);
    Zend_Db_Table_Abstract::setDefaultAdapter($database);
    // プロファイラ有効
    $database->getProfiler()->setEnabled(true);
    // 暗号化カラムを復号化するためのキー設定
    $database->query("set @key:='{$dbKey}'");
    $destinationDb = Zend_Db_Table_Abstract::getDefaultAdapter();

}
catch (Exception $err){
    debugMeg("error:".$err->getMessage());
}

/**
 * デバッグメッセージ
 * @param unknown $actionName	処理名
 */
function debugMeg($actionName){
    echo $actionName."\n";
    error_log($actionName.":".date("Y-m-d H:i:s"));
}

/**
 * 現行DBの接続を外出し
 * @param $currentDbConf
 * @param $dbKey
 * @return PDO
 */
function currentDbConnection($currentDbConf, $dbKey){
    $currentDb = new PDO($currentDbConf["dsn"], $currentDbConf["user"], $currentDbConf["password"], array(
        PDO::ATTR_PERSISTENT => true,
        PDO::MYSQL_ATTR_LOCAL_INFILE => true,
        PDO::MYSQL_ATTR_INIT_COMMAND => 'SET @key:="' . $dbKey . '";',
    ));
    $currentDb->query('SET NAMES utf8');
    return $currentDb;
}