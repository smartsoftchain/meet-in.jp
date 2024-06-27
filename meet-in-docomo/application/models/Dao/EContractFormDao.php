<?php

/**
 * EContractFormDao クラス
 *
 * 契約書の各フォームを扱うDaoクラス
 *
 * @version 2019/11/06 takeura
 * @package Dao
*/
class EContractFormDao extends AbstractDao {

  private $db;

  function __construct($db){
    parent::init();
    $this->db = $db;
  }

  /**
   * フォーム情報を登録する
   * @param unknown
   * @return unknown
   */
  public function creareForm($form) {
    $record['e_contract_file_id'] = $form['file_id'];
    $record['type']        = $form['type'];
    $record['x']           = $form['x'];
    $record['y']           = $form['y'];
    $record['width']       = $form['width'];
    $record['height']      = $form['height'];
    $record['font_size']   = $form['font_size'];
    $record['page']        = $form['page'];
    $record['doc_idx']     = $form['doc_idx'];
    $record['create_date'] = new Zend_Db_Expr('now()');
    $record['update_date'] = new Zend_Db_Expr('now()');

    $this->db->insert('e_contract_form', $record);

    $sql = "SELECT
          MAX(id) as  max_form_id
        FROM
          e_contract_form
        WHERE
          1
        ";
    $rtn = $this->db->fetchRow($sql, array());

    $result["form"] = $record;
    $result["form"]["form_id"] = $rtn["max_form_id"];
    return $result;
  }

  /**
   * フォーム情報を削除する
   * @param unknown
   * @return unknown
   */
  public function deleteForm($form) {
    $condition = "id = {$form["form_id"]}";
    $result = $this->db->delete('e_contract_form', $condition);
    $result = $form["form_id"];
    return $result;
  }

  /**
   * フォーム情報を更新する
   * @param unknown
   * @return unknown
   */
  public function updateForm($form) {
    if($form['type'] == 'move') {
      $record['x'] = $form['left'];
      $record['y'] = $form['top'];
      $record['width'] = $form['width'];
      $record['height'] = $form['height'];
    } elseif($form['type'] == 'select') {
      $record['font_size'] = $form['font_size'];
    }
    
    $this->db->update('e_contract_form', $record, "id = {$form['id']}");

    $sql = "SELECT
          MAX(id) as  max_form_id
        FROM
          e_contract_form
        WHERE
          1
        ";
    $rtn = $this->db->fetchRow($sql, array());

    $result["form"] = $record;
    $result["form"]["form_id"] = $rtn["max_form_id"];
    return $result;
  }

  /**
   * 条件を指定してフォーム一覧を取得する
   * @param unknown
   * @return unknown
   */
  public function getFormList($condition) {
    $sql = "SELECT
        id,
        e_contract_file_id,
        type,
        x,
        y,
        width,
        height,
        font_size,
        page,
        doc_idx
      FROM
        e_contract_form
      WHERE
        {$condition}
    ;";
    $rtn = $this->db->fetchAll($sql, array());
    return $rtn;
  }


  /**
   * 条件を指定してフォームと付随するインプット一覧を取得する
   * @param unknown
   * @return unknown
   */
  public function getFormWithPartnerList($condition) {
    $sql = "SELECT
        a.id,
        a.e_contract_file_id,
        b.e_contract_case_id,
        b.e_contract_partner_id,
        b.type,
        b.x,
        b.y,
        b.width,
        b.height,
        b.page,
        b.doc_idx,
        b.value,
        b.target,
        b.required,
        b.img_data,
        c.email,
        c.lastname,
        c.firstname,
        c.title,
        c.organization_name,
        c.approval_order
      FROM
        e_contract_form AS a
      LEFT JOIN
        e_contract_input AS b
      ON
        a.id = b.e_contract_form_id
      LEFT JOIN
        e_contract_partner2 AS c
      ON
        b.e_contract_partner_id = c.id
      WHERE
        {$condition}
      GROUP BY
        a.id
    ;";
    $rtn = $this->db->fetchAll($sql, array());
    return $rtn;
  }

  /**
   * 条件を指定してフォームを1件取得する
   * @param unknown
   * @return unknown
   */
  public function getFormRow($condition) {
    $sql = "SELECT
          id,
          e_contract_file_id,
          type,
          x,
          y,
          width,
          height,
          font_size,
          page,
          doc_idx,
          create_date,
          update_date
        FROM
          e_contract_form
        WHERE
          {$condition}
    ";
    $rtn = $this->db->fetchRow($sql, array());
    return $rtn;
  }


  /*
   * レコードを複製する.
   * @return unknown
   */
  public function copyForm($record) {
    unset($record['id']);
    $record['create_date'] = new Zend_Db_Expr('now()');
    $record['update_date'] = new Zend_Db_Expr('now()');

    $this->db->insert('e_contract_form', $record);
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
