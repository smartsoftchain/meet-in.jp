<?php

abstract class AbstractController extends Zend_Controller_Action
{
	CONST ENV_MODE = "production";
	CONST DEV_MODE = "development";
	const ENC_SERVER = "59.106.215.95";
	const DEV_SERVER = "59.106.223.239";
	const SpecialStaff = array(
		'AA1', 'AA3', 'AA4'
	);
	public $_logger;
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
			// サーバーアドレスをsmartyにセット
			$this->view->serverAddress = $_SERVER["HTTP_HOST"];
			// モニタリングのポートをsmartyにセット
			$this->view->monitoringServerPort = $this->config->monitoring->port;
			// チャットサーバのポートをsmartyにセット
			$this->view->chatServerPort = $this->config->chat->port;
			
			$this->view->application_version = $this->app->application_version;
		}catch (Exception $e) {
			echo "invalid configure";
			exit;
		}

		// メンテナンスチェック
		if($this->config->mentenance->allow_ip != "" && $this->config->mentenance->allow_ip != $_SERVER["REMOTE_ADDR"]){
			// allow_ipが設定されている且つ、許可したドレス以外の場合は処理を終了する
			echo $this->config->mentenance->message;
			exit;
		}

		// ヘッダーのデザイン制御のためにコントローラー名を画面に設定
		$params = $this->_getAllParams();
		$this->view->controllerName = $params["controller"];
		$this->view->actionName = $params["action"];

		// ブラウザ情報をテンプレートに渡す
		$this->view->browser = $this->getBrowserType();
		$this->view->isMobile = $this->isMobile();
		
		// メンテナンスでなければsetup処理を行う
		$this->_setup();

		// 一覧表示時にnamespaceに設定される値をセッションに保持(キャッチ出来ないエラー用)
		//session_start();
		$_SESSION['user'] = $this->user;
		$listNamespace = array();
		$listNamespace["order"] = $this->namespace->order;
		$listNamespace["ordertype"] = $this->namespace->ordertype;
		$listNamespace["page"] = $this->namespace->page;
		$listNamespace["pagesize"] = $this->namespace->pagesize;
		$_SESSION['listNamespace'] = $listNamespace;
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
		}else {
			$this->_logger = new Zend_Log(new Zend_Log_Writer_Null());
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
			$this->clog('could not connect to the database.', Zend_Log::ERR);
			throw new Exception('Database connect error.');
		}

		// ログインチェック
		$auth = Zend_Auth::getInstance();
		$this->user = $auth->getIdentity();
		Zend_Registry::set('user', $this->user);
		if(!is_null($this->user)){
			// ヘッダー用の名前とクライアント名をセッションにセットする
			$userName = $this->user["staff_firstname"].$this->user["staff_lastname"];
			if(mb_strlen($userName, "UTF-8") > 8){
				$userName = mb_substr($userName, 0, 7, 'UTF-8')."...";
			}
			$this->user["header_username"] = $userName;
			if(array_key_exists("client_name", $this->user) && $this->user["client_name"] != ""){
				$clientName = $this->user["client_name"];
				if(mb_strlen($this->user["client_name"], "UTF-8") > 11){
					$clientName = mb_substr($this->user["client_name"], 0, 10, 'UTF-8')."...";
				}
				$this->user["header_clientname"] = $clientName;
			}
			// 写真
			$profPath = "{$_SERVER['DOCUMENT_ROOT']}/img/profile/{$this->user["staff_type"]}_{$this->user["staff_id"]}.*";
			$profile_image = '';
			foreach(glob($profPath) as $file) {
				if(file_exists($file)) {
					$profile_image = str_replace($_SERVER['DOCUMENT_ROOT'], "", $file);
				}
			}
			if(empty($profile_image)) {
				$profile_image = '/img/no-image.png';
			}
			if($this->isSpecialStaff()) {
				$this->user['special_staff'] = 1;
			} else {
				$this->user['special_staff'] = 0;
			}
/*
			// 商談画面中のユーザーは他の画面に遷移した場合にロックを解除する
			$params = $this->_getAllParams();
			if($params["controller"] != "negotiation"){
				// ステータスを解除
				$connectionInfoDao = Application_CommonUtil::getInstance("dao", "ConnectionInfoDao", $this->db);
				$dict = array("connection_state"=>6);
				$condition = " operator_staff_type = '{$this->user["staff_type"]}' AND operator_staff_id = {$this->user["staff_id"]} AND connection_state = 3";
				// トランザクション開始
				$this->db->beginTransaction();
				try{
					$connectionInfoDao->update($dict, $condition);
					$this->db->commit();
				} catch (Exception $e) {
					$this->db->rollBack();
					throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
				}
			}
*/
			
			$this->user["profile_image"] = $profile_image;
		}
		// smartyにユーザー情報を設定する
		$this->view->user = $this->user;
		
		// セッション開始
		Zend_Session::start();
		$form = $this->_getAllParams();
		$url = parse_url($_SERVER['REQUEST_URI']);
		$referer  = array();
		$referer['path'] = '';
		if(isset($_SERVER['HTTP_REFERER'])){
			$referer = parse_url($_SERVER['HTTP_REFERER']);
		}
		if($url['path'] != $referer['path']){
			// 初期表示時はnamespaceをクリアする
			Zend_Session::namespaceUnset($form['controller'].".".$form['action']);
			$this->namespace = new Zend_Session_Namespace($form['controller'].".".$form['action']);
			$this->namespace->isnew = true;
		}else{
			// 再表示時はnamespaceを設定するのみ
			$this->namespace = new Zend_Session_Namespace($form['controller'].".".$form['action']);
			$this->namespace->isnew = false;
		}
		$this->clog('setup complete successfully.');
		
		// セッションに保存された接続情報
		$apiModel = Application_CommonUtil::getInstance("model", "ApiModel", $this->db);
		$params = $apiModel->getWebRtcParam();
		$this->view->peer_id = $params["peer_id"];
		$this->view->wait_connect_table_string = $params["wait_connect_table_string"];
		
		return;
	}

	/**
	 * アクションがディスパッチャでディスパッチされる前にコールされる(ZENDの標準)
	 * アクセス権限チェックとセキュリティー関連のチェックを行う
	 */
	public function preDispatch(){
		// コントローラとアクションを取得
		$controller = strtolower($this->getRequest()->controller);
		$action = strtolower($this->getRequest()->action);
		// アクセス権限チェックを行わないものを記述する
		if (!preg_match('/^admin/', $controller) && $controller != "common" && $controller != "index" && $action != "deadly" && $action != "admindeadly" && $action != "modaldeadly"){
// 			// daoの宣言
// 			$accessAuthDao = Application_CommonUtil::getInstance("dao", "AccessAuthDao", $this->db);
// 			$accessAuth = $accessAuthDao->getAccessAuth($controller, $action);
// 			$dictKey = strtolower($this->user["staff_role"]);
// 			if(!$accessAuth[$dictKey]){
// 				// 実行権限がない場合はエラー画面へ遷移する
// 				$this->redirect('/error/index?msg=権限がありません');
// 			}
		}
		// ======================================================================
		// サーバー送信データのチェック
		// ======================================================================
		$form = $this->_getAllParams();
		if(array_key_exists("page", $form) && !is_numeric($form["page"])){
			// ページ指定に数値以外を指定した場合
			$this->redirect('/error/index?msg=不正な操作です[error_code:1]');
		}
		if(array_key_exists("pagesize", $form) && !is_numeric($form["pagesize"])){
			// ページサイズ指定に数値以外を指定した場合
			$this->redirect('/error/index?msg=不正な操作です[error_code:2]');
		}
		if(array_key_exists("order", $form) && !preg_match("/^[a-zA-Z0-9_\.]+$/", $form["order"])){
			// 並び替え指定に数値以外を指定した場合
			$this->redirect('/error/index?msg=不正な操作です[error_code:3]');
		}
		if(array_key_exists("ordertype", $form) && ($form["ordertype"] != "asc" && $form["ordertype"] != "desc")){
			// 並び替え昇順・降順指定に数値以外を指定した場合
			$this->redirect('/error/index?msg=不正な操作です[error_code:4]');
		}
		return;
	}

	/**
	 * コントローラログ出力
	 *
	 * @param string $string 出力文字列
	 * @param string $level  出力レベル
	 *
	 * @access public
	 */
	public function clog($string, $level = Zend_Log::DEBUG){
		if ($this->_logger instanceof Zend_Log) {
			$params  = $this->_getAllParams();
			$content = sprintf("M:%s C:%s A:%s > %s",
					$params['module'],
					$params['controller'],
					$params['action'],
					$string
			);
			$this->_logger->log($content, $level);
		}
		return;
	}

	/**
	 * アクションログをDBに書き込む
	 */
	public function setLog($actionName, $data){
		// ディクトの初期化
		$dict = array();
		$dict["staff_id"] = "";
		$dict["staff_type"] = "";
		$dict["client_id"] = null;
		$dict["action_name"] = $actionName;
		$dict["send_data"] = $data;
		if(!is_null($this->user)){
			// ログイン以外の処理
			$dict["staff_type"] = $this->user['staff_type'];
			$dict["action_name"] = $actionName;
			$dict["send_data"] = $data;
			// 担当者IDを設定する
			$dict["staff_id"] = $this->user["staff_id"];
			if(array_key_exists("client_id", $this->user)){
				$dict["client_id"] = $this->user["client_id"];
			}
		}else{
			// ログインの場合はセッションにデータを持っていないのでPOSTデータを分解する
			$form = json_decode($data, true);
			if(array_key_exists("id", $form)){
				$dict["staff_id"] = (int)substr($form["id"],2,strlen($form["id"])-2);
				$dict["staff_type"] = substr($form["id"],0,2);
			}
		}
		if(!is_null($dict["staff_id"]) && $dict["staff_id"] != ""){
			$manager = Application_CommonUtil::getInstance("dao", "LogDao", $this->db);
			$this->db->beginTransaction();
			try{
				$manager->regist($dict);
			}catch (Exception $e) {
				$this->db->rollBack();
				throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
			}
			$this->db->commit();
		}
	}
	
	/**
	 * ログインチェック
	 */
	public function _loginCheck(){
		// ログインチェック
		$auth = Zend_Auth::getInstance();
		if($auth->hasIdentity() != true){
			$this->_redirect('/index');
		}
	}

	// ブラウザの種類を取得
	public function getBrowserType() {
		$browserType = $_SERVER['HTTP_USER_AGENT'];
	
		// Firefox
		if (preg_match('/Firefox/', $_SERVER['HTTP_USER_AGENT']) && !preg_match('/Seamonkey/', $_SERVER['HTTP_USER_AGENT'])) {
			$browserType =  "Firefox";
		}
		// Seamonkey
		else if (preg_match('/Seamonkey/', $_SERVER['HTTP_USER_AGENT'])) {
			$browserType =  "Seamonkey";
		}
		// Chrome
		else if (preg_match('/Chrome/', $_SERVER['HTTP_USER_AGENT']) && !preg_match('/Chromium/', $_SERVER['HTTP_USER_AGENT'])) {
			$browserType =  "Chrome";
		}
		// Chromium
		else if (preg_match('/Chromium/', $_SERVER['HTTP_USER_AGENT'])) {
			$browserType =  "Chromium";
		}
		// Safari
		else if (preg_match('/Safari/', $_SERVER['HTTP_USER_AGENT']) && !preg_match('/Chrome/', $_SERVER['HTTP_USER_AGENT']) && !preg_match('/Chromium/', $_SERVER['HTTP_USER_AGENT'])) {
			$browserType =  "Safari";
		}
		// Opera
		else if (preg_match('/OPR/', $_SERVER['HTTP_USER_AGENT']) || preg_match('/Opera/', $_SERVER['HTTP_USER_AGENT'])) {
			$browserType =  "Opera";
		}
		// Internet Explorer
		else if (preg_match('/MSIE/', $_SERVER['HTTP_USER_AGENT'])) {
			$browserType =  "IE";
		}
		else if (!preg_match('/MSIE/', $_SERVER['HTTP_USER_AGENT']) && !preg_match('/OPR/', $_SERVER['HTTP_USER_AGENT'])) {
			$browserType =  "IE";
		}
	
		return $browserType;
	}
	
	public function isMobile() {
		if (preg_match('/Android|iPhone|iPad|iPod|BlackBerry|IEMobile/i', $_SERVER['HTTP_USER_AGENT'])) {
			return 1;
		}
		return 0;
	}

	// 特殊アカウント判定（集計メニュー表示制御）
	public function isSpecialStaff() {
		if(is_null($this->user)) {
			return false;
		}
		$staffId = $this->user['staff_type'].$this->user['staff_id'];
		foreach(self::SpecialStaff as $val) {
			if($staffId == $val) {
				return true;
			}
		}
		return false;
	}
}

