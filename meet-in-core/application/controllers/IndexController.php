<?php
require_once APP_DIR.'/models/Adapter/AuthAdapter.php';

class IndexController extends AbstractController
{
	const DEFAULT_BOOKMARK_LIST_COUNT = 10;			// デフォルトのブックマークリスト表示件数
	const MP3_AA_STAFF_KEY            = 1;			// 音声ファイルに設定するAAのキー
	const MP3_TA_STAFF_KEY            = 2;			// 音声ファイルに設定するTAのキー
	const MP3_CE_STAFF_KEY            = 0;			// 音声ファイルに設定するCEのキー
	const AUTH_AA                     = "AA";		// アイドマアカウント
	const VIEW_TYPE_PC                = "PC";
	const VIEW_TYPE_MOBILE            = "MOBILE";
	const IDENTIFIER                  = "notification";

	private $viewType = "";

	public function init(){
		parent::init();
		/* Initialize action controller here */
		// PCとモバイルで同じコントローラーを使用するため、どちらで使用しているのか判別値を設定
		if (preg_match('/Android|iPhone|iPad|iPod|BlackBerry|IEMobile/i', $_SERVER['HTTP_USER_AGENT'])) {
			$this->viewType = self::VIEW_TYPE_MOBILE;
		}else{
			$this->viewType = self::VIEW_TYPE_PC;
		}
	}

	/**
	 * ログイン画面表示
	 */
	public function indexAction(){
		// LP側エンドポイントからデータを取得
		$this->config = Zend_Registry::get('config');
		$lp_content = file_get_contents($this->config->media->meetin->url);
		$contents = json_decode($lp_content, true);
		$this->view->list = $contents;

		$systemAdminModel = Application_CommonUtil::getInstance("model", "SystemAdminModel", $this->db);
		$this->view->introductionCompaniesCount = number_format($systemAdminModel->getCompanyNumber());


error_log("★★★ indexAction\n", 3, "/var/tmp/negotiation.log");
		$form = $this->_getAllParams();
		// 操作ログ
		$this->setLog("TOP画面表示", json_encode($form));

		$auth = Zend_Auth::getInstance();

		// オートログイン処理(自動ログイン用クッキー情報)
		if ( !empty( $_COOKIE['auto_login'] )) {	// 有り
error_log("indexAction オートログイン[有り]\n", 3, "/var/tmp/negotiation.log");
			// 自動ログインKEY取得
			$auto_login_key = $_COOKIE['auto_login'];
			// 自動ログインKEYが正しいかを判定(DBにKEYが存在しない場合は再度ログイン)
			$staffLogin = $this->autoLoginFetch( $auto_login_key );
			if ( !empty( $staffLogin )) {		// DB上にキー有り
error_log("indexAction オートログインDB[有り] \n", 3, "/var/tmp/negotiation.log");


				// ログイン処理
				$form['id'] = $staffLogin['staff_type'].$staffLogin['staff_id'];
				$form['auto_login_key'] = $auto_login_key;
error_log("indexAction ログイン処理\n", 3, "/var/tmp/negotiation.log");
				$adapter = new Adapter_AuthAdapter($form);
				$result = $auth->authenticate($adapter);

				/**
				 * クッキー再セット
				 * 一度削除し、再度自動ログイン用のキーを作成する
				 */
				$this->update_auto_login( $auto_login_key );

				// 認証情報へ反映
				$this->user = $auth->getIdentity();
				Zend_Registry::set('user', $this->user);

				// クライアント選択したクライアントに成り変わる(AAのみ)
				// 注意：上記 auth 情報に値を設定している為、認証情報作成後に本処理を行う事！！
//error_log("indexAction staff_type=(". $staffLogin['staff_type'] .") \n", 3, "/var/tmp/negotiation.log");
				if($staffLogin['staff_type'] == self::AUTH_AA){
					$clientModel = Application_CommonUtil::getInstance("model", "ClientModel", $this->db);
//error_log("indexAction オートログインAA client_id=(". $staffLogin['client_id'] .") \n", 3, "/var/tmp/negotiation.log");
					$result = $clientModel->changeClient($staffLogin['client_id']);
				}

				$this->user = $auth->getIdentity();
// error_log("roomAction2 client_id=(". $this->user['client_id'] .") \n", 3, "/var/tmp/negotiation.log");
// error_log("roomAction2 staff_type=(". $this->user['staff_type'] .") \n", 3, "/var/tmp/negotiation.log");
// error_log("roomAction2 staff_id=(". $this->user['staff_id'] .") \n", 3, "/var/tmp/negotiation.log");
// error_log("roomAction2 plan=(". $this->user['plan'] .") \n", 3, "/var/tmp/negotiation.log");
			}
		}
		else {
// error_log("indexAction オートログイン[なし]\n", 3, "/var/tmp/negotiation.log");

// $this->_logger->info("newLogoutAction クッキー(Cookie)削除");
			// ログアウトの場合はクッキー(Cookie)のユーザ情報を削除する
			// staff_type/staff_id/client_id
			setcookie('client_id' , '' , 0, '/');
			setcookie('staff_type', '' , 0, '/');
			setcookie('staff_id'  , '' , 0, '/');

			// セッションクリア
// $this->_logger->info("newLogoutAction clearWebRtcParam");
			$apiModel = Application_CommonUtil::getInstance("model", "ApiModel", $this->db);
			$apiModel->clearWebRtcParam();

// $this->_logger->info("newLogoutAction Zend_Authクリア");
			//$auth = Zend_Auth::getInstance();
			$auth->clearIdentity();
			Zend_Session::destroy();

		}

		if($auth->hasIdentity() == true && 1 != $form['auto_dial']){
// error_log("indexAction [/index/menu]\n", 3, "/var/tmp/negotiation.log");
			$user = $auth->getIdentity();
			$this->_redirect('/index/menu');
		} else {
// error_log("indexAction []\n", 3, "/var/tmp/negotiation.log");
			$this->view->auto_dial = $form['auto_dial'];
			$this->view->connect_no = $form['connect_no'];
			$this->view->user_info = $form['user_info'];
			$this->view->page_from = $form['page_from'];
		}
	}

