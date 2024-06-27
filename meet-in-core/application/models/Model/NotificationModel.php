<?php

/**
 * お知らせ画面用モデル
 *
 */
class NotificationModel extends AbstractModel {

  const IDENTIFIER = "notification";

  private $db;    // DBコネクション

  function __construct($db) {
    parent::init();
    $this->db = $db;
  }

  /**
   * お知らせ一覧を取得する
   */
  public function getNotificationList($form, &$screenSession) {
    // セッションの初期化
    if($screenSession->isnew == true) {
      $screenSession->order = 'post_date';
      $screenSession->page = 1;
      $screenSession->pagesize = 20;
      $screenSession->orderType = 'desc';
      $screenSession->free_word = "";
    }
    // パラメータをセッションに格納
    foreach($form as $key => $val) {
      $screenSession->$key = $val;
    }
    // Daoの宣言
    $notificationDao = Application_CommonUtil::getInstance('dao', "NotificationDao", $this->db);
    // 変数の宣言
    $condition = " del_flg = 0 and display_flg = 1";
    // 検索実施
    $notificationCount = $notificationDao->getNotificationCount($condition);
    $notificationList = $notificationDao->getNotificationList($condition, $screenSession->order, $screenSession->orderType, $screenSession->page, $screenSession->pagesize);
    // ページャ設定
    $list = new Application_Pager(array(
      "itemData" => $notificationList,
      "itemCount" => $notificationCount,
      "parPage" => $screenSession->pagesize,
      "curPage" => $screenSession->page,
      "order" => $screenSession->order,
      "orderType" => $screenSession->orderType
    ));
    // 戻り値を作成する
    $result["list"] = $list;
    $resultl["registMsg"] = "";
    // セッションを取得
    $session = Application_CommonUtil::getSession(self::IDENTIFIER);
    if(!is_null($session->registComplete)) {
      // セッション情報を初期化する
      Application_CommonUtil::unsetSession(self::IDENTIFIER);
      // メッセージを設定する
      $result["registMsg"] = $this->message->success->regist->notification;
    }
    return $result;
  }

  /**
   * IDを指定してお知らせを1件取得する
   */
  public function getNotification($id) {
    // 戻り値を宣言
    $result = array();
    // Daoの宣言
    $notificationDao = Application_CommonUtil::getInstance("dao", "NotificationDao", $this->db);
    // IDを指定してお知らせを1件取得する
    $notification = $notificationDao->getNotificationRow($id);
    // 画面に表示するデータを戻り値に設定する
    $result["notification"] = $notification;

    return $result;
  }

  /**
   * 既読お知らせid[]を指定して未読お知らせ件数を取得する
   */
  public function getUnreadNotificationCount($alreadyReadNotifications) {
    // Daoの宣言
    $notificationDao = Application_CommonUtil::getInstance("dao", "NotificationDao", $this->db);
    // 既読お知らせを指定して未読お知らせ件数取得する
    $unread_notification_count = $notificationDao->getUnreadNotificationCount($alreadyReadNotifications);
    
    return $unread_notification_count;
  }

}
