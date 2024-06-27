<?php

abstract class AbstractApiController extends Zend_Controller_Action
{
	CONST ENV_MODE = "production";
	CONST DEV_MODE = "development";
	const ENC_SERVER = "docomodx.aidma-hd.jp";
	const DEV_SERVER = "meet-in.jp";
	const AIDMA_DEV_SERVER = "172.22.1.90";

	const ENC_MEETIN_DOMAIN = "docomodx.aidma-hd.jp";
	const STAGE_MEETIN_DOMAIN = "stage.meet-in.jp";
	const DEV_MEETIN_AIDMA_DOMAIN = "dev1.meet-in.jp";
	const DEV_MEETIN_SENSE_DOMAIN = "delphinus2.sense.co.jp";
	const TEST51_MEETIN_SENSE_DOMAIN = "delphinus51.sense.co.jp";
	const TEST52_MEETIN_SENDS_DOMAIN = "delphinus52.sense.co.jp";
	const TEST53_MEETIN_SENDS_DOMAIN = "delphinus53.sense.co.jp";
	const TEST54_MEETIN_SENDS_DOMAIN = "delphinus54.sense.co.jp";
	const TEST55_MEETIN_SENDS_DOMAIN = "delphinus55.sense.co.jp";
	const TEST56_MEETIN_SENDS_DOMAIN = "delphinus56.sense.co.jp";

	const ENC_WEBINAR_URL = "https://webinar.meet-in.jp";
	const STAGE_WEBINAR_URL = "https://stage.webinar.meet-in.jp";
	const DEV_WEBINAR_AIDMA_URL = "https://dev1.webinar.meet-in.jp";
	const DEV_WEBINAR_SENSE_URL = "https://delphinus5.sense.co.jp";
	const TEST61_WEBINAR_SENSE_URL = "https://delphinus61.sense.co.jp";
	const TEST62_WEBINAR_SENSE_URL = "https://delphinus62.sense.co.jp";
	const TEST63_WEBINAR_SENSE_URL = "https://delphinus63.sense.co.jp";
	const TEST64_WEBINAR_SENSE_URL = "https://delphinus64.sense.co.jp";
	const TEST65_WEBINAR_SENSE_URL = "https://delphinus65.sense.co.jp";
	const TEST66_WEBINAR_SENSE_URL = "https://delphinus66.sense.co.jp";

	public $_logger;
	public $_logger2;		// ロガー追加
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
			if($_SERVER["SERVER_NAME"] == self::ENC_SERVER){
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

			$this->view->application_version = $this->app->application_version;
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
		// ロガー生成
		if (isset($this->config->log->controller) && $this->config->log->controller->output == 'on') {
			$this->_logger = new Zend_Log(new Application_Log_Writer_RotateFile($this->config->log->controller));
			$this->_logger->addFilter(new Zend_Log_Filter_Priority((int)$this->config->log->controller->priority));
			Zend_Registry::set('logger', $this->_logger);
		} else {
			$this->_logger = new Zend_Log(new Zend_Log_Writer_Null());
		}

		// ロガー追加生成
		if (isset($this->config->log2->controller) && $this->config->log2->controller->output == 'on') {
			$this->_logger2 = new Zend_Log(new Application_Log_Writer_RotateFile($this->config->log2->controller));
			$this->_logger2->addFilter(new Zend_Log_Filter_Priority((int)$this->config->log2->controller->priority));
			Zend_Registry::set('logger2', $this->_logger2);
		} else {
			$this->_logger2 = new Zend_Log(new Zend_Log_Writer_Null());
		}

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

	/**
	 * webinarルームへ遷移するためのURLを返す
	 */
	protected function getWebinarRoomUrl(){
		// 戻り値
		$result = "";
		if($_SERVER["SERVER_NAME"] == self::ENC_MEETIN_DOMAIN){
			// 本番環境のwebinarルームドメイン
			$result = self::ENC_WEBINAR_URL;
		}else if($_SERVER["SERVER_NAME"] == self::STAGE_MEETIN_DOMAIN){
			// ステージ環境のwebinarルームドメイン
			$result = self::STAGE_WEBINAR_URL;
		}else if($_SERVER["SERVER_NAME"] == self::DEV_MEETIN_AIDMA_DOMAIN){
			// アイドマテスト環境のwebinarルームドメイン
			$result = self::DEV_WEBINAR_AIDMA_URL;
		}else if($_SERVER["SERVER_NAME"] == self::DEV_MEETIN_SENSE_DOMAIN){
			// System Sense テスト環境のwebinarルームドメイン
			$result = self::DEV_WEBINAR_SENSE_URL;
		}else if($_SERVER["SERVER_NAME"] == self::TEST51_MEETIN_SENSE_DOMAIN){
			// Sense61試験共通環境のwebinarルームドメイン
			$result = self::TEST61_WEBINAR_SENSE_URL;
		}else if($_SERVER["SERVER_NAME"] == self::TEST52_MEETIN_SENDS_DOMAIN){
			// Sense62試験共通環境のwebinarルームドメイン
			$result = self::TEST62_WEBINAR_SENSE_URL;
		}else if($_SERVER["SERVER_NAME"] == self::TEST53_MEETIN_SENDS_DOMAIN){
			// Sense63試験共通環境のwebinarルームドメイン
			$result = self::TEST63_WEBINAR_SENSE_URL;
		}else if($_SERVER["SERVER_NAME"] == self::TEST54_MEETIN_SENDS_DOMAIN){
			// Sense64試験共通環境のwebinarルームドメイン
			$result = self::TEST64_WEBINAR_SENSE_URL;
		}else if($_SERVER["SERVER_NAME"] == self::TEST55_MEETIN_SENDS_DOMAIN){
			// Sense65試験共通環境のwebinarルームドメイン
			$result = self::TEST65_WEBINAR_SENSE_URL;
		}else if($_SERVER["SERVER_NAME"] == self::TEST56_MEETIN_SENDS_DOMAIN){
			// Sense66試験共通環境のwebinarルームドメイン
			$result = self::TEST66_WEBINAR_SENSE_URL;
		}
	// 戻り値を返す
		return $result;
	}
}
