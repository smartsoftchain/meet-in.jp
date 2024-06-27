<?php

class NotificationController extends AbstractController {

  public function init(){
    parent::init();
    /* Initialize action controller here */

    // ログインチェック
    $auth = Zend_Auth::getInstance();
    if($auth->hasIdentity() == true){

      // 認証情報取出し
      $user = $auth->getIdentity();

//      // 管理者以外ははじく
//      if($user['staff_role'] != self::ROLE_ADM){
//        // AA管理者以外ならはじく
//        $auth = Zend_Auth::getInstance();
//        $auth->clearIdentity();
//        Zend_Session::destroy();
//        $this->_redirect('/admin/index');
//      }
    }else{
      $form = $this->_getAllParams();
      if($form['action'] != 'index' && $form['action'] != 'login'){
        $this->_redirect('/index');
      }
    }
  }

  /**
   * お知らせ一覧画面
   */
  public function listAction() {
    $form = $this->_getAllParams();

    // モデルの宣言
    $notificationModel = Application_CommonUtil::getInstance("model", "NotificationModel", $this->db);
    $result = $notificationModel->getNotificationList($form, $this->namespace);
    $this->view->list = $result["list"];
  }

  /**
   * お知らせ詳細画面
   */
  public function detailAction() {
    $form = $this->_getAllParams();
    $request = $this->getRequest();

    // モデル宣言
    $notificationModel = Application_CommonUtil::getInstance("model", "NotificationModel", $this->db);
    $notificationStaffReadsModel = Application_CommonUtil::getInstance("model", "NotificationStaffReadsModel", $this->db);

    $id = $form["id"];
    // IDを指定してお知らせを1件取得する
    $result = $notificationModel->getNotification($id);

    // URLをリンクにする
    $result["notification"]["content"] = $this->auto_link($result["notification"]["content"]);

    // 既読お知らせidとして、登録する
    $rtn = $notificationStaffReadsModel->setAlreadyReadNotification($this->user, $id);
    
    // 未読バッジの更新
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

    $this->view->unreadNotificationCount = $unreadNotificationCount;
		$this->view->alreadyReadNotificationsArray = $alreadyReadNotificationsArray;

    $this->view->notification = $result["notification"];
  }

  /**
   * 文字列内のURLをaタグにして返す
   */
  function auto_link($string) {
    // URL形式のチェック用文字列（正規表現）
    $regstr = "https?://[a-zA-Z0-9.-]{2,}(:[0-9]+)?(/[_.!~*a-zA-Z0-9;/?:@&=+$,%#-]+)?/?";
    return ereg_replace($regstr,"<a href=\"\\0\" target=\"_blank\" title=\"\\0\">\\0</a>", $string);
  }

  /**
   * お知らせ一括既読
   */
  public function notificationAllReadAction() {
    $form = $this->_getAllParams();

    // モデル宣言
    $notificationModel = Application_CommonUtil::getInstance("model", "NotificationModel", $this->db);
    $notificationStaffReadsModel = Application_CommonUtil::getInstance("model", "NotificationStaffReadsModel", $this->db);
    
    // 現在表示されているお知らせを、全て既読idとして登録する
    $rtn = $notificationStaffReadsModel->addAlreadyReadNotificationAll($this->user);

    // 未読バッジの更新
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
    
    $this->view->unreadNotificationCount = $unreadNotificationCount;
		$this->view->alreadyReadNotificationsArray = $alreadyReadNotificationsArray;
  }

}