	/**
	 * ログイン処理(商談画面以外)
	 * ※商談ルームへ入室する前のログイン
	 */
	public function loginAction(){
		$form = $this->_getAllParams();

		if(array_key_exists("id", $form) && array_key_exists("password", $form)){
			// 入力チェック
			$filters = array(
					'id' => 'StringTrim',
					'password' => 'StringTrim',
			);
			$validators = array(
					'id' => array(
							'Alnum',
							array('StringLength', 1, 13),
							'messages' => array(
								0 => '英数字で入力してください',
								1 => '13文字以内で入力してください',
							)
					),
					'password' => array(
							array('NotEmpty'),
							'messages' => array(
									'パスワードを入力してください',
							)
					),
			);

			$result = new Zend_Filter_Input($filters, $validators, $form);

			if(!$result->isValid()){
				if("" == $form['id']){
					$this->view->errors = ["IDを入力してください"];
				}else{
					// パターンチェック
					if("" == $form['password']){
						$this->view->errors = ["パスワードを入力してください"];
					}else{
						$this->view->errors = ["ログインできませんでした"];
					}
				}
			}else{
				// 通常のログイン処理
				$auth = Zend_Auth::getInstance();
				$adapter = new Adapter_AuthAdapter($form);
				$result = $auth->authenticate($adapter);
				if($result->isValid() == false){
					$this->view->errors = $result->getMessages();
				}else{

					// 操作ログ
					if(is_null($this->user)){
						$identity = $result->getIdentity();
						$form['client_id'] = $identity['client_id'];
					}
					$log_param = $form;
					$log_param['password'] = md5($form['password']);
					$this->setLog("ログイン", json_encode($log_param));

					// システムユーザーの場合はシステム管理画面に遷移する
					$this->config = Zend_Registry::get('config');
					if ($form['id'] == $this->config->systemUser->id) {
						if ($form['password'] == $this->config->systemUser->password) {
							$this->_redirect('/system-admin/index');
							return;
						}
					}

					// 自動ログインチェック
					$auto_login = $form["autologin"];

					// 一旦auto_loginを削除
					if ( !empty( $_COOKIE['auto_login'] )) {
error_log("loginAction 自動ログインチェック 一旦auto_loginを削除=[". $_COOKIE['auto_login'] ."]\n", 3, "/var/tmp/negotiation.log");
						$this->delete_auto_login( $_COOKIE['auto_login'] );
					}

					// 新たにauto_loginをセット
					if( !empty( $auto_login )) {
error_log("loginAction 自動ログインチェック ON\n", 3, "/var/tmp/negotiation.log");
						$ident = $auth->getIdentity();
						$this->setup_auto_login( $ident["staff_type"], $ident["staff_id"], $ident["client_id"] );
					}
					else {
error_log("loginAction 自動ログインチェック OFF\n", 3, "/var/tmp/negotiation.log");
						if ( !empty( $_COOKIE['auto_login'] )) {
							$this->delete_auto_login( $_COOKIE['auto_login'] );
						}
					}

						// ログイン時にお知らせ未読関連の値を取得してセッション保持する。 $userを取り直さないとnullや１つ前のuser情報になる。
						$this->user = $auth->getIdentity();
						$this->fetchUnreadNotifications();

					// ログイン出来た場合は権限により遷移先を変更する
					$idChar = substr($form["id"], 0, 2);
					if($this->viewType == self::VIEW_TYPE_PC){
						if($idChar == self::AUTH_AA){
							$this->_redirect('/client/list');
						}else{
							$this->_redirect('/index/menu');
						}
					}else{
						if($idChar == self::AUTH_AA){
							$this->_redirect('/index/client');
						}else{
							$this->_redirect('/index/room');
						}
					}
				}
			}
		}
	}

	/*--------------------------------------------------
	オートログイン取得
	--------------------------------------------------*/
 	private function autoLoginFetch( $auto_login_key ) {
//error_log("autoLoginFetch START auto_login_key=(". $auto_login_key .")\n", 3, "/var/tmp/negotiation.log");
		$apiModel = Application_CommonUtil::getInstance("model", "ApiModel", $this->db);
		$staffLogin = $apiModel->autoLoginFetch($auto_login_key);
		return $staffLogin;
	}

