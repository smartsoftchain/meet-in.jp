<?php

/**
 * EContractDocumentDao クラス
 *
 * 資料の詳細データを扱うDaoクラス
 *
 * @version 2019/10/23 takeura
 * @package Dao
*/
class EContractDocumentDao extends AbstractDao {

  private $db;

  function __construct($db){
    parent::init();
    $this->db = $db;
  }

  /**
   * 契約情報を登録する
   * @param unknown
   * @return unknown
   */
  public function setDocument($form) {
    $record['name'] = $form["material_name"];
    $record['client_id'] = $form["client_id"];
    if(isset($form['is_temporary_creation'])) {
      $record['is_temporary_creation'] = $form["is_temporary_creation"];
    }
    $record['create_date'] = new Zend_Db_Expr('now()');
    $record['update_date'] = new Zend_Db_Expr('now()');
    $this->db->insert('e_contract_document', $record);
    $sql = "SELECT
          MAX(id) as  max_document_id
        FROM
          e_contract_document
        WHERE
          1
        ";
    $rtn = $this->db->fetchRow($sql, array());
    $result["document"] = $record;
    $result["document"]["document_id"] = $rtn["max_document_id"];
    return $result;
  }

  /**
   * 条件を指定し契約テンプレートの件数を取得する
   * @param unknown $condition  検索条件
   * @return unknown
   */
  public function getDocumentCount($condition) {
    $sql = "SELECT
          COUNT(DISTINCT a.id) AS count
        FROM
          e_contract_document AS a
        INNER JOIN
          e_contract_file AS b
        ON
          a.id = b.e_contract_document_id
        INNER JOIN
          e_contract_document_material_basic AS c
        ON
          b.e_contract_document_material_id = c.e_contract_document_material_id
        INNER JOIN
          e_contract_document_material_detail AS d
        ON
          c.e_contract_document_material_id = d.e_contract_document_material_id
        WHERE
          a.delete_date IS NULL AND
          {$condition}
    ";
    $rtn = $this->db->fetchRow($sql, array());
    return $rtn["count"];
  }

  /**
   * 条件を指定し契約テンプレート一覧を取得する
   * @param unknown $condition  検索条件
   * @param unknown $order    ソートを行う為のカラム
   * @param unknown $ordertype  昇順、降順
   * @param unknown $page      ページインデックス
   * @param unknown $limit    データ取得件数
   * @return unknown
   */
  public function getDocumentList($condition, $order, $ordertype, $page, $limit) {
    $offset = 0;
    $page = $page - 1;
    if($page > 0) {
      $offset = $page * $limit;
    }
    $sql = "SELECT
          a.id,
          a.name,
          a.create_date,
          a.update_date,
          c.e_contract_document_material_id,
          c.material_ext,
          d.material_filename,
          GROUP_CONCAT(c.total_size) as total_size
        FROM
          e_contract_document AS a
        INNER JOIN
          e_contract_file AS b
        ON
          a.id = b.e_contract_document_id
        INNER JOIN
          e_contract_document_material_basic AS c
        ON
          b.e_contract_document_material_id = c.e_contract_document_material_id
        INNER JOIN
          e_contract_document_material_detail AS d
        ON
          c.e_contract_document_material_id = d.e_contract_document_material_id
        WHERE
          a.delete_date IS NULL AND
          a.{$condition}
        GROUP BY
          a.id
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
   * 条件を指定して契約テンプレートを削除する
   * @return unknown
   */
  public function deleteDocument($condition) {
    $result = $this->db->delete('e_contract_document' ,$condition);
    return $result;
  }

  /**
   * 条件を指定して契約テンプレートを倫理削除する
   * @return unknown
   */
  public function softdeleteDocument($condition) {
    $params['delete_date'] = new Zend_Db_Expr('now()');
    $rtn = $this->db->update('e_contract_document' , $params, $condition);
    return $rtn;
  }


  /**
   * 条件を指定し契約テンプレート一覧を取得する
   * @param unknown $condition  検索条件
   */
  public function getDocumentAllList($condition) {
    $sql = "SELECT
          a.id,
          a.name,
          a.create_date,
          a.update_date
        FROM
          e_contract_document AS a
        INNER JOIN
          e_contract_file AS b
        ON
          a.id = b.e_contract_document_id
        INNER JOIN
          e_contract_document_material_basic AS c
        ON
          b.e_contract_document_material_id = c.e_contract_document_material_id
        INNER JOIN
          e_contract_document_material_detail AS d
        ON
          c.e_contract_document_material_id = d.e_contract_document_material_id
        WHERE
          a.delete_date IS NULL AND
          a.{$condition}
        GROUP BY
          a.id
    ";
    $rtn = $this->db->fetchAll($sql, array());
    return $rtn;
  }

  /**
   * 条件を指定し契約テンプレート情報を取得する
   * @param unknown $condition  検索条件
   */
  public function getDocument($condition) {
    $sql = "SELECT
          id,
          client_id,
          name,
          create_date,
          update_date
        FROM
          e_contract_document
        WHERE
          {$condition}
    ";
    $rtn = $this->db->fetchRow($sql, array());
    return $rtn;
  }

}
