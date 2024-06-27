<?php

/**
 * EContractMaterialBasicDao クラス
 *
 * 資料のデータを扱うDaoクラス
 *
 * @version 2019/11/21 takeura
 * @package Dao
*/
class EContractMaterialBasicDao extends AbstractDao {

  private $db;

  function __construct($db){
    parent::init();
    $this->db = $db;
  }

  /**
   * 契約書ファイル情報を登録する
   * @param unknown
   * @return unknown
   */
  public function registMaterialBasic($caseId, $file, $fileName) {
    $record['case_id'] = $caseId;
    $record['idx'] = $file['idx'];
    $record['title'] = $file['title'];
    $record['name'] = $file['name'];
    $record['type'] = $file['type'];
    $record['size'] = $file['size'];
    $record['filename'] = $fileName;
    $record['create_date'] = new Zend_Db_Expr('now()');
    $record['update_date'] = new Zend_Db_Expr('now()');
    $this->db->insert('e_contract_material_basic', $record);
    $sql = "SELECT
          MAX(id) as  max_material_basic_id
        FROM
          e_contract_material_basic
        WHERE
          1
        ";
    $rtn = $this->db->fetchRow($sql, array());
    $result = $record;
    $result["id"] = $rtn["max_material_basic_id"];
    return $result;
  }


  /**
   * 条件を指定して資料一覧を取得する
   * @param unknown
   * @return unknown
   */
  public function getMaterialBasicList($condition) {
    $sql = "SELECT
        id,
        case_id,
        idx,
        title,
        name,
        type,
        size,
        filename
      FROM
        e_contract_material_basic
      WHERE
        {$condition}
      ORDER BY
        idx ASC
    ;";
    $rtn = $this->db->fetchAll($sql, array());
    return $rtn;
  }

  /**
   * 条件を指定し資料情報を取得する
   * @param unknown $condition  検索条件
   */
  public function getMaterialBasic($condition) {
    $sql = "SELECT
          id,
          case_id,
          idx,
          title,
          name,
          type,
          size,
          filename,
          create_date,
          update_date
        FROM
          e_contract_material_basic
        WHERE
          {$condition}
    ";
    $rtn = $this->db->fetchRow($sql, array());
    return $rtn;
  }

  /**
   * 条件を指定し資料情報を削除する
   * @param unknown $condition  検索条件
   */
  public function deleteMaterialBasic($condition) {
    $result = $this->db->delete('e_contract_material_basic', $condition);
    return $result;
  }

}
