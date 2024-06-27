<?php
/**
 * EContractPartnerDao クラス
 * 電子契約API パートナーデータを扱うDaoクラス
 * @package Dao
*/
class EContractPartnerDao extends AbstractDao {

  private $db;

  function __construct($db){
    parent::init();
    $this->db = $db;
  }

  /**
  * 電子契約API 契約一時保管データ登録
  */
  public function partnerInfoRegist($form, $eContractTmpInfoId, $token) {
    $record = array(
      'e_contract_tmp_info_id' => $eContractTmpInfoId,
      'email'                  => $form['signInfos']['partners'][0]['info']['email'],
      'lastname'               => $form['signInfos']['partners'][0]['info']['lastname'],
      'firstname'              => $form['signInfos']['partners'][0]['info']['firstname'],
      'title'                  => $form['signInfos']['partners'][0]['info']['title'],
      'organization_name'      => $form['signInfos']['partners'][0]['info']['organizationName'],
      'approval_order'         => 1,
      'token'                  => $token,
      'approval_flg'        => 0,
      'create_date'        => new Zend_Db_Expr('now()'),
      'update_date'        => new Zend_Db_Expr('now()')
    );
    $this->db->insert('e_contract_partner', $record);
  }

  /*
  * ゲスト認証トークンがユニークかチェックする
  */
  public function checkUniqueToken($condition) {
    $sql = "SELECT
        COUNT('id') AS count
      FROM
        e_contract_partner
      WHERE
        {$condition}
    ;";
    $return = $this->db->fetchRow($sql, array());

    return $return;
  }

  /*
  * 条件からパートナーの数を取得する
  */
  public function getPartnerCount($condition) {
    $sql = "SELECT
      COUNT(id) AS count
    FROM
      e_contract_partner
    WHERE
      {$condition}
    ;";
    $return = $this->db->fetchRow($sql, array());

    return $return['count'];
  }

  /*
  * 条件からパートナーの数を取得する
  */
  public function getPartnerCount2($condition) {
    $sql = "SELECT
      *
    FROM
      e_contract_partner2
    WHERE
      {$condition}
    ;";
    $return = $this->db->fetchRow($sql, array());
    return $return;
  }

  /*
  * 条件からパートナー情報を取得する
  */
  public function getPartner($condition) {
    $sql = "SELECT
      *
    FROM
      e_contract_partner
    WHERE
      {$condition}
    ;";
    $return = $this->db->fetchRow($sql, array());

    return $return;
  }

  /*
  * 条件からパートナー情報を取得する
  */
  public function getPartner2($condition) {
    $sql = "SELECT
      *
    FROM
      e_contract_partner2
    WHERE
      {$condition}
    ;";
    $return = $this->db->fetchRow($sql, array());

    return $return;
  }

  /*
  * パートナー印影情報を更新する
  */
  public function registPartnerSign($from, $token) {
    $record = array(
      'sign_x'       => $form['x'],
      'sign_y'       => $form['y'],
      'sign_width'   => $form['width'],
      'sign_height'  => $form['height'],
      'sign_page'    => 1,
      'sign_doc_idx' => 0,
      'img_data'     => $form['data'],
      'img_type'     => 'image/png',
      'img_size'     => $form['size'],
      'img_width'    => $form['width'],
      'img_height'   => $form['height']
    );
    $where = array(
      "token = {$this->db->quote($token)}"
    );
    $this->db->update('e_contract_partner', $record, $where);
  }



  /*******  以下リニューアル後の関数 *******/

  /**
   * パートナー情報を登録する
   * @param unknown
   * @return unknown
   */
  public function setPartner($caseId, $form, $token, $i) {

    $approval_status = 0;
    if(isset($form['token'][$i]) && $form['token'][$i] != '') {
      $approval_status = 1;
    }

    $record = array(
      'e_contract_case_id' => $caseId,
      'email'              => $form['email'][$i],
      'lastname'           => $form['lastname'][$i],
      'firstname'          => $form['firstname'][$i],
      'title'              => $form['title'][$i],
      'organization_name'  => $form['organization_name'][$i],
      'approval_order'     => $i + 1,
      'token'              => $token,
      'approval_status'    => $approval_status,
      'create_date'        => new Zend_Db_Expr('now()'),
      'update_date'        => new Zend_Db_Expr('now()')
    );
    $this->db->insert('e_contract_partner2', $record);
  }