	/*--------------------------------------------------
	オートログインセットアップ
	--------------------------------------------------*/
	private function setup_auto_login( $staff_type, $staff_id, $client_id) {
//error_log("setup_auto_login START staff_type=(". $staff_type .") staff_id=(". $staff_id .")\n", 3, "/var/tmp/negotiation.log");
//error_log("setup_auto_login START client_id=(". $client_id .") password=(". $password .")\n", 3, "/var/tmp/negotiation.log");
		$cookieName = 'auto_login';
		$auto_login_key = sha1( uniqid() . mt_rand( 1,999999999 ) . '_auto_login' );
		$cookieExpire = time() + 3600 * 24 * 365; // 365日間
		$cookiePath = '/';
		$cookieDomain = $_SERVER['SERVER_NAME'];

		// 自動ログイン情報登録(DB)
		// 尚、別ブラウザやPC等でログインされた場合、過去の自動ログイン情報は削除する。
		$apiModel = Application_CommonUtil::getInstance("model", "ApiModel", $this->db);
		$apiModel->autoLoginSet($staff_type, $staff_id, $auto_login_key, $client_id);

//error_log("setup_auto_login cookieName=[". $cookieName ."]\n", 3, "/var/tmp/negotiation.log");
//error_log("setup_auto_login auto_login_key=(". $auto_login_key .")\n", 3, "/var/tmp/negotiation.log");
//error_log("setup_auto_login cookieExpire=[". $cookieExpire ."]\n", 3, "/var/tmp/negotiation.log");
//error_log("setup_auto_login cookiePath=[". $cookiePath ."]\n", 3, "/var/tmp/negotiation.log");
//error_log("setup_auto_login cookieDomain=[". $cookieDomain ."]\n", 3, "/var/tmp/negotiation.log");
		setcookie( $cookieName, $auto_login_key, $cookieExpire, $cookiePath, $cookieDomain );
	}

	/*--------------------------------------------------
	オートログイン更新
	注意：前回の自動ログイン情報が存在した場合は必ず更新する
	※セキュリティを考慮して、自動ログイン用のKeyを随時変更する
	--------------------------------------------------*/
	private function update_auto_login( $old_auto_login_key = '' ) {
		/**
		 * 自動ログイン情報削除(cookie)
		 */
		// cookieの有効期限を過去(現在日時 -)にし無効にする。
		$cookieName = 'auto_login';
		$cookieExpire = time() - 1800;
		$cookiePath = '/';
		$cookieDomain = $_SERVER['SERVER_NAME'];
		setcookie( $cookieName, $old_auto_login_key, $cookieExpire, $cookiePath, $cookieDomain );

		// 新自動ログイン情報作成
		$cookieName = 'auto_login';
		$new_auto_login_key = sha1( uniqid() . mt_rand( 1,999999999 ) . '_auto_login' );
		$cookieExpire = time() + 3600 * 24 * 365; // 365日間
		$cookiePath = '/';
		$cookieDomain = $_SERVER['SERVER_NAME'];

		// 自動ログウイン情報更新(Keyのみ)
		$apiModel = Application_CommonUtil::getInstance("model", "ApiModel", $this->db);
		$apiModel->updateAutoLoginKey($old_auto_login_key, $new_auto_login_key);
		// 自動ログウイン情報更新(cookie)
		setcookie( $cookieName, $new_auto_login_key, $cookieExpire, $cookiePath, $cookieDomain );
	}

	/*--------------------------------------------------
	オートログインデリート
	--------------------------------------------------*/
	private function delete_auto_login( $auto_login_key = '' ) {
		/**
		 * 自動ログイン情報削除(DB)
		 */
		$apiModel = Application_CommonUtil::getInstance("model", "ApiModel", $this->db);
		$apiModel->deletAutoLoginKey($auto_login_key);
		/**
		 * 自動ログイン情報削除(cookie)
		 */
		// cookieの有効期限を過去(現在日時 -)にし無効にする。
		$cookieName = 'auto_login';
		$cookieExpire = time() - 1800;
		$cookiePath = '/';
		$cookieDomain = $_SERVER['SERVER_NAME'];
		setcookie( $cookieName, $auto_login_key, $cookieExpire, $cookiePath, $cookieDomain );
	}

