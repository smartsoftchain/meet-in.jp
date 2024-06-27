<?php

/**
 * EContractCaseDao クラス
 *
 * 電子契約案件データを扱うDaoクラス
 *
 * @version 2019/10/30 takeura
 * @package Dao
*/
class EContractCaseDao extends AbstractDao {

  private $db;

  function __construct($db){
    parent::init();
    $this->db = $db;
  }

  /**
  * 案件情報を登録する
  * @param unknown
  * @return unknown
  */
  public function setCase($form) {
   $record['callup_contract_type'] = $form['callup_contract_type'];
   $record['e_contract_document_id'] = $form['e_contract_document_id'];
   $record['client_id']         = $form['client_id'];
   $record['staff_type']        = $form['staff_type'];
   $record['staff_id']          = $form['staff_id'];
   $record['case_title']        = $form['case_title'];
   $record['have_amount']       = $form['have_amount'];
   if($form['amount'] != '') {
     $record['amount']            = $form['amount'];
   }
   if($form['agreement_date'] != '') {
     $record['agreement_date']    = $form['agreement_date'];
   }
   if($form['effective_date'] != '') {
     $record['effective_date']    = $form['effective_date'];
   }
   if($form['expire_date'] != '') {
     $record['expire_date']       = $form['expire_date'];
   }
   $record['auto_renewal']             = $form['auto_renewal'];
   $record['approval_method']          = $form['approval_method'];
   $record['management_number']        = $form['management_number'];
   $record['comment']                  = $form['comment'];
   $record['create_date']              = new Zend_Db_Expr('now()');
   $record['update_date']              = new Zend_Db_Expr('now()');
   $this->db->insert('e_contract_case', $record);
   $sql = "SELECT
         MAX(id) as max_case_id
       FROM
         e_contract_case
       WHERE
         1
       ";
  $rtn = $this->db->fetchRow($sql, array());
  $result["case"] = $record;
  $result["case"]["case_id"] = $rtn["max_case_id"];
  return $result;
  }


  /**
  * 契約書ごとの　パートナーの承認状況をリストアップする.
  * @param unknown $condition  検索条件
  * @return unknown
  */
  public function getPartnerCountApprovalStatusList($clientId) {

    // MEMO.
    // かなりの数の契約書が「電子契約書作成中」にユーザによってタブ閉じされて放棄されていると思われ、それらは非表示にしておきたい.
    // null_target_count = 電子契約書2ページ目のバリデーション対象 パーツを設定し終わると selfかpartnerが入る nullがあるうちは3ページ目に行けない=署名依頼のメール送信前の契約書と判断している.

    $sql = "SELECT
      a.id AS case_id,
      a.uid,
      count(b.id) AS partner_count,
      sum(CASE WHEN b.approval_status = 0 THEN 1 ELSE 0 END) AS waiting_count,
      sum(CASE WHEN b.approval_status = 1 THEN 1 ELSE 0 END) AS approval_count,
      sum(CASE WHEN b.approval_status = 2 THEN 1 ELSE 0 END) AS canceled_count,
      (select count(id) from e_contract_input where a.id = e_contract_case_id AND target is null) as null_target_count
    FROM
      e_contract_case AS a
      LEFT JOIN e_contract_partner2 AS b ON a.id = b.e_contract_case_id
    WHERE
      a.client_id = {$clientId} GROUP BY a.id
    ;";

    $rtn = $this->db->fetchAll($sql, array());
    return $rtn;
  }


