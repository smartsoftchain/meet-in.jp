<?php

/**
 * EContractAuthorizationDao クラス
 *
 * 電子契約案件データを扱うDaoクラス
 *
 * @version 2019/12/23 takeura
 * @package Dao
*/
class EContractAuthorizationDao extends AbstractDao {

  private $db;

  function __construct($db){
    parent::init();
    $this->db = $db;
  }

  
  /**
  * 認証コードを登録する
  * @param unknown
  * @return unknown
  */
  public function createAuthorization($form) {
    $record['token']       = $form['token'];
    $record['tel']         = $form['tel'];
    $record['create_date'] = new Zend_Db_Expr('now()');
    $this->db->insert('e_contract_authorization', $record);
    return $record;
  }

  /**
  * API認証済みのパートナー数を取得
  * @param unknown
  * @return unknown
  */
  public function getAuthCount($condition) {
    $sql = "SELECT
        COUNT(DISTINCT id) as count
      FROM
        e_contract_authorization
      WHERE
        {$condition}
    ";
    $rtn = $this->db->fetchRow($sql, array());
    return $rtn["count"];
  }

  /**
  * 認証済みに変更する
  * @param unknown
  * @return unknown
  */
  public function updateAuth($condition) {
    $record['auth_flg'] = 1;
    $record['auth_date'] = new Zend_Db_Expr('now()');
    $this->db->update('e_contract_authorization', $record, $condition);
  }

}
