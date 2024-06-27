<?php

/**
 * EContractTagDao クラス
 *
 * 電子契約案件データを扱うDaoクラス
 *
 * @version 2020/08/24 nishimura
 * @package Dao
*/
class EContractTagDao extends AbstractDao {

  private $table = 'e_contract_tag';
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
      distinct name 
    FROM
      {$this->table}
    WHERE
      {$condition}
    ORDER BY
      create_date desc;
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
