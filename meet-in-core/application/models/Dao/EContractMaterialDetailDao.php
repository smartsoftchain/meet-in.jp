<?php

/**
 * EContractMaterialDetailDao クラス
 *
 * 資料のデータを扱うDaoクラス
 *
 * @version 2019/11/21 takeura
 * @package Dao
*/
class EContractMaterialDetailDao extends AbstractDao {

  private $db;

  function __construct($db){
    parent::init();
    $this->db = $db;
  }

  /**
   * 契約書ファイル詳細情報を登録する
   * @param unknown
   * @return unknown
   */
  public function registMaterialDetail($eContractMaterialBasicId, $materialDetail) {
    $record['e_contract_material_basic_id'] = $eContractMaterialBasicId;
    $record['page'] = $materialDetail['material_page'];
    $record['filename'] = $materialDetail['material_filename'];
    $record['create_date'] = new Zend_Db_Expr('now()');
    $record['update_date'] = new Zend_Db_Expr('now()');
    $this->db->insert('e_contract_material_detail', $record);
    $sql = "SELECT
          MAX(id) as  max_material_detail_id
        FROM
          e_contract_material_detail
        WHERE
          1
        ";
    $rtn = $this->db->fetchRow($sql, array());
    $result = $record;
    $result["id"] = $rtn["max_material_detail_id"];
    return $result;
  }

  /**
   * 条件を指定して資料詳細一覧を取得する
   * @param unknown
   * @return unknown
   */
  public function getMaterialDetailList($condition) {
    $sql = "SELECT
        id,
        e_contract_material_basic_id,
        page,
        filename
      FROM
        e_contract_material_detail
      WHERE
        {$condition}
      ORDER BY
        page ASC
    ;";
    $rtn = $this->db->fetchAll($sql, array());
    return $rtn;
  }

  /**
   * 条件を指定し資料詳細を削除する
   * @param unknown $condition  検索条件
   */
  public function deleteMaterialDetail($condition) {
    $result = $this->db->delete('e_contract_material_detail', $condition);
    return $result;
  }

}