  /**
   * 条件を指定し確認中の電子契約書一覧を取得する
   * @param unknown $condition  検索条件
   * @param unknown $order    ソートを行う為のカラム
   * @param unknown $ordertype  昇順、降順
   * @param unknown $page      ページインデックス
   * @param unknown $limit    データ取得件数
   * @return unknown
   */
  public function getEContractCaseList($clientId, $order, $ordertype, $page, $limit, $excludeCondition, $condition) {

    if(!empty($excludeCondition) && !empty($condition)) {
      $where_query = "WHERE {$excludeCondition} AND {$condition}";
    } else if(!empty($excludeCondition) && empty($condition)) {
      $where_query = "WHERE {$excludeCondition}";
    } else if(empty($excludeCondition) && !empty($condition)) {
      $where_query = "WHERE {$condition}";
    } else {
      $where_query = null;
    }

    $sql = "SELECT
          id,
          case_title,
          update_date,
          (
            SELECT
              COUNT(id)
            FROM
              e_contract_partner2
            WHERE
              e_contract_case_id = e_contract_case.id
          ) AS partner_count,
          (
            SELECT
              COUNT(id)
            FROM
              e_contract_partner2
            WHERE
              e_contract_case_id = e_contract_case.id
            AND
              approval_status = 1
          ) AS approval_count
        FROM
          e_contract_case
        {$where_query} AND delete_date IS NULL
        GROUP BY
          id
        ORDER BY
          {$order} {$ordertype}";

    if($page >= 1) {
      $offset = 0;
      $page = $page - 1;
      $offset = $page * $limit;
      $sql = $sql." LIMIT {$limit} OFFSET {$offset};";
    }
    $rtn = $this->db->fetchAll($sql, array());
    return $rtn;
  }


  /**
  * ゲストの持つ確認中の電子契約書の件数を取得する
  * @param unknown $condition  検索条件
  * @return unknown
  */
  public function getConfirmingCountWithEmail($email, $excludeCondition, $condition) {
    $sql = "SELECT
         COUNT(DISTINCT id) as count
       FROM
         e_contract_case
        WHERE
         id IN (
           SELECT
             e_contract_case_id
           FROM
             e_contract_partner2
           WHERE
             email = '{$email}'
           AND
             approval_status = 0
           GROUP BY
             e_contract_case_id
           HAVING
             e_contract_case_id NOT IN (
               SELECT
                 e_contract_case_id
               FROM
                 e_contract_partner2
               WHERE
                 approval_status = 2
             )
         )
       {$excludeCondition}
       {$condition} AND delete_date IS NULL
       ;
     ";
    $rtn = $this->db->fetchRow($sql, array());
    return $rtn["count"];
   }


  /**
  * ゲストの持つ契約済みの電子契約書の件数を取得する
  * @param unknown $condition  検索条件
  * @return unknown
  */
  public function getCompletedCountWithEmail($email, $condition) {
    $sql = "SELECT
         COUNT(DISTINCT id) as count
       FROM
         e_contract_case
       WHERE
         id IN (
           SELECT
             e_contract_case_id
           FROM
             e_contract_partner2
           WHERE
             email = '{$email}'
           AND
             approval_status = 1
           GROUP BY
             e_contract_case_id
           HAVING
             e_contract_case_id NOT IN (
               SELECT
                 DISTINCT e_contract_case_id
               FROM
                 e_contract_partner2
               WHERE
                 approval_status IN (0, 2)
             )
         )
       {$condition} AND delete_date IS NULL
       ;
     ";
    $rtn = $this->db->fetchRow($sql, array());
    return $rtn["count"];
  }


  /**
  * ゲストの持つ却下されたの電子契約書の件数を取得する
  * @param unknown $condition  検索条件
  * @return unknown
  */
  public function getCanceledCountWithEmail($email, $condition) {
    $sql = "SELECT
         COUNT(DISTINCT id) as count
       FROM
         e_contract_case
       WHERE
         id IN (
           SELECT
             DISTINCT e_contract_case_id
           FROM
             e_contract_partner2
           WHERE
             email = '{$email}'
           AND
             approval_status = 2
         )
       {$condition} AND delete_date IS NULL
       ;
     ";
    $rtn = $this->db->fetchRow($sql, array());
    return $rtn["count"];
  }

  /**
  * 企業の持つ却下されたの電子契約書のinput、form件数を取得する
  * @param unknown $condition  検索条件
  * @return unknown
  */
  public function getCountList($clientId) {
    $sql = "SELECT
          id,
          (
            SELECT
              COUNT(id)
            FROM
              e_contract_input
            WHERE
              e_contract_case_id = e_contract_case.id
          ) AS input_count,
          (
            SELECT
              COUNT(a.id)
            FROM
              e_contract_form AS a
            INNER JOIN
              e_contract_file AS b
            ON
              a.e_contract_file_id = b.id
            INNER JOIN
              e_contract_document AS c
            ON
              b.e_contract_document_id = c.id
            WHERE
              c.id = e_contract_case.e_contract_document_id
          ) AS form_count
        FROM
          e_contract_case
        WHERE
          e_contract_document_id IN (
            SELECT
              id
            FROM
              e_contract_document
            WHERE
              client_id = {$clientId}
          )
        AND
          id IN (
            SELECT
              e_contract_case_id
            FROM
              e_contract_partner2
            WHERE
              approval_status = 0
            GROUP BY
              e_contract_case_id
            HAVING
              e_contract_case_id NOT IN (
                SELECT
                  e_contract_case_id
                FROM
                  e_contract_partner2
                WHERE
                  approval_status = 2
              )
          )
        GROUP BY
          id
    ";

    $rtn = $this->db->fetchAll($sql, array());
    return $rtn;
  }


