<?php

abstract class AbstractApiController extends Zend_Controller_Action
{
	CONST ENV_MODE = "production";
	CONST DEV_MODE = "development";
	const ENC_SERVER = "meet-in.jp";
	const DEV_SERVER = "meet-in.jp";

	private $config;		// application.ini情報
	protected $message;		// message.ini情報
	protected $user;		// ログインユーザー情報
	protected $namespace;	// 各ページごとに管理するセッション
	protected $db;			// 各ページごとに管理するセッション

	const AJAX_SUCCESS_CODE = "1";		// Ajax処理成功時の結果コード
	const AJAX_FAILED_CODE  = "99";		// Ajax処理失敗時の結果コード

	public function init(){
		parent::init();
		// application.iniを読み込む
		try {
			// サーバーアドレスにより読み込むapplication.iniを変える
			if($_SERVER["SERVER_ADDR"] == self::ENC_SERVER){
				// 本番環境
				$this->config  = new Zend_Config_Ini(APP_DIR . 'configs/system.ini', self::ENV_MODE);
				$this->app     = new Zend_Config_Ini(APP_DIR . 'configs/application.ini', self::ENV_MODE);
				$this->message = new Zend_Config_Ini(APP_DIR . 'configs/message.ini', self::ENV_MODE);
				// モニタリング等のwebsocket接続先
				$this->view->wsAddress = "wss://{$_SERVER["HTTP_HOST"]}:{$this->config->monitoring->port}";
			}else{
				// 開発環境
				$this->config  = new Zend_Config_Ini(APP_DIR . 'configs/system.ini', self::DEV_MODE);
				$this->app     = new Zend_Config_Ini(APP_DIR . 'configs/application.ini', self::DEV_MODE);
				$this->message = new Zend_Config_Ini(APP_DIR . 'configs/message.ini', self::DEV_MODE);
				// モニタリング等のwebsocket接続先
				$this->view->wsAddress = "wss://{$_SERVER["HTTP_HOST"]}:{$this->config->monitoring->port}";
			}
			Zend_Registry::set('config', $this->config);
			Zend_Registry::set('app', $this->app);
			Zend_Registry::set('message', $this->message);
		}catch (Exception $e) {
			$this->returnError("invalid configure");
			exit;
		}

		// メンテナンスでなければsetup処理を行う
		$this->_setup();
	}

	/**
	 * コントローラ セットアップ
	 *
	 * @access protected
	 */
	protected function _setup(){
		// データベース接続
		try {
			$database = Zend_Db::factory($this->config->datasource);
			$database->setFetchMode(Zend_Db::FETCH_ASSOC);
			Zend_Db_Table_Abstract::setDefaultAdapter($database);
			// プロファイラ有効
			$database->getProfiler()->setEnabled(true);
			// 暗号化カラムを復号化するためのキー設定
			$database->query("set @key:='{$this->config->datasource->key}'");

			// DBコネクション取得
			$this->db = Zend_Db_Table_Abstract::getDefaultAdapter();
		}catch (Exception $e) {
			$this->returnError('Database connect error.');
			exit;
		}

		// ログインチェック
		$auth = Zend_Auth::getInstance();
		$this->user = $auth->getIdentity();
		Zend_Registry::set('user', $this->user);
	}
	
	protected function returnError($errorMessage) {
		// 戻り値
		$returnData = array();

		// 処理結果（0=失敗, 1=成功）
		$returnData["status"] = 0;
		
		// エラーメッセージ
		$returnData["error"] = $errorMessage;
		
		// 処理結果を返す
		$result = json_encode($returnData);
		header("Access-Control-Allow-Origin: *");
		echo($result);
		exit;
	}
}