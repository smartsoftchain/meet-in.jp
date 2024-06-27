<?php

/**
 * EContractAddressDao クラス
 *
 * 電子契約案件データを扱うDaoクラス
 *
 * @version 2020/08/24 nishimura
 * @package Dao
*/
class EContractAddressDao extends AbstractDao {

  private $table = 'e_contract_address';
  private $db;

  function __construct($db){
      parent::init();
      $this->db = $db;
  }

  /**
   * 検索
   * @param unknown $condition    検索条件
   * @return unknown
   */
  public function find($condition) {
    $sql = "SELECT
      e_contract_address_id,
      e_contract_document_id,
      email,
      lastname,
      firstname,
      title,
      organization_name,
      approval_order,
      create_date,
      update_date
    FROM
      {$this->table}
    WHERE
      {$condition}
    ORDER BY
      approval_order;
    ";
    $rtn = $this->db->fetchALL($sql, array());
    return $rtn;
  }


  /**
   * 登録
   * @param. unknown $params データ
   * @return unknown
   */
  public function insert($params) {
    $rtn = $this->db->insert($this->table, $params);
    return $rtn;
  }

  /**
   * 更新
   * @param. unknown $params      データ
   * @param  unknown $condition    検索条件
   * @return unknown
   */
  public function update($params, $condition) {
    $rtn = $this->db->update($this->table, $params, $condition);
    return $rtn;
  }

  /**
   * 削除
   * @param unknown $condition    条件
   */
  public function delete($condition){
    $rtn = $this->db->delete($this->table, $condition);
    return $rtn;
  }

}