	/**
	 * ログイン処理(商談画面用)
	 * ※商談ルームへ入室後のログイン
	 */
	public function doLoginAction(){
		$form = $this->_getAllParams();
		$data = array();

error_log("★★★ doLoginAction autologin=(".$form['autologin'].")\n", 3, "/var/tmp/negotiation.log");

		// 入力チェック
		$filters = array(
				'id' => 'StringTrim',
				'password' => 'StringTrim',
		);

		$validators = array(
				'id' => array(
						'Alnum',
						array('StringLength', 1, 13),
						'messages' => array(
							0 => '英数字で入力してください',
							1 => '13文字以内で入力してください',
						)
				),
				'password' => array(
						array('NotEmpty'),
						'messages' => array(
								'パスワードを入力してください',
						)
				),
				'id' => array(
						array('NotEmpty'),
						'messages' => array(
								'ユーザーIDを入力してください',
						)
				),
		);

		$resultInput = new Zend_Filter_Input($filters, $validators, $form);
		$data["result"] = 0;

		//////////////////////////////////////////////////////
		// 認証処理
		//
		if(false == $resultInput->isValid()){
			//認証失敗
			$data["result"] = 0;
			$data["error"] = $resultInput->getMessages();
		}else{

			$auth = Zend_Auth::getInstance();
			$adapter = new Adapter_AuthAdapter($form);
			$resultInput = $auth->authenticate($adapter);
			if($resultInput->isValid() == false){
				$data["result"] = 0;
				$data["error"] = $resultInput->getMessages();
			}else{

				// AAの場合はclientChangeで user情報を取得するが、AA以外はクライアント選択がないため、ここで取得する。
				if ($ident['staff_type'] !== self::AUTH_AA) {
					$this->user = $resultInput->getIdentity();
					$data["plan_this_month"] = $this->user["plan_this_month"];
				}
				//認証成功
				$this->user["login_flg"] = 1;
				$this->user["id"] = $form["id"];
				$this->user["password"] = $form["password"];

				$data["result"] = 1;
				// ログイン出来た場合は権限により遷移先を変更する
				$idChar = substr($form["id"], 0, 2);
				$data["idChar"] = $idChar;
				$ident = $auth->getIdentity();
				$data["desktop_notify_flg"] = $ident["desktop_notify_flg"];
				$data["staff_name"] = $ident["staff_name"];
				$data["client_name"] = $ident["client_name"];
				$data["record_method_type"] = $ident["record_method_type"];

				// クッキー(Cookie)へユーザ情報を設定する用
				$data["staff_role"] = $ident["staff_role"];
				$data["staff_type"] = $ident["staff_type"];
				$data["staff_id"] = $ident["staff_id"];
				$data["client_id"] = $ident["client_id"];
				// 資料追加ボタン表示判定用
				$data["plan_this_month"] = $ident["plan_this_month"];
				$data["trialUserFlg"] = $ident["trialUserFlg"];
				$data["room_in_menu_enable"] = $ident["room_in_menu_enable"];

				// 自動ログインチェック
				$auto_login = $form["autologin"];

				// 操作ログ
				if(is_null($this->user)){
					$identity = $result->getIdentity();
					$form['client_id'] = $identity['client_id'];
				}
				$log_param = $form;
				$log_param['password'] = md5($form['password']);
				$this->setLog("ログイン", json_encode($log_param));

				// 一旦auto_loginを削除
				if ( !empty( $_COOKIE['auto_login'] )) {
error_log("doLoginAction 自動ログインチェック 一旦auto_loginを削除=[". $_COOKIE['auto_login'] ."]\n", 3, "/var/tmp/negotiation.log");
					$this->delete_auto_login( $_COOKIE['auto_login'] );
				}

				// 新たにauto_loginをセット
				if( !empty( $auto_login ) ) {
error_log("doLoginAction 自動ログインチェック ON\n", 3, "/var/tmp/negotiation.log");
					$ident = $auth->getIdentity();
					$this->setup_auto_login( $ident["staff_type"], $ident["staff_id"], $ident["client_id"] );
				}
				else {
error_log("doLoginAction 自動ログインチェック OFF\n", 3, "/var/tmp/negotiation.log");
					if ( !empty( $_COOKIE['auto_login'] )) {
						$this->delete_auto_login( $_COOKIE['auto_login'] );
					}
				}

				$apiModel = Application_CommonUtil::getInstance("model", "ApiModel", $this->db);

				// ここで退出時のリダイレクトURLを保存する
				if (!$apiModel->hasActiveUserOnRoom($form['connection_info_id'])) {
					$masterClientDao = Application_CommonUtil::getInstance("dao", "MasterClientDao", $this->db);
					$condition = 'AND client_id = '. $this->user['client_id'];
					$client = $masterClientDao->getClientList($condition, "client_id", "", 1, 1);
					if (count($client) && $client[0]['client_redirect_url'] != "") {
						$apiModel->updateRoomGuestLeaveRedirectUrl($form['connection_info_id'], $client[0]['client_redirect_url']);
					} else {
						$apiModel->updateRoomGuestLeaveRedirectUrl($form['connection_info_id'], '');
					}
				}

				$connectionInfo = $apiModel->updateConnectionInfoLogin($form["connection_info_id"], $form["user_id"], "1");
				if (empty($connectionInfo)) {
					$data["result"] = 0;
					$data["error"] = "ログイン情報を更新できませんでした";
				} else {
					$data["result"] = 1;
					$data["connection_info"] = $connectionInfo;
				}

				$staff = $auth->getIdentity();

				if (isset($staff)) {
					// 最終入室日時を更新する
					$adminModel = Application_CommonUtil::getInstance("model", "AdminModel", $this->db);
					$adminModel->updateEnterRoomDate($staff['staff_type'], $staff['staff_id']);
				}

			}
		}

		// 処理結果を返す
		$result = json_encode($data);
		header("Access-Control-Allow-Origin: *");
		echo($result);
		exit;
	}

	/**
	 * お知らせ未読件数取得処理
	 */
	public function fetchUnreadNotifications() {
		// お知らせ未読数を設定する
		$notificationModel = Application_CommonUtil::getInstance("model", "NotificationModel", $this->db);
		$notificationStaffReadsModel = Application_CommonUtil::getInstance("model", "NotificationStaffReadsModel", $this->db);

		if (isset($this->user)) {

			$alreadyReadNotifications =  $notificationStaffReadsModel->getAlreadyReadNotificationsId($this->user);
			$alreadyReadNotificationsArray = explode(',', ltrim($alreadyReadNotifications["already_read_notification_id_list"], ','));
			$unreadNotificationCount = $notificationModel->getUnreadNotificationCount($alreadyReadNotifications);
			// $unreadNotificationCount = 100; // TODO: 未読100件以上表示用 デザイン確認等終わり、本番反映前等に削除する

			// お知らせ関連のセッション値クリア
			Application_CommonUtil::unsetSession('notification');

			// セッションに既読お知らせ関連の値を設定する
			$session = Application_CommonUtil::getSession('notification');

			$session->alreadyReadNotifications = $alreadyReadNotifications;
			$session->alreadyReadNotificationsArray = $alreadyReadNotificationsArray;
			$session->unreadNotificationCount = $unreadNotificationCount;

		}
	}