  /**
   * 条件を指定してパートナー一覧を登録する
   * @param unknown
   * @return unknown
   */
  public function getPartnerList($condition) {
    $sql = "SELECT
        id,
        e_contract_case_id,
        email,
        lastname,
        firstname,
        title,
        organization_name,
        approval_order,
        approval_status,
        mail_sent_date,
        update_date
      FROM
        e_contract_partner2
      WHERE
        {$condition}
    ;";
    $rtn = $this->db->fetchAll($sql, array());
    return $rtn;
  }

  /**
   * 条件を指定して未承認のパートナー一覧を取得する
   * @param unknown
   * @return unknown
   */
  public function getUnapprovedPartnerList($condition) {
    $sql = "SELECT
        id,
        e_contract_case_id,
        email,
        lastname,
        firstname,
        title,
        organization_name,
        approval_order,
        token
      FROM
        e_contract_partner2
      WHERE
        {$condition}
      AND
        approval_status = 0
      ORDER BY
        approval_order ASC
    ;";
    $rtn = $this->db->fetchAll($sql, array());
    return $rtn;
  }

  /**
   * 条件を指定して二要素認証済みのパートナーを取得する
   * @param unknown
   * @return unknown
  */
  public function getAuthenticatedPartner($condition) {
    $sql = "SELECT
        *
      FROM
        e_contract_partner2
      WHERE
        {$condition}
    ;";
    $rtn = $this->db->fetchAll($sql, array());
    return $rtn;
  }

  /**
   * 条件を指定して承認ステータスにする
   * @param unknown
   * @return unknown
   */
  public function resetApprovalStatus($condition) {
    $record["approval_status"] = 0;
    $rtn = $this->db->update('e_contract_partner2', $record, $condition);
    return $rtn;
  }

  /**
   * 条件を指定して承認ステータスにする
   * @param unknown
   * @return unknown
   */
  public function setApprovalStatus($condition, $password) {
    $record["approval_status"] = 1;
    $record["password"] = $password;
    $record["update_date"] = new Zend_Db_Expr('now()');
    $rtn = $this->db->update('e_contract_partner2', $record, $condition);
    return $rtn;
  }

  /**
  * 条件を指定して却下ステータスにする
  * @param unknown
  * @return unknown
  */
  public function setCancelStatus($condition) {
    $record["approval_status"] = 2;
    $record["update_date"] = new Zend_Db_Expr('now()');
    $rtn = $this->db->update('e_contract_partner2', $record, $condition);
    return $rtn;
  }

  /**
   * 条件を指定しパートナーを削除する
   * @param unknown $condition  検索条件
   */
  public function deletePartner($condition) {
    $result = $this->db->delete('e_contract_partner2', $condition);
    return $result;
  }

  /**
   * パートナーの認証パスワードを登録する
   * @param unknown $condition  検索条件
  */
  public function setPassword($condition, $password) {
    $record["password"] = $password;
    $rtn = $this->db->update('e_contract_partner2', $record, $condition);
    return $rtn;
  }

  /**
   * アクティベーション処理を行う
   * @param unknown $form
   * @throws Exception
  */
  public function activateStaff($form) {
    if(!preg_match('/([A-Z]{2})0*([0-9]+)/', $form["id"], $match)) { // 入力値がAA + 数値
      return array();
    }
    $record = array(
      'password' => md5($form["password"])
    );
    $part_cond = " id = {$match[2]} ";
    $act_cond = " staff_type = '{$match[1]}' AND staff_id = {$match[2]} ";
    // アカウントのパスワードを更新
    $rtn = $this->db->update('e_contract_partner2', $record, $part_cond);
    // アクティベーションレコードを削除
    $rtn = $this->db->delete('activation_staff', $act_cond);
    // アカウント情報取得
    $rtn = $this->getPartnerCount2($part_cond);
    return $rtn;
  }

  /**
   * 条件を指定してパートナーの二要素認証ステータスを更新する
   * @param unknown $condition  検索条件
  */
  public function setAuthenticateState($condition) {
    $record['partner_authenticate_flg'] = 1;
    $rtn = $this->db->update('e_contract_partner2', $record, $condition);
    return $rtn;
  }

  /**
   * 条件を指定してパートナーへメールを送信した日を更新する
   * @param unknown $condition  検索条件
  */
  public function setMailSentDate($condition) {
    $date = new Zend_Db_Expr('now()');
    $sql = "UPDATE
              e_contract_partner2
            SET
              mail_sent_date = {$date}
            WHERE
              {$condition}
            ;";

    // 他の更新処理と同様の$this->db->updateで更新できなかった為トランザクションにて更新
    try{
      $this->db->beginTransaction();
      $this->db->query($sql);
      $this->db->commit();
    } catch (Exception $e) {
      $this->db->rollBack();
      error_log($e->getMessage());
    }
  }
}
