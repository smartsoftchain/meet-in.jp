<?php
try{
	//error_reporting(E_ALL|E_STRICT);
	ini_set('display_errors', 1);
	date_default_timezone_set('Asia/Tokyo');

	define('ROOT', dirname(dirname(__FILE__)). '/');
	define('APP_DIR', dirname(dirname(__FILE__)) . '/application/');
	define('APP_SMARTY_DIR', APP_DIR . '/smarty/');
	//define('SMARTY_DIR', '../library/Smarty/');
	define('LIBRARY_DIR', '../library/');
	define('MANAGER_DIR', APP_DIR.'models/');

	define('DL_MANAGE_RELEASE', '2013-10-1');

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
	$frontController->setControllerDirectory(APP_DIR . 'controllers');

	// route
	$router = $frontController->getRouter();
	$route = new Zend_Controller_Router_Route_Regex(
		'waiting-room/(.+)',
		array(
			'controller' => 'index',
			'action'     => 'waiting-room'
		),
		array(
			1 => 'room_name'
		)
	);
	$router->addRoute('waiting-room', $route);
	$route = new Zend_Controller_Router_Route_Regex(
		'room/(.+)',
		array(
			'controller' => 'negotiation',
			'action'     => 'room'
		),
		array(
			1 => 'room_name'
		)
	);
	$router->addRoute('room', $route);

	$route_vip = new Zend_Controller_Router_Route_Regex(
		'rooms/(.+)',
		array(
			'controller' => 'negotiation',
			'action'     => 'viproom'
		),
		array(
			1 => 'room_name'
		)
	);

	$router->addRoute('rooms', $route_vip);

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

	// smarty setup
	require_once('Zend/View/Smarty.class.php');
	require_once( SMARTY_DIR. 'Smarty.class.php' );

	if (preg_match('/Android|iPhone|iPad|iPod|BlackBerry|IEMobile/i', $_SERVER['HTTP_USER_AGENT'])) {
/**
		$view = new Zend_View_Smarty(
			APP_SMARTY_DIR . 'templates',
			array(
				'compile_dir' => APP_SMARTY_DIR . 'templates_c',
				'config_dir'  => APP_SMARTY_DIR . 'configs',
				'cache_dir'   => APP_SMARTY_DIR . 'cache'
			)
		);
*/
		$view = new Zend_View_Smarty(
			APP_SMARTY_DIR . 'templates',
			array(
				'compile_dir' => APP_SMARTY_DIR . 'templates_c_sp',
				'config_dir'  => APP_SMARTY_DIR . 'configs',
				'cache_dir'   => APP_SMARTY_DIR . 'cache_sp'
			)
		);

		$viewRenderer = Zend_Controller_Action_HelperBroker::getStaticHelper('ViewRenderer');
//		error_log($_SERVER['HTTP_USER_AGENT']);
//		error_log("SP");
	 	$viewRenderer->setView($view)
			->setViewBasePathSpec($view->getEngine()->template_dir."/sp")
			->setViewScriptPathSpec(':controller/:action.:suffix')
			->setViewScriptPathNoControllerSpec(':action.:suffix')
			->setViewSuffix('tpl');
	}else{
		$view = new Zend_View_Smarty(
			APP_SMARTY_DIR . 'templates',
			array(
				'compile_dir' => APP_SMARTY_DIR . 'templates_c',
				'config_dir'  => APP_SMARTY_DIR . 'configs',
				'cache_dir'   => APP_SMARTY_DIR . 'cache'
			)
		);

		$viewRenderer = Zend_Controller_Action_HelperBroker::getStaticHelper('ViewRenderer');
//error_log("PC");
			$viewRenderer->setView($view)
				->setViewBasePathSpec($view->getEngine()->template_dir)
				->setViewScriptPathSpec(':controller/:action.:suffix')
				->setViewScriptPathNoControllerSpec(':action.:suffix')
				->setViewSuffix('tpl');
	}

	// run!
	$frontController->dispatch();
} catch (Exception $e) {
	error_log($e->getMessage());
	$exc = '';
	// エラーの内容次第で遷移先を変更する
	if(preg_match('/^Invalid controller specified \(.*\)$/', $e->getMessage())){
		// コントローラー不正
		$exc = 1;
	}else if(preg_match('/^Action.*does not exist and was not trapped in \_\_call\(\)$/', $e->getMessage())){
		// アクション不正
		$exc = 2;
	}else if(preg_match('/^SQLSTATE/', $e->getMessage())){
		// SQL不正
		$exc = 3;
	}else{
		// その他不正
		$exc = 4;
	}
	print_r($e->getMessage());
	// $location = 'Location: /exception/index?code=' . $exc;
	// header($location);
	// exit;
}