	/**
	 * TOPメニュー表示
	 */
	public function menuAction(){
		$this->_loginCheck();
		$form = $this->_getAllParams();

		// お知らせセッションを取得
		$session = Application_CommonUtil::getSession("notification");

		$apiModel = Application_CommonUtil::getInstance("model", "ApiModel", $this->db);
		$adminModel = Application_CommonUtil::getInstance("model", "AdminModel", $this->db);
		$openSeminarModel = Application_CommonUtil::getInstance("model", "OpenSeminarModel", $this->db);

		// セッションに保存したお知らせ未読関連の値を参照 この箇所は定義して渡さないとダメな様子
		$alreadyReadNotifications = $session->alreadyReadNotifications;

		$notification = $adminModel->getDisplayNotification($alreadyReadNotifications);

		$params = $apiModel->getWebRtcParam();
		error_log("★★★ menuAction params=(".print_r($params, true).")\n", 3, "/var/tmp/negotiation.log");

		// オープンセミナーテンプレートを取得
		$openSeminarTemplates = $openSeminarModel->getOpenSeminarTemplates();

		$this->view->client_id = $this->user["client_id"];
		$this->view->staff_type = $this->user["staff_type"];
		$this->view->staff_id = $this->user["staff_id"];
		$this->view->negotiation_room_type = $this->user["negotiation_room_type"];
		$this->view->record_method_type = $this->user["record_method_type"];

		$this->view->notification = $notification;

		$this->view->room_name = isset($form["room_name"]) ? $form["room_name"] : null;
		$this->view->room_mode = isset($form["room_mode"]) ? $form["room_mode"] : null;

		if($session->close) {
			$this->view->close = "close";
		}
		$this->view->openSeminarTemplates = $openSeminarTemplates;


		// ログインOKの場合はクッキー(Cookie)へユーザ情報を設定する
		// staff_type/staff_id/client_id
		setcookie('client_id' , $this->user["client_id"] , 0, '/');
		setcookie('staff_type', $this->user["staff_type"], 0, '/');
		setcookie('staff_id'  , $this->user["staff_id"]  , 0, '/');
		error_log("★★★ menuAction client_id=(".$this->user["client_id"].")\n", 3, "/var/tmp/negotiation.log");
		error_log("★★★ menuAction staff_type=(".$this->user["staff_type"].")\n", 3, "/var/tmp/negotiation.log");
		error_log("★★★ menuAction staff_id=(".$this->user["staff_id"].")\n", 3, "/var/tmp/negotiation.log");

		// 削除実行
		// ログイン時はセッションを削除しないため、ルームへの入室判定に使用しているユーザID (user_id) を削除する
		$apiModel->saveWebRtcParam(array(
			'user_id' => null,
			'room_name' => null,
			'collabo_site' => null
		));

		// 操作ログ
		$this->setLog("TOPメニュー表示", json_encode($form));
	}

    /**
     * ゲストを含む 入室前の待合室
     * ルーム内でのカメラ・マイクの設定機能がある点を留意.
     * ※URL直入力時
     */
    public function waitingRoomAction()
    {
		$form = $this->_getAllParams();

		$apiModel = Application_CommonUtil::getInstance("model", "ApiModel", $this->db);
		$collabo_site = $this->getCollaborationSiteId($_SERVER["SERVER_NAME"]);
		// SPの場合
		if(boolval($this->isMobile())) {
			$result = $apiModel->situationRoom($form, $collabo_site);

			if($result['room']['room_state'] !== "1") {
				// ロックされていない 部屋は直接入室とする.
				$waiting_room = "/waiting-room/";
				$this->_redirect(str_replace($waiting_room, '/room/', $_SERVER['REQUEST_URI']));
			}
		}

		// セッション取得
		$session = Application_CommonUtil::getSession(self::IDENTIFIER);

		// 待合室の通過フラグを保持
		$session->isPassWaitingRoom = "1";
		$session->setExpirationSeconds(43200, 'isPassWaitingRoom');
		header('Cache-Control: no-cache');

		$this->view->room_name = $form['room_name'];
		$this->view->room_mode = $form['room_mode'];

		$is_operator = "0";
		if($this->user != null) {
			$this->view->user_id   = $this->user["staff_id"];
			$this->view->user_name = $this->user["staff_name"];
			if (empty($this->user["staff_type"]) == false) {
				$is_operator = "1";
			}
		}
		$this->view->is_operator = $is_operator;

		// 待合室入室時点で背景合成を行う方法を分ける為、取得 MCU用
		$roomInfo = $apiModel->getNegotiationRoomTypeByClient($form, $this->user["client_id"], $collabo_site);
		$this->view->negotiation_room_type = $roomInfo['data']['negotiation_room_type'];

		// 背景効果の設定.
		$bodypix_background_path = "bodypix_no_effect"; // 初期値：背景効果を行わない.
		if($is_operator == "1" || isset($this->user['bodypix_background_path'])) {
			// ログインしていれば以前の設定を保存しているがゲストは無理.
			$bodypix_background_path = $this->user['bodypix_background_path'];
		}
		$this->view->bodypix_background_path = $bodypix_background_path;

    }

	/**
	 * ログアウト
	 */
	public function logoutAction(){
		// 操作ログ
		$this->setLog("ログアウト", json_encode($this->_getAllParams()));
$this->_logger->info("logoutAction session_id=(". session_id() .")");
//error_log("★★★ logoutAction\n", 3, "/var/tmp/negotiation.log");

		// ログアウトの場合はクッキー(Cookie)のユーザ情報を削除する
		// staff_type/staff_id/client_id
		setcookie('client_id' , '' , 0, '/');
		setcookie('staff_type', '' , 0, '/');
		setcookie('staff_id'  , '' , 0, '/');

		if ( !empty( $_COOKIE['auto_login'] )) {
$this->_logger->info("loginAction 自動ログイン情報を削除");
//error_log("loginAction 自動ログイン情報を削除 auto_login=[". $_COOKIE['auto_login'] ."]\n", 3, "/var/tmp/negotiation.log");
			$this->delete_auto_login( $_COOKIE['auto_login'] );
		}

		// セッションクリア
$this->_logger->info("loginAction セッションクリア");
		$apiModel = Application_CommonUtil::getInstance("model", "ApiModel", $this->db);
		$apiModel->clearWebRtcParam();

		$auth = Zend_Auth::getInstance();
		$auth->clearIdentity();
		Zend_Session::destroy();

		$this->_redirect('/index');
	}

