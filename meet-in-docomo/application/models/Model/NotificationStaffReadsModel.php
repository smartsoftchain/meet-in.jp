<?php

/**
 * お知らせ既読管理用モデル
 *
 */
class NotificationStaffReadsModel extends AbstractModel {

  const IDENTIFIER = "notificationStaffReads";

  private $db;    // DBコネクション

  function __construct($db) {
    parent::init();
    $this->db = $db;
  }

  /**
   * スタッフid, スタッフタイプを指定して既読お知らせidを配列で取得する
   * @param Array $user ユーザー情報
   * @return Array 既読idの配列
  */
  public function getAlreadyReadNotificationsId($user) {
    // 戻り値を宣言
    $result = array();
    // Daoの宣言
    $notificationStaffReadsDao = Application_CommonUtil::getInstance("dao", "NotificationStaffReadsDao", $this->db);
    // 既読お知らせidを取得する
    $result = $notificationStaffReadsDao->getAlreadyReadNotificationsId($user);
    
    return $result;
  }

  /**
   * 既読お知らせを追加する
   * @param Array $user ユーザー情報
   * @param number $notificationId　開いたお知らせId
   * @return unknown
  */
  public function setAlreadyReadNotification($user, $notificationId) {
    // Daoの宣言
    $notificationStaffReadsDao = Application_CommonUtil::getInstance("dao", "NotificationStaffReadsDao", $this->db);
    // 指定ユーザーに既読お知らせを追加する
    $notificationStaffReadsDao->setAlreadyReadNotification($user, $notificationId); 
  }

  /**
   * 一括で既読お知らせを追加する
   * @param Array $user ユーザー情報
   * @return unknown
  */
  public function addAlreadyReadNotificationAll($user) {
    // Daoの宣言
    $notificationStaffReadsDao = Application_CommonUtil::getInstance("dao", "NotificationStaffReadsDao", $this->db);
    // 指定ユーザーに一括で既読お知らせを追加する
    $notificationStaffReadsDao->addAlreadyReadNotificationAll($user); 
  }

}