// キャッチできない例外をキャッチする、独自の例外ハンドラ
register_shutdown_function('my_shutdown_handler');
function my_shutdown_handler(){
	$isError = false;
	if ($error = error_get_last()){
		switch($error['type']){
			case E_ERROR:
			case E_PARSE:
			case E_CORE_ERROR:
			case E_CORE_WARNING:
			case E_COMPILE_ERROR:
			case E_COMPILE_WARNING:
				$isError = true;
				break;
		}
	}
	if ($isError){
		$redirectUrls = explode("/", $_SERVER["REDIRECT_URL"]);
		if($redirectUrls[2] != "mediaench.dll"){
			// mediaench.dllは致命的なエラーではないため、エラー出力しない
			$userInfoJson = json_encode($_SESSION['user']);
			$listNamespaceJson = json_encode($_SESSION['listNamespace']);
	
			$subject = "SalesCrowdシステムにおいて致命的な例外発生";
			$message = "SalesCrowdにおいて致命的な例外が発生しました。\n";
			$message .= "担当者は確認を行ってください。\n\n";
			$message .= "[type][".$error['type']."]\n\n";
			$message .= "[message][".$error['message']."]\n\n";
			$message .= "[HTTP_HOST][".$_SERVER["HTTP_HOST"]."]\n\n";
			$message .= "[REDIRECT_URL][".$_SERVER["REDIRECT_URL"]."]\n\n";
			$message .= "[file][".$error['file']."]\n\n";
			$message .= "[line][".$error['line']."]\n\n";
			$message .= "[REMOTE_ADDR][".$_SERVER["REMOTE_ADDR"]."]\n\n";
			$message .= "[HTTP_USER_AGENT][".$_SERVER["HTTP_USER_AGENT"]."]\n\n";
			$message .= "[HTTP_REFERER][".$_SERVER["HTTP_REFERER"]."]\n\n";
			$message .= "\n########################################\n";
			$message .= "[user_info][".$userInfoJson."]\n\n";
			$message .= "[list_namespace][".$listNamespaceJson."]\n\n";
			$message .= "\n########################################\n";
	
			$subject = mb_convert_encoding($subject, "ISO-2022-JP","UTF-8");
			$subject = mb_encode_mimeheader($subject,"ISO-2022-JP");
			$message = mb_convert_encoding($message,"ISO-2022-JP","UTF-8");
			//mail("tmomente-ml@sense.co.jp", $subject, $message, "From: info@aidma-hd.jp");
	
			error_log("[TMO deadly error]");
			error_log("============================================");
			error_log("[type][".$error['type']."]");
			error_log("[message][".$error['message']."]");
			error_log("[HTTP_HOST][".$_SERVER["HTTP_HOST"]."]");
			error_log("[REDIRECT_URL][".$_SERVER["REDIRECT_URL"]."]");
			error_log("[file][".$error['file']."]");
			error_log("[line][".$error['line']."]");
			error_log("[REMOTE_ADDR][".$_SERVER["REMOTE_ADDR"]."]");
			error_log("[HTTP_USER_AGENT][".$_SERVER["HTTP_USER_AGENT"]."]");
			error_log("[HTTP_REFERER][".$_SERVER["HTTP_REFERER"]."]");
			error_log("########################################");
			error_log("[user_info][".$userInfoJson."]");
			error_log("[list_namespace][".$listNamespaceJson."]");
			error_log("########################################");
			error_log("============================================");
	
			if($_SERVER["REDIRECT_URL"] == "/kaden/regist"){
				//header('Location:/error/modaldeadly');
				var_dump("modaldeadly");
			}else{
				$splitRedirectUrl = explode("/", $_SERVER["REDIRECT_URL"]);
				if(preg_match('/^admin/', $splitRedirectUrl[1])){
					// 管理者画面のエラーページへ遷移させる
					//header('Location:/error/admindeadly');
					var_dump("admindeadly");
				}else{
					// 利用者画面のエラーページへ遷移させる
					//header('Location:/error/deadly');
					var_dump("deadly");
				}
			}
		}
	}
}