  /**
  * 企業の持つ却下されたの電子契約書のinput、form件数を取得する
  * @param unknown $condition  検索条件
  * @return unknown
  */
  public function getCountListWithEmail($email) {
    $sql = "SELECT
          id,
          (
            SELECT
              COUNT(id)
            FROM
              e_contract_input
            WHERE
              e_contract_case_id = e_contract_case.id
          ) AS input_count,
          (
            SELECT
              COUNT(a.id)
            FROM
              e_contract_form AS a
            INNER JOIN
              e_contract_file AS b
            ON
              a.e_contract_file_id = b.id
            INNER JOIN
              e_contract_document AS c
            ON
              b.e_contract_document_id = c.id
            WHERE
              c.id = e_contract_case.e_contract_document_id
          ) AS form_count
        FROM
          e_contract_case
        WHERE
          id IN (
            SELECT
              e_contract_case_id
            FROM
              e_contract_partner2
            WHERE
              approval_status = 0
            AND
              email = '{$email}'
            GROUP BY
              e_contract_case_id
            HAVING
              e_contract_case_id NOT IN (
                SELECT
                  e_contract_case_id
                FROM
                  e_contract_partner2
                WHERE
                  approval_status = 2
              )
          )
        GROUP BY
          id
    ";
    $rtn = $this->db->fetchAll($sql, array());
    return $rtn;
  }

  /**
   * 条件を指定し確認中の電子契約書一覧を取得する
   * @param unknown $condition  検索条件
   * @param unknown $order    ソートを行う為のカラム
   * @param unknown $ordertype  昇順、降順
   * @param unknown $page      ページインデックス
   * @param unknown $limit    データ取得件数
   * @return unknown
   */
  public function getConfirmingList($clientId, $order, $ordertype, $page, $limit, $excludeCondition, $condition) {
    $offset = 0;
    $page = $page - 1;
    if($page > 0) {
      $offset = $page * $limit;
    }
    $sql = "SELECT
          id,
          case_title,
          update_date,
          (
            SELECT
              COUNT(id)
            FROM
              e_contract_partner2
            WHERE
              e_contract_case_id = e_contract_case.id
          ) AS partner_count,
          (
            SELECT
              COUNT(id)
            FROM
              e_contract_partner2
            WHERE
              e_contract_case_id = e_contract_case.id
            AND
              approval_status = 1
          ) AS approval_count
        FROM
          e_contract_case
        WHERE
          e_contract_document_id IN (
            SELECT
              id
            FROM
              e_contract_document
            WHERE
              client_id = {$clientId}
          )
        AND
          id IN (
            SELECT
              e_contract_case_id
            FROM
              e_contract_partner2
            WHERE
              approval_status = 0
            GROUP BY
              e_contract_case_id
            HAVING
              e_contract_case_id NOT IN (
                SELECT
                  e_contract_case_id
                FROM
                  e_contract_partner2
                WHERE
                  approval_status = 2
              )
          )
        {$excludeCondition}
        {$condition} AND delete_date IS NULL
        GROUP BY
          id
        ORDER BY
          {$order} {$ordertype}
        LIMIT
          {$limit}
        OFFSET
          {$offset};
    ";
    $rtn = $this->db->fetchAll($sql, array());
    return $rtn;
  }

  /**
   * 条件を指定し確認中の電子契約書一覧を取得する
   * @param unknown $condition  検索条件
   * @param unknown $order    ソートを行う為のカラム
   * @param unknown $ordertype  昇順、降順
   * @param unknown $page      ページインデックス
   * @param unknown $limit    データ取得件数
   * @return unknown
   */
  public function getConfirmingListWithEmail($email, $order, $ordertype, $page, $limit, $excludeCondition, $condition) {
    $offset = 0;
    $page = $page - 1;
    if($page > 0) {
      $offset = $page * $limit;
    }
    $sql = "SELECT
          id,
          case_title,
          update_date,
          (
            SELECT
              COUNT(id)
            FROM
              e_contract_partner2
            WHERE
              e_contract_case_id = e_contract_case.id
          ) AS partner_count,
          (
            SELECT
              COUNT(id)
            FROM
              e_contract_partner2
            WHERE
              e_contract_case_id = e_contract_case.id
            AND
              approval_status = 1
          ) AS approval_count
        FROM
          e_contract_case
        WHERE
          id IN (
            SELECT
              e_contract_case_id
            FROM
              e_contract_partner2
            WHERE
              email = '{$email}'
            AND
              approval_status = 0
            GROUP BY
              e_contract_case_id
            HAVING
              e_contract_case_id NOT IN (
                SELECT
                  e_contract_case_id
                FROM
                  e_contract_partner2
                WHERE
                  approval_status = 2
              )
          )
        {$excludeCondition}
        {$condition} AND delete_date IS NULL
        GROUP BY
          id
        ORDER BY
          {$order} {$ordertype}
        LIMIT
          {$limit}
        OFFSET
          {$offset};
    ";
    $rtn = $this->db->fetchAll($sql, array());
    return $rtn;
  }


  /**
   * 条件を指定し契約済みの電子契約書一覧を取得する
   * @param unknown $condition  検索条件
   * @param unknown $order    ソートを行う為のカラム
   * @param unknown $ordertype  昇順、降順
   * @param unknown $page      ページインデックス
   * @param unknown $limit    データ取得件数
   * @return unknown
   */
  public function getCompletedListWithEmail($email, $order, $ordertype, $page, $limit, $condition) {
    $offset = 0;
    $page = $page - 1;
    if($page > 0) {
      $offset = $page * $limit;
    }
    $sql = "SELECT
          id,
          case_title,
          update_date,
          (
            SELECT
              COUNT(id)
            FROM
              e_contract_partner2
            WHERE
              e_contract_case_id = e_contract_case.id
          ) AS partner_count,
          (
            SELECT
              COUNT(id)
            FROM
              e_contract_partner2
            WHERE
              e_contract_case_id = e_contract_case.id
            AND
              approval_status = 1
          ) AS approval_count
        FROM
          e_contract_case
        WHERE
          id IN (
          SELECT
              e_contract_case_id
          FROM
            e_contract_partner2
          WHERE
            email = '{$email}'
          AND
            approval_status = 1
          GROUP BY
            e_contract_case_id
          HAVING
            e_contract_case_id NOT IN (
              SELECT
                DISTINCT e_contract_case_id
              FROM
                e_contract_partner2
              WHERE
                approval_status IN (0, 2)
            )
        )
        {$condition}
        GROUP BY
          id
        ORDER BY
          {$order} {$ordertype}
        LIMIT
          {$limit}
        OFFSET
          {$offset};
    ";
    $rtn = $this->db->fetchAll($sql, array());
    return $rtn;
  }


  /**
  * 条件を指定し却下された電子契約書一覧を取得する
  * @param unknown $condition  検索条件
  * @param unknown $order    ソートを行う為のカラム
  * @param unknown $ordertype  昇順、降順
  * @param unknown $page      ページインデックス
  * @param unknown $limit    データ取得件数
  * @return unknown
  */
  public function getCanceledListWithEmail($email, $order, $ordertype, $page, $limit, $condition) {
    $offset = 0;
    $page = $page - 1;
    if($page > 0) {
      $offset = $page * $limit;
    }
    $sql = "SELECT
          id,
          case_title,
          update_date,
          (
            SELECT
              COUNT(id)
            FROM
              e_contract_partner2
            WHERE
              e_contract_case_id = e_contract_case.id
          ) AS partner_count,
          (
            SELECT
              COUNT(id)
            FROM
              e_contract_partner2
            WHERE
              e_contract_case_id = e_contract_case.id
            AND
              approval_status = 1
          ) AS approval_count
        FROM
          e_contract_case
        WHERE
          id IN (
            SELECT
              DISTINCT e_contract_case_id
            FROM
              e_contract_partner2
            WHERE
              email = '{$email}'
            AND
              approval_status = 2
          )
        {$condition} AND delete_date IS NULL
        GROUP BY
          id
        ORDER BY
          {$order} {$ordertype}
        LIMIT
          {$limit}
        OFFSET
          {$offset};
    ";
    $rtn = $this->db->fetchAll($sql, array());
    return $rtn;
  }

  /**
  * 電子契約書案件を1件取得
  * @param unknown $condition
  * @throws Exception
  */
  public function getCase($condition) {
    $sql = "SELECT
        id,
        uid,
        callup_contract_type,
        e_contract_document_id,
        client_id,
        staff_type,
        staff_id,
        case_title,
        have_amount,
        amount,
        agreement_date,
        effective_date,
        expire_date,
        auto_renewal,
        management_number,
        approval_method,
        comment,
        delete_date
      FROM
        e_contract_case
      WHERE
        {$condition}
    ;";
    $return = $this->db->fetchRow($sql, array());
    return $return;
  }

  /**
  * 電子契約書案件を複数件取得
  * @param unknown $condition
  * @throws Exception
  */
  public function getCaseAll($condition) {
    $sql = "SELECT
        id,
        uid,
        callup_contract_type,
        e_contract_document_id,
        client_id,
        staff_type,
        staff_id,
        case_title,
        have_amount,
        amount,
        agreement_date,
        effective_date,
        expire_date,
        auto_renewal,
        approval_method,
        management_number,
        comment
      FROM
        e_contract_case
      WHERE
        {$condition}
    ;";
    $return = $this->db->fetchAll($sql, array());
    return $return;
  }


  /**
  * APIのuidを保存する
  * @param unknown $condition
  * @throws Exception
  */
  public function updateUid($uid, $condition) {
    $record['uid'] = $uid;
    $this->db->update('e_contract_case', $record, $condition);
  }

  /**
  * APIのuidを保存する
  * @param unknown $condition
  * @throws Exception
  */
  public function updateDocumentID($id, $e_contract_document_id) {
    $record['e_contract_document_id'] = $e_contract_document_id;
    return $this->db->update('e_contract_case', $record, "id={$id}");
  }


  /**
  * 案件情報を更新する
  * @param unknown
  * @return unknown
  */
  public function updateCase($form, $condition) {
    $record['callup_contract_type'] = $form['callup_contract_type'];
    $record['e_contract_document_id'] = $form['e_contract_document_id'];
    $record['case_title']        = $form['case_title'];
    $record['have_amount']       = $form['have_amount'];
    if($form['amount'] != '') {
      $record['amount']            = $form['amount'];
    }
    if($form['agreement_date'] != '') {
      $record['agreement_date']    = $form['agreement_date'];
    }
    if($form['effective_date'] != '') {
      $record['effective_date']    = $form['effective_date'];
    }
    if($form['expire_date'] != '') {
      $record['expire_date']       = $form['expire_date'];
    }
    $record['auto_renewal']             = $form['auto_renewal'];
    $record['management_number']        = $form['management_number'];
    $record['approval_method']          = $form['approval_method'];
    $record['comment']                  = $form['comment'];
    $record['update_date']              = new Zend_Db_Expr('now()');
    $this->db->update('e_contract_case', $record, $condition);
  }

  /**
  * パートナー情報により案件の件数を確認する
  * @param unknown
  * @throws Exception
  */
  public function getCaseCountWithPartner($caseId, $email) {
    $sql = "SELECT
      COUNT(id) AS count
    FROM
      e_contract_case
    WHERE
      id = {$caseId}
    AND
      id IN (
        SELECT
          e_contract_case_id
        FROM
          e_contract_partner2
        WHERE
          email = '{$email}'
      )
    ;";
    $return = $this->db->fetchRow($sql, array());

    return $return['count'];
  }

  /**
  * 案件情報を論理削除する.
  * @param  int $id:        e_contract_case.id
  * @return unknown
  */
  public function softDeleteCase($id) {
    $record['delete_date'] = new Zend_Db_Expr('now()');
    $this->db->update('e_contract_case', $record, "id={$id}");
    return $return;
  }

}