	/**
	 * ログアウト(ゲスト終了用)
	 * (cookie & セッションクリアクリア)
	 */
	public function newLogoutAction(){
$this->_logger->info("newLogoutAction session_id=(". session_id() .")");
error_log("★★★ newLogoutAction\n", 3, "/var/tmp/negotiation.log");
		// 操作ログ
		$this->setLog("ログアウト", json_encode($this->_getAllParams()));
//error_log("newLogoutAction room_in=[".$_SESSION['room_in']."]\n", 3, "/var/tmp/negotiation.log");

$this->_logger->info("newLogoutAction クッキー(Cookie)削除");
		// ログアウトの場合はクッキー(Cookie)のユーザ情報を削除する
		// staff_type/staff_id/client_id
		setcookie('client_id' , '' , 0, '/');
		setcookie('staff_type', '' , 0, '/');
		setcookie('staff_id'  , '' , 0, '/');

		// セッションクリア
$this->_logger->info("newLogoutAction clearWebRtcParam");
		$apiModel = Application_CommonUtil::getInstance("model", "ApiModel", $this->db);
		$apiModel->clearWebRtcParam();
$this->_logger->info("newLogoutAction Zend_Authクリア");
		$auth = Zend_Auth::getInstance();
		$auth->clearIdentity();
		Zend_Session::destroy();

		// 背景画像の削除(PCの場合のみ)
		$form = $this->_getAllParams();
		if(array_key_exists("bodypixGuestId", $form)){
			$commonModel = Application_CommonUtil::getInstance("model", "CommonModel", $this->db);
			$commonModel->guestEndMeetinDelBodypixImage($form["bodypixGuestId"]);
		}

		// リダイレクト先を生成する
		$form = $this->_getAllParams();
		$collabo_id = 0;
		$roomInfo = $apiModel->getConnectionInfoById($form['connection_info_id']);

		// $roomInfoを戻す
		$result = array('status' => '1', 'redirect_url' => ($roomInfo['guest_redirect_url'] != null ? $roomInfo['guest_redirect_url'] : ''));
		echo json_encode($result);
		exit;

	}

	/**
	 * 電話を掛けるのモーダル表示
	 */
	public function telephoneAction(){
		// 操作ログ
		$this->setLog("電話を掛ける表示", json_encode($this->_getAllParams()));
		$form = $this->_getAllParams();
		// ダイアラーからmeetin発信ボタンを削除
		$this->view->meetin_btn = false;
		// 商談画面からのダイアラー起動の場合、meetin発信ボタンを非表示
//		if(isset($form["from"]) && $form["from"] == "negotiation") {
//			$this->view->meetin_btn = false;
//		} else {
//			$this->view->meetin_btn = true;
//		}
		// 電話を掛けるために必要なキーを生成
		$staffKey = "";
		if($this->user["staff_type"] == "AA"){
			$staffKey = self::MP3_AA_STAFF_KEY.sprintf("%05d", $this->user["staff_id"]);
		}elseif($this->user["staff_type"] == "TA"){
			$staffKey = self::MP3_TA_STAFF_KEY.sprintf("%05d", $this->user["staff_id"]);
		}elseif($this->user["staff_type"] == "CE"){
			$staffKey = self::MP3_CE_STAFF_KEY.sprintf("%05d", $this->user["staff_id"]);
		}
		$this->view->staffKey = $staffKey;

		$config = new Zend_Config_Ini(APP_DIR . 'configs/system.ini', "production");
		$asterisk_info = explode("|", $config->asterisk->info);
		$asterisk = array();
		for ($i = 0; $i < count($asterisk_info); $i++) {
			$info = explode("/", $asterisk_info[$i]);
			$asterisk[$info[0]] = $info[1];
		}
		$this->view->domain = $asterisk[$this->user["webphone_ip"]];
	}
	/**
	 * お問い合わせのメール送信
	 */
	public function inquiryAction(){
		$form = $this->_getAllParams();

		// 操作ログ
		$this->setLog($user, "TMOへのお問い合わせ", json_encode($form));

		$prohibitedCharacters = preg_split("//u", '①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳ⅠⅡⅢⅣⅤⅥⅦⅧⅨⅩ㍉㌔㌢㍍㌘㌧㌃㌶㍑㍗㌍㌦㌣㌫㍊㌻㎜㎝㎞㎎㎏㏄㎡㍻〝〟№㏍℡㊤㊥㊦㊧㊨㈱㈲㈹㍾㍽㍼∮∑∟⊿纊褜鍈銈蓜俉炻昱棈鋹曻彅丨仡仼伀伃伹佖侒侊侚侔俍偀倢俿倞偆偰偂傔僴僘兊兤冝冾凬刕劜劦勀勛匀匇匤卲厓厲叝﨎咜咊咩哿喆坙坥垬埈埇﨏塚增墲夋奓奛奝奣妤妺孖寀甯寘寬尞岦岺峵崧嵓﨑嵂嵭嶸嶹巐弡弴彧德忞恝悅悊惞惕愠惲愑愷愰憘戓抦揵摠撝擎敎昀昕昻昉昮昞昤晥晗晙晴晳暙暠暲暿曺朎朗杦枻桒柀栁桄棏﨓楨﨔榘槢樰橫橆橳橾櫢櫤毖氿汜沆汯泚洄涇浯涖涬淏淸淲淼渹湜渧渼溿澈澵濵瀅瀇瀨炅炫焏焄煜煆煇凞燁燾犱犾猤猪獷玽珉珖珣珒琇珵琦琪琩琮瑢璉璟甁畯皂皜皞皛皦益睆劯砡硎硤硺礰礼神祥禔福禛竑竧靖竫箞精絈絜綷綠緖繒罇羡羽茁荢荿菇菶葈蒴蕓蕙蕫﨟薰蘒﨡蠇裵訒訷詹誧誾諟諸諶譓譿賰賴贒赶﨣軏﨤逸遧郞都鄕鄧釚釗釞釭釮釤釥鈆鈐鈊鈺鉀鈼鉎鉙鉑鈹鉧銧鉷鉸鋧鋗鋙鋐﨧鋕鋠鋓錥錡鋻﨨錞鋿錝錂鍰鍗鎤鏆鏞鏸鐱鑅鑈閒隆﨩隝隯霳霻靃靍靏靑靕顗顥飯飼餧館馞驎髙髜魵魲鮏鮱鮻鰀鵰鵫鶴鸙黑ⅰⅱⅲⅳⅴⅵⅶⅷⅸⅹ¦＇＂',  -1, PREG_SPLIT_NO_EMPTY);
		$resultMsg = "";
		if($form["inquiry_text"] != ""){
			if(mb_strlen($form["inquiry_text"], "UTF-8") > 200){
				$resultMsg .= "TMOへのご意見・ご要望が文字数オーバー（200）です。\n";
			}
			$strList = preg_split("//u", $form["inquiry_text"], -1, PREG_SPLIT_NO_EMPTY);
			if(count(array_intersect($prohibitedCharacters, $strList)) > 0){
				$resultMsg .= "TMOへのご意見・ご要望に表示できない文字が含まれます。\n";
			}
		}else{
			$resultMsg .= "TMOへのご意見・ご要望が空欄です。\n";
		}

		if($resultMsg == ""){
			$manager = $this->_getInstance('manager','Client');
			$client = $manager->getClient("client_id", $user["client_id"]);
			$this->view->client_id = $user["client_id"];
			$this->view->client_name = $client["client_name"];
			$this->view->client_staffname = $user["firstname"].$user["lastname"];
			$this->view->now = date('Y-m-d H:i:s');
			$this->view->text = $form["inquiry_text"];
			$body = $this->view->render('mailtemplates/mail_inquiry.tpl');

			$config = new Zend_Config_Ini(APP_DIR . 'configs/application.ini', SERVICE_MODE);
			$mailQueManager = $this->_getInstance('manager','MailQue');
			$mailQue = array();

			$mailQue['from'] = array($config->mail->support_mail, "【TMOサポート窓口】");
			$mailQue['to'] = $config->mail->support_mail;
			$mailQue['cc'] = "";
			$mailQue['subject'] = '【TMOサポート窓口】TMOご意見・ご要望';
			$mailQue['body'] = $body;
			$mailQueManager->sendMail($mailQue);

			echo "送信完了しました";
		}else{
			echo $resultMsg;
		}
		exit;
	}


	/**
	 * パスワードリマインダー処理
	 */
	public function reminderAction() {
		$this->setLog("リマインダー画面表示", json_encode($this->_getAllParams()));
		$form = $this->_getAllParams();
		$request = $this->getRequest();
		if($request->isPost()) {
			// モデル宣言
			$adminModel = Application_CommonUtil::getInstance('model', "AdminModel", $this->db);
			$result = $adminModel->sendMailReminderAccount($form, $request);
			if(empty($result["errorList"])) {
				return $this->_redirect('/index/login');
			}
			$this->view->errors = $result["errorList"];
		} else {
		}
	}
	/**
	 * パスワード再設定
	 */
	public function activateAction() {
		$this->setLog("アクティベーション画面表示", json_encode($this->_getAllParams()));
		$form = $this->_getAllParams();
		$request = $this->getRequest();
		if($request->isPost()) {
			// パスワード変更
			// モデル宣言
			$adminModel = Application_CommonUtil::getInstance('model', "AdminModel", $this->db);
			$result = $adminModel->activateStaff($form, $request);
			$this->view->errorList = $result["errorList"];
			$this->view->staffDict = $result["staffDict"];
		} else {
			// アクティベーション画面表示の条件
			if(!isset($form["id"]) || empty($form["id"]) || !preg_match('/[0-9a-zA-Z]{32}/', $form["id"])) {
				$this->_redirect('/index/login');
			}
			// モデル宣言
			$adminModel = Application_CommonUtil::getInstance('model', "AdminModel", $this->db);
			$result = $adminModel->getActivationStaff($form, $request);
			if(empty($result["staffDict"])) {
				$this->_redirect('/index/login');
			}
			$this->view->staffDict = $result["staffDict"];
		}
	}

	/**
	 * トライアル申請のバリデーション
	 */
	public function validateTrialAction() {
		// 操作ログの登録
		$this->setLog("トライアル申請画面表示", json_encode($this->_getAllParams()));
		// 送信値の取得
		$form = $this->_getAllParams();
		$request = $this->getRequest();
		// 戻り値の宣言[status][1:成功, 0:失敗]
		$result = array("status"=>0, "error"=>array());
		// POST送信の場合のみ登録処理を行う
		if($request->isPost()) {
			// モデルの宣言
			$adminModel = Application_CommonUtil::getInstance('model', "AdminModel", $this->db);
			// トライアルユーザー登録処理
			$result = $adminModel->validateTrialUser($form);
		}else{
			$result["error"][] = "不正なデータ送信です。";
		}
		echo json_encode($result);
		exit;
	}

