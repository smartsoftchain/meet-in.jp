<?php
/**
 * EContractAccountDao クラス
 * 電子契約API アカウントデータを扱うDaoクラス
 * @package Dao
*/
class EContractAccountDao extends AbstractDao {

  private $db;

  function __construct($db){
    parent::init();
    $this->db = $db;
  }

  /**
  * 電子契約APIアカウント情報を1件取得
  * @param unknown $condition
  * @throws Exception
  */
  public function getEContractAccount($condition) {
    $sql = "SELECT
        client_id,
        email,
        organization_name
      FROM
        e_contract_account
      WHERE
        {$condition}
    ;";
    $return = $this->db->fetchRow($sql, array());
    return $return;
  }

  /**
  * 電子契約APIアカウント情報登録
  */
  public function accountRegist($company) {
    $record = array(
      'client_id'         => $company['client_id'],
      'email'             => $company['client_id']."-".$company['client_staffleaderemail'],
      'organization_name' => $company['client_name'],
      'create_date'       => new Zend_Db_Expr('now()'),
      'update_date'       => new Zend_Db_Expr('now()')
    );
    // 自サーバーに登録
    $this->db->insert('e_contract_account', $record);
  }

}
