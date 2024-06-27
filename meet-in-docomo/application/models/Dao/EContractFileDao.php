<?php

/**
 * EContractFileDao クラス
 *
 * 資料の詳細データを扱うDaoクラス
 *
 * @version 2019/10/23 takeura
 * @package Dao
*/
class EContractFileDao extends AbstractDao {

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
  public function setFile($file, $documentId, $contractDocumentMaterialId, $idx, $is_temporary) {
    $record['e_contract_document_id'] = $documentId;
    $record['e_contract_document_material_id'] = $contractDocumentMaterialId;
    $record['idx'] = $idx;
    $record['title'] = $file["tmp_name"][$idx];
    $record['name'] = $file["name"][$idx];
    $record['type'] = $file["type"][$idx];
    $record['size'] = $file["size"][$idx];
    $record['is_temporary'] = $is_temporary; // 0 = テンプレートから作成, 1 = テンプレートから作らなかった為作成した一時的なファイル.
    $record['create_date'] = new Zend_Db_Expr('now()');
    $record['update_date'] = new Zend_Db_Expr('now()');
    $this->db->insert('e_contract_file', $record);
    $sql = "SELECT
          MAX(id) as  max_file_id
        FROM
          e_contract_file
        WHERE
          1
        ";
    $rtn = $this->db->fetchRow($sql, array());
    $result["file"] = $record;
    $result["file"]["file_id"] = $rtn["max_file_id"];
    return $result;
  }

  /**
   * 契約書ファイル情報を登録する
   * @param unknown
   * @return unknown
   */
  public function setFile2($file, $documentId, $contractDocumentMaterialId, $idx, $sort, $is_temporary) {
    $record['e_contract_document_id'] = $documentId;
    $record['e_contract_document_material_id'] = $contractDocumentMaterialId;
    $record['idx'] = $sort;
    $record['title'] = $file["tmp_name"][$idx];
    $record['name'] = $file["name"][$idx];
    $record['type'] = $file["type"][$idx];
    $record['size'] = $file["size"][$idx];
    $record['is_temporary'] = $is_temporary; // 0 = テンプレートから作成, 1 = テンプレートから作らなかった為作成した一時的なファイル.
    $record['create_date'] = new Zend_Db_Expr('now()');
    $record['update_date'] = new Zend_Db_Expr('now()');
    $this->db->insert('e_contract_file', $record);
    $sql = "SELECT
          MAX(id) as  max_file_id
        FROM
          e_contract_file
        WHERE
          1
        ";
    $rtn = $this->db->fetchRow($sql, array());
    $result["file"] = $record;
    $result["file"]["file_id"] = $rtn["max_file_id"];
    return $result;
  }


  /**
   * 全カラムを取得取得する.
   * @param unknown $condition  検索条件
   * @return unknown
   */
  public function getFile($condition) {
    $sql = "SELECT
      *
    FROM
      e_contract_file
    WHERE
      {$condition}
    ";
    $rtn = $this->db->fetchRow($sql, array());
    return $rtn;
  }

  /**
   * 条件を指定して契約書ファイル一覧を取得する
   * @return unknown
   */
  public function getFileList($condition) {
    $sql = "SELECT
          id,
          e_contract_document_id,
          e_contract_document_material_id,
          idx,
          title,
          name,
          type,
          size,
          is_temporary
        FROM
          e_contract_file
        WHERE
          {$condition}
        ORDER BY
          idx
    ";
    $rtn = $this->db->fetchAll($sql, array());
    return $rtn;
  }

  /**
   * 条件を指定して契約書ファイルを削除する
   * @return unknown
   */
  public function deleteFile($condition) {
    $result = $this->db->delete('e_contract_file', $condition);
    return $result;
  }

  /**
   * 条件を指定して約書ファイルに紐付くmaterial_idを取得する
   * @return unknown
   */
  public function getMaterialIds($conditon) {
    $sql = "SELECT
        e_contract_document_material_id
      FROM
        e_contract_file
      WHERE
        {$conditon};
    ";
    $rtn = $this->db->fetchAll($sql, array());
    return $rtn;
  }

  /*
   * レコードを複製する.
   * @return unknown
   */
  public function copyFile($record) {
    unset($record['id']);
    $record['create_date'] = new Zend_Db_Expr('now()');
    $record['update_date'] = new Zend_Db_Expr('now()');

    $this->db->insert('e_contract_file', $record);
    $sql = "SELECT
          MAX(id) as max_id
        FROM
          e_contract_file
        WHERE
          1
        ";
    $rtn = $this->db->fetchRow($sql, array());
    $record["id"] = $rtn["max_id"];
    return $record;
  }

}