	/**
	 * トライアル申請の登録
	 */
	public function registTrialAction() {
		// 操作ログの登録
		$this->setLog("トライアル申請登録", json_encode($this->_getAllParams()));
		// モデルの宣言
		$adminModel = Application_CommonUtil::getInstance('model', "AdminModel", $this->db);
		// トライアルユーザー登録処理
		$result = $adminModel->registTrialUser();
		echo json_encode($result);
		exit;
	}

	/**
	 * パスワード再発行
	 */
	public function resetPasswordAction() {
		// 操作ログの登録
		$this->setLog("パスワード再発行", json_encode($this->_getAllParams()));
		// 送信値の取得
		$form = $this->_getAllParams();
		$request = $this->getRequest();
		// 戻り値の宣言[status][1:成功, 0:失敗]
		$result = array("status"=>0, "error"=>"");
		// POST送信の場合のみ登録処理を行う
		if($request->isPost()) {
			// モデルの宣言
			$adminModel = Application_CommonUtil::getInstance('model', "AdminModel", $this->db);
			// トライアルユーザー登録処理
			$result = $adminModel->resetPassword($form);
		}else{
			$result["error"] = "不正なデータ送信です。";
		}
		if($result["status"] == 0){
			// 画面にエラー内容を出さないが、エラー時のみログを出力する
			error_log("passReissueAction:{$result["error"]}");
		}
		exit;
	}

	/**
	 * SPクライアント選択画面
	 */
	public function clientAction(){
		$form = $this->_getAllParams();
		// 操作ログ
		$this->setLog("SPクライアント選択", json_encode($form));
		// daoの宣言
		$masterClientDao = Application_CommonUtil::getInstance('dao', "MasterClientDao", $this->db);
		// 変数宣言
		$clientId = "";
		$errorMsg = "";
		if(array_key_exists("client_id", $form)){
			// クライアントIDが選択された場合はクライアント選択を切り替える
			$form = $this->_getAllParams();
			// モデル宣言
			$clientModel = Application_CommonUtil::getInstance("model", "ClientModel", $this->db);
			// クライアント一覧で選択したクライアントに成り変わる
			$result = $clientModel->changeClient($form['client_id']);
			if($result["errFlg"] == 0){
				// クライアントの切り替え完了
				$this->_redirect('/index/room');
			}else{
				// クライアントの切り替えに失敗した場合はIDとメッセージを画面に返す
				$clientId = $form['client_id'];
				$errorMsg = "クライアントの切り替えに失敗しました。";
			}
		}

		// 表示するクライアント名
		$client_names = array();
		$client_names[] = 'アイドマ';
		$client_names[] = 'meet in';
		$client_names[] = 'Sales Crowd';

		// クライアント選択画面表示
		$this->view->clientList = $masterClientDao->getClientListByClientNames($client_names);
		$this->view->clientId = $clientId;
		$this->view->errorMsg = $errorMsg;
	}

	/**
	 * SPのルーム作成画面
	 */
	public function roomAction(){

		if($this->user == null) {
			$this->_redirect('/index');
		}

		// 操作ログの登録
		$this->setLog("SPルーム作成画面表示", json_encode($this->_getAllParams()));
	}

	/**
	 * SPの非推奨環境エラーページ
	 */
	 public function deprecatedAction() {
 		// 操作ログ
 		$this->setLog("非推奨環境エラー", json_encode($this->_getAllParams()));

		// パラメータを取得
		$room = $this->getRequest()->getQuery('room');

		// iOS、Androidの判定
		$ua = strtolower($_SERVER['HTTP_USER_AGENT']);
		if(strpos($ua, 'iphone') !== false || strpos($ua, 'ipod') !== false || strpos($ua, 'ipad') !== false) {
			$os = 'ios';
		} else {
			$os = 'android';
		}

		$this->view->room = $room;
		$this->view->host = $_SERVER["HTTP_HOST"];
		$this->view->os = $os;
	 }

	 // ルームロック状態取得
	 public function getRoomAction()
	 {
		 $form = $this->_getAllParams();
		 $request =  array(
				 'id' => 'CE18208',
				 'password' => 'Password'
			 );
		 $auth = Zend_Auth::getInstance();
		 if(is_null($auth->getIdentity())){
			$adapter = new Adapter_AuthAdapter($request);
			$resultInput = $auth->authenticate($adapter);
			$resultInput->isValid();
			$this->user = $auth->getIdentity();
			$this->user["login_flg"] = 1;
			$this->user["id"] = $request ["id"];
			$this->user["password"] = $request ["password"];
			$this->user["staff_type"] = "CE";

			// モデル宣言
			$clientModel = Application_CommonUtil::getInstance("model", "ClientModel", $this->db);

			// クライアント一覧で選択したクライアントに成り変わる
			$clientModel->changeClient("2934");

			// クライアント情報を付与した認証情報を保存する
			$clientIdentity = $auth->getIdentity();
			$this->user = array_merge($this->user, $clientIdentity);
			Zend_Auth::getInstance()->getStorage()->write($this->user);
			Zend_Registry::set('user', $this->user);
		 }

		 if (!empty($form['r'])) {
			 $this->redirect("/room/{$form['r']}");
		 }

		 exit;
	 }

	// ゲストのみでルームに入室しようとした場合の画面(?error=10)
	public function serviceEndAction()
	{

	}
}
