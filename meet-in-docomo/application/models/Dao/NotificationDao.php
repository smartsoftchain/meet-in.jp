<?php

/**
 * NotificationDao クラス
 *
 * お知らせのデータを扱うDaoクラス
 *
 * @version 2019/08/02 13:53 takeura
 * @package Dao
*/
class NotificationDao extends AbstractDao {

  const TABLE_NAME = "notification";

  private $db;

  function __construct($db) {
    parent::init();
    $this->db = $db;
  }

  /**
   * 条件を指定してお知らせの件数を取得する
   * @param unknown $condition 検索条件
   * @return unknown
  */
  public function getNotificationCount($condition) {
    $sql = "SELECT
          COUNT(id) as count
        FROM
          notification
        WHERE
          {$condition};
    ";
    $rtn = $this->db->fetchRow($sql, array());
    return $rtn["count"];
  }

  /**
   * 条件を指定しお知らせ一覧を取得する
   * @param unknown $condition	検索条件
   * @param unknown $order		ソートを行う為のカラム
   * @param unknown $ordertype	昇順、降順
   * @param unknown $page			ページインデックス
   * @param unknown $limit		データ取得件数
   * @return unknown
  */
  public function getNotificationList($condition, $order, $ordertype, $page, $limit) {
    $offset = 0;
    $page = $page - 1;
    if($page > 0) {
      $offset = $page * $limit;
    }
    $sql = "SELECT
        id,
        title,
        content,
        post_date,
        display_flg,
        create_date,
        update_date
      FROM
        notification
      WHERE
        {$condition}
      ORDER BY
        {$order} {$ordertype}
      LIMIT
        {$limit}
      OFFSET
        {$offset};
    ";
    $rtn = $this->db->fetchALL($sql, array());
    return $rtn;
  }

  /**
   * お知らせを登録する
   * @param unknown $form
   * @return unknown
  */
  public function setNotification($form) {
    $record = array(
      'title'       => $form["title"],
      'content'     => $form["content"],
      'post_date'   => $form["post_date"],
      'display_flg' => $form["display_flg"],
      'update_date' =>  new Zend_Db_Expr('now()')
    );

    if(!array_key_exists("id", $form) || $form["id"] == '') {
      $record['create_date'] = new Zend_Db_Expr('now()');
      // 新規登録
      $this->db->insert('notification', $record);
    } else {
      // 更新
      $this->db->update('notification', $record, "id = {$form['id']}");
    }
  }

  /**
   * idを指定して、お知らせ1件取得する
   */
  public function getNotificationRow($id) {
    $sql = "SELECT
        id,
        title,
        content,
        post_date,
        display_flg,
        create_date,
        update_date
      FROM
        notification
      WHERE
        id = :id
      AND
        del_flg = 0;
    ";
    $rtn = $this->db->fetchRow($sql, array("id" => $id));
    return $rtn;
  }

  /**
   * お知らせを論理削除する
   */
  public function deleteNotification($id) {
    // お知らせを論理削除する
    $record["del_flg"] = "1";
    $this->db->update('notification', $record, "id = {$id}");
  }

  /**
   * 表示ステータスの最新のお知らせを1件取得する
   */
  public function getDisplayNotification($alreadyReadNotifications) {

    // SQL　条件の初期値を設定
    $condition = 'WHERE display_flg =' . 1 . ' and del_flg ='. 0;
    if (is_array($alreadyReadNotifications) && !empty($alreadyReadNotifications)) {
      // 既読を持ってる場合に整形する
      // 与えられた配列をSQL上で使用するためカンマ区切りに整形
      $formatData = implode(',', $alreadyReadNotifications);
      // 1文字目の","を削除
      $formatData = ltrim($formatData, ',');
      // 既読を持ってる場合は、条件変更(not in含むものに)
      $condition = 'WHERE id not in ('.$formatData.')' . ' and display_flg =' . 1 . ' and del_flg ='. 0;
    }

    $sql = "SELECT
        id,
        title,
        content,
        post_date,
        display_flg,
        create_date,
        update_date
      FROM
        notification
      $condition
      ORDER BY
        post_date DESC;
    ";
    $rtn = $this->db->fetchRow($sql);

    return $rtn;
  }

  /**
   * 未読お知らせ件数を取得する
   * @param Array $alreadyReadNotifications 既読お知らせid配列
   * @return number $unread_count 未読お知らせ件数
   */
  public function getUnreadNotificationCount($alreadyReadNotifications) {
    
    // SQL　条件の初期値を設定
    $condition = 'WHERE display_flg =' . 1 . ' and del_flg ='. 0;
    // 1つのとき、配列じゃないため以下ではだめ。
    if (is_array($alreadyReadNotifications) && !empty($alreadyReadNotifications)) {
      // 既読を持ってる場合に整形する
      // 与えられた配列をSQL上で使用するためカンマ区切りに整形
      $formatData = implode(',', $alreadyReadNotifications);
      // 1文字目の","を削除
      $formatData = ltrim($formatData, ',');
      // 既読を持ってる場合は、条件変更(not in含むものに)
      $condition = 'WHERE id not in ('.$formatData.')' . ' and display_flg =' . 1 . ' and del_flg ='. 0;
    }
    
      $sql = "SELECT
                COUNT(*) 
              FROM 
                notification
              $condition
              ";
      $unread_count = $this->db->fetchRow($sql);
      // 配列で返ってくるため、数値に変換
      $unread_count = intval($unread_count["COUNT(*)"]);

    return $unread_count;
  }

}
