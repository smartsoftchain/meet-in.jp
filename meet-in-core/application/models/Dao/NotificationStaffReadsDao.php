<?php

/**
 * NotificationStaffReadsDao クラス
 *
 * お知らせの既読管理を扱うDaoクラス
 *
 * @version 2021/06/08 16:08 miura
 * @package Dao
*/
class NotificationStaffReadsDao extends AbstractDao {

  const TABLE_NAME = "notification_staff_reads";

  private $db;

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
    $clientId = $user["client_id"];
    $staffId = $user["staff_id"];
    $staffType = $user["staff_type"];

    $sql = "SELECT 
              already_read_notification_id_list
            FROM 
              notification_staff_reads
            WHERE
              client_id = {$clientId} and staff_id = {$staffId} and staff_type = '{$staffType}'
            ";
    $result = $this->db->fetchRow($sql, array());

    
    return $result;
  }

  /**
   * 既読お知らせを追加する
   * @param Array $user ユーザー情報
   * @param number $notificationId　開いたお知らせId
   * @return unknown
  */
  public function setAlreadyReadNotification($user, $notificationId) {

    $clientId = $user['client_id'];
    $staffId = $user['staff_id'];
    $staffType = $user['staff_type'];

    $existRecord = $this->getAlreadyReadNotificationsId($user);

    // トランザクションスタート
    $this->db->beginTransaction();

    try {
      if ($existRecord == false) {
        // レコードない場合は　インサート
        $sql = "INSERT INTO
                  notification_staff_reads
                  (client_id, staff_id, staff_type, already_read_notification_id_list, create_date, update_date) VALUES ({$clientId}, {$staffId}, '{$staffType}', ',{$notificationId}', now(), now())
                ";
      } else {
        // レコードがある場合は 更新（UPDATE）
        $sql = "UPDATE
                  notification_staff_reads
                SET
                  already_read_notification_id_list = CONCAT(`already_read_notification_id_list`, ',{$notificationId}'),
                  update_date = now()
                WHERE
                  client_id = {$clientId} and staff_id = {$staffId} and staff_type = '{$staffType}'
                ";
      }
      $this->db->query($sql);
      // 登録完了したらコミットする
      $this->db->commit();
    } catch(Exception $e) {
      $this->db->rollBack();
      throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
    }
  }

  /**
   * 一括で既読お知らせを追加する
   * @param Array $user ユーザー情報
   * @return unknown
  */
  public function addAlreadyReadNotificationAll($user) {

  $clientId = $user['client_id'];
  $staffId = $user['staff_id'];
  $staffType = $user['staff_type'];

  $existRecord = $this->getAlreadyReadNotificationsId($user);

    // トランザクションスタート
    $this->db->beginTransaction();
    try {
      if ($existRecord == false) {
        // レコードない場合は　インサート
        $sql = "INSERT INTO
          notification_staff_reads
          (client_id, staff_id, staff_type, already_read_notification_id_list, create_date, update_date) 
          VALUES ({$clientId}, {$staffId}, '{$staffType}', 
            (
              SELECT CONCAT(',', GROUP_CONCAT(id)) as already_read_notification_id_list
              FROM notification
              WHERE display_flg = 1 and del_flg = 0
            )
          , now(), now())
        ";
    } else {
        $sql = "UPDATE
                  notification_staff_reads
                SET
                  already_read_notification_id_list = (
                    SELECT CONCAT(',', GROUP_CONCAT(id)) as already_read_notification_id_list
                    FROM notification
                    WHERE display_flg = 1 and del_flg = 0
                    ),
                  update_date = now()
                WHERE
                  client_id = {$clientId} and staff_id = {$staffId} and staff_type = '{$staffType}'
                ";
    }
      // 更新
      $this->db->query($sql);
      // 登録完了したらコミットする
      $this->db->commit();
    } catch(Exception $e) {
      $this->db->rollBack();
      throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
    }
  }
}
