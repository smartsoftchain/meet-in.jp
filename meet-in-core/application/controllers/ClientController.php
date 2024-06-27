<?php
//require_once 'AbstractController.php';

class ClientController extends AbstractController
{

	public function init(){
		parent::init();
		/* Initialize action controller here */
		// ログインチェック
		$auth = Zend_Auth::getInstance();
		if($auth->hasIdentity() == true){
			// 認証情報取出し
			$user = $auth->getIdentity();
			if($user['staff_type'] != "AA"){
				// AA以外ならはじく
				$auth = Zend_Auth::getInstance();
				$auth->clearIdentity();
				Zend_Session::destroy();
				$this->_redirect('/index');
			}
		}else{
			$this->_redirect('/index');
		}
	}

	/**
	 * クライアント一覧を取得する
	 */
	public function getListAction(){
		$form = $this->_getAllParams();
		// 操作ログ
		$this->setLog("クライアント一覧表示", json_encode($form));
		// モデル宣言
		$clientModel = Application_CommonUtil::getInstance("model", "ClientModel", $this->db);
		// 画面表示に必要なデータを取得
		$clientList = $clientModel->getClientList($form, $this->namespace);

		$result = json_encode($clientList["list"]);
		echo($result);
		exit;
	}

	/**
	 * クライアント一覧を表示する
	 */
	public function listAction(){
		$form = $this->_getAllParams();
		// 操作ログ
		$this->setLog("クライアント一覧表示", json_encode($form));
		// モデル宣言
		$clientModel = Application_CommonUtil::getInstance("model", "ClientModel", $this->db);
		// 画面表示に必要なデータを取得
		$result = $clientModel->getClientList($form, $this->namespace);

		// smartyにデータを設定する
		$this->view->list = $result["list"];
		$this->view->freeWord = $this->namespace->free_word;
		$this->view->err = $this->namespace->err;
	}

	/**
	 * 自身のクライアント情報をセッションに設定する
	 */
	public function changeAction(){
		// クライアント選択の切替
		$form = $this->_getAllParams();
		// 操作ログ
		$this->setLog("クライアント選択完了", json_encode($form));
		// モデル宣言
		$clientModel = Application_CommonUtil::getInstance("model", "ClientModel", $this->db);
		$apiModel = Application_CommonUtil::getInstance("model", "ApiModel", $this->db);

		// クライアント一覧で選択したクライアントに成り変わる
		$result = $clientModel->changeClient($form['client_id']);

		// 自動ログイン情報更新(client_id)
		if ( !empty( $_COOKIE['auto_login'] )) {
error_log("changeAction 自動ログイン[".$_COOKIE['auto_login']."] クライアントID更新=[". $form['client_id'] ."]\n", 3, "/var/tmp/negotiation.log");
			$apiModel->updateAutoLoginClientId($_COOKIE['auto_login'],$form['client_id']);
		}

		// ラクラク電子契約APIのクレデンシャル、印影画像、電子証明書有無データを削除
		$session = Application_CommonUtil::unsetSession("e_contract_api");

		// 選択したクライアント情報を入れて、未読お知らせ関連の値を取得し直す 設定し直さないと、以前のクライアント情報の値が入ってしまう。
		$this->user['client_id'] = $form['client_id'];  // 選択したクライアントID
		// room内ログイン時はformにないためnullになる $this->user['staff_id']をそのまま使う
		if (!empty($form['staff_id'])) {
			$this->user['staff_id'] = $form['staff_id'];
		}
		$this->user['staff_type'] = 'AA'; // AA決め打ち

		// クライアント変更時に、お知らせ未読関連の値を取得し直す
		$this->fetchUnreadNotifications();

		$session = Application_CommonUtil::getSession('notification');
		$unreadNotificationCount = $session->unreadNotificationCount;

		$this->view->unreadNotificationCount = $unreadNotificationCount;


		// 処理結果を返す
		$resultJson = json_encode($result);
		echo $resultJson;
		exit;
		// changeClient()の結果により遷移先を変える
// 		if($result["errFlg"]){
// 			// クライアント一覧へ遷移する
// 			$this->_redirect("/client/list?err=1");
// 		}else{
// 			// メニューへ遷移する
// 			$this->_redirect("/index/menu");
// 		}
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

			// お知らせ関連のセッション値クリア
			Application_CommonUtil::unsetSession('notification');
	
			// セッションに既読お知らせ関連の値を設定する
			$session = Application_CommonUtil::getSession('notification');

			$session->alreadyReadNotifications = $alreadyReadNotifications;
			$session->alreadyReadNotificationsArray = $alreadyReadNotificationsArray;
			$session->unreadNotificationCount = $unreadNotificationCount;

		}
	}
}
