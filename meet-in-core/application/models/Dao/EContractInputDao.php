<?php
/**
 * EContractInputDao クラス
 * 電子契約API フォームインプットデータを扱うDaoクラス
 * @package Dao
*/
class EContractInputDao extends AbstractDao {

  private $db;

  function __construct($db){
    parent::init();
    $this->db = $db;
  }

  /**
   * 条件を指定してインプット一覧を取得する
   * @param unknown
   * @return unknown
   */
  public function getInputList($condition) {
    $sql = "SELECT
        id,
        e_contract_case_id,
        e_contract_material_basic_id,
        e_contract_form_id,
        e_contract_partner_id,
        type,
        x,
        y,
        width,
        height,
        font_size,
        page,
        doc_idx,
        value,
        target,
        size,
        required,
        img_data,
        img_type,
        img_size,
        img_width,
        img_height
      FROM
        e_contract_input
      WHERE
        {$condition}
    ;";
    $rtn = $this->db->fetchAll($sql, array());
    return $rtn;
  }

  /**
   * フォームインプット情報を登録する
   * @param unknown
   * @return unknown
   */
  public function createInput($form, $formRow, $materialBasicId) {
    $record['e_contract_case_id'] = $form['case_id'];
    $record['e_contract_material_basic_id'] = $materialBasicId;
    $record['e_contract_form_id'] = $form['form_id'];
    $record['e_contract_partner_id'] = $form['partner_id'];
    $record['type'] = $formRow['type'];
    $record['x'] = $formRow['x'];
    $record['y'] = $formRow['y'];
    $record['width'] = $formRow['width'];
    $record['height'] = $formRow['height'];
    $record['page'] = $formRow['page'];
    $record['doc_idx'] = $formRow['doc_idx'];
    $record['target'] = $form['target'];
    $record['create_date'] = new Zend_Db_Expr('now()');
    $record['update_date'] = new Zend_Db_Expr('now()');
    if($formRow['type'] == 'sign') {
      // 印影の場合
      $record['required']   = 'true';
      $record['img_data']   = $form['img_data'];
      $record['img_type']   = $form['img_type'];
      $record['img_size']   = $form['img_size'];
      $record['img_width']  = $formRow['width'];
      $record['img_height'] = $formRow['height'];
    } elseif($formRow['type'] == 'text' || $formRow['type'] == 'textarea') {
      // テキストフォーム、テキストエリアの場合
      $record['font_size']  = $formRow['font_size'];
      $record['required']   = 'true';
    } elseif($formRow['type'] == 'checkbox') {
      // チェックボックスの場合
      $record['size']       = $formRow['width'];
      $record['required']   = $form['required'];
      $record['img_data']   = $form['img_data'];
      $record['img_type']   = $form['img_type'];
      $record['img_width']  = $formRow['width'];
      $record['img_height'] = $formRow['height'];

      $record['required']   = 'false'; // 実装時は、[入力を必須にする]UIにチェックが入っていない状態.
    }

    $this->db->insert('e_contract_input', $record);

    $sql = "SELECT
          MAX(id) as  max_input_id
        FROM
          e_contract_input
        WHERE
          1
        ";
    $rtn = $this->db->fetchRow($sql, array());

    $result["input"] = $record;
    $result["input"]["input_id"] = $rtn["max_input_id"];
    return $result;
  }

  /**
   * フォームインプット情報を更新する
   *
   * [注意]
   * エンドユーザの入力を反映するものであり、
   * テンプレートが変わったからと、過去それをひな形にする契約書全ての情報を更新するものではない.
   *
   * @param unknown
   * @return unknown
   */
  public function updateInput($form, $formRow) {
    $record['e_contract_partner_id'] = $form['partner_id'];
    $record['required'] = $form['required'];
    $record['target'] = $form['target'];
    if($formRow['type'] == 'sign') {
      // 印影の場合
      $record['required']   = 'true';
      $record['img_data']   = $form['img_data'];
      $record['img_type']   = $form['img_type'];
      $record['img_size']   = $form['img_size'];
      $record['img_width']  = $formRow['width'];
      $record['img_height'] = $formRow['height'];
      $record['width']      = $formRow['width'];
      $record['height']     = $formRow['height'];

    } elseif($formRow['type'] == 'text' || $formRow['type'] == 'textarea') {
      // テキストフォーム、テキストエリアの場合
      $record['font_size']  = $formRow['font_size'];
      $record['required']   = 'true';
    } elseif($formRow['type'] == 'checkbox') {
      // チェックボックスの場合
      $record['size']       = $formRow['width'];
      $record['img_data']   = $form['img_data'];
      $record['img_type']   = $form['img_type'];
      $record['img_width']  = $formRow['width'];
      $record['img_height'] = $formRow['height'];
    }

    // Update.
    $condition = "e_contract_case_id = {$form['case_id']} AND e_contract_form_id = {$form['form_id']}";
    $this->db->update('e_contract_input', $record, $condition);

    // 操作したレコードのidを取得する.
    $sql = "SELECT
          id as  input_id
        FROM
          e_contract_input
        WHERE
          {$condition}
        ";
    $rtn = $this->db->fetchRow($sql, array());

    $result["input"] = $record;
    $result["input"]["width"] = $formRow["width"];
    $result["input"]["height"] = $formRow["height"];
    $result["input"]["input_id"] = $rtn["input_id"];
    return $result;
  }

  /**
   * フォームインプット情報を更新する
   * @param unknown
   * @return unknown
   */
  public function updateRecord($form, $formRow) {

    if($formRow['type'] == 'font_size') {
      $record['font_size'] = $formRow['font_size'];

    } else if($formRow['type'] == 'required') {
      $record['required']   = $form['required'];

    } else if($formRow['type'] == 'position') {
      $record['x'] = $form['x'];
      $record['y'] = $form['y'];
      $record['width'] = $form['width'];
      $record['height'] = $form['height'];

    } else {
      $record['e_contract_partner_id'] = $form['partner_id'];
      $record['required'] = $form['require'];
      $record['target'] = $form['target'];
      $record['x'] = $form['x'];
      $record['y'] = $form['y'];
      $record['width'] = $form['width'];
      $record['height'] = $form['height'];

      if($formRow['page']){
        $record['page'] = $formRow['page'];
      }

      if($formRow['type'] == 'sign') {
        // 印影の場合
        $record['required']   = 'true';
        $record['img_data']   = $form['img_data'];
        $record['img_type']   = $form['img_type'];
        $record['img_size']   = $form['img_size'];
        $record['img_width']  = $formRow['width'];
        $record['img_height'] = $formRow['height'];
      } elseif($formRow['type'] == 'text' || $formRow['type'] == 'textarea') {
        // テキストフォーム、テキストエリアの場合
        $record['font_size']  = $formRow['font_size'];
        $record['required']   = 'true';
      } elseif($formRow['type'] == 'checkbox') {
        // チェックボックスの場合
        $record['size']       = $formRow['width'];
        $record['img_data']   = $form['img_data'];
        $record['img_type']   = $form['img_type'];
        $record['img_width']  = $formRow['width'];
        $record['img_height'] = $formRow['height'];
      }
    }

    $condition = "id = {$form['id']}";
    $this->db->update('e_contract_input', $record, $condition);
    $rtn = $this->getInputList($condition);

    $result["input"] = $rtn[0];
    $result["input"]["width"] = $formRow["width"];
    $result["input"]["height"] = $formRow["height"];
    $result["input"]["input_id"] = $rtn["max_input_id"];
    return $result;
  }

  /**
   * パートナーの入力情報を登録する
   * @param unknown
   * @return unknown
   */
  public function valueInput($condition, $data, $input) {
    if($input['type'] == 'text' || $input['type'] == 'textarea') {
      // テキストフォーム、テキストエリアの場合
      $record['value'] = $data['value'];
      $record['target'] = $data['target'];
      $record['size'] = $data['size'];
    } elseif($input['type'] == 'sign') {
      // 印影の場合
      $record['target'] = $data['target'];
      $record['img_data'] = $data['img_data'];
      $record['img_type'] = $data['img_type'];
      $record['img_size'] = $data['img_size'];
    } elseif($input['type'] == 'checkbox') {
      // チェックボックスの場合
      $record['target'] = $data['target'];
      $record['img_data'] = $data['img_data'];
      $record['img_type'] = $data['img_type'];
    }

    $this->db->update('e_contract_input', $record, $condition);

    $sql = "SELECT
          MAX(id) as  max_input_id
        FROM
          e_contract_input
        WHERE
          1
        ";
    $rtn = $this->db->fetchRow($sql, array());

    $result["input"] = $record;
    $result["input"]["width"] = $input['width'];
    $result["input"]["height"] = $input['height'];
    if($input['type'] == 'sign') {
      $result["input"]["img_width"] = $input['img_width'];
      $result["input"]["img_height"] = $input['img_height'];
    }
    $result["input"]["input_id"] = $rtn["max_input_id"];
    return $result;
  }

  /**
   * パートナーの入力情報を登録する
   * @param unknown
   * @return unknown
   */
  public function getValueInput($data, $input) {
    if($input['type'] == 'text' || $input['type'] == 'textarea') {
      // テキストフォーム、テキストエリアの場合
      $record['value'] = $data['value'];
      $record['target'] = $data['target'];
      $record['size'] = $data['size'];
    } elseif($input['type'] == 'sign') {
      // 印影の場合
      $record['target'] = $data['target'];
      $record['img_data'] = $data['img_data'];
      $record['img_type'] = $data['img_type'];
      $record['img_size'] = $data['img_size'];
    } elseif($input['type'] == 'checkbox') {
      // チェックボックスの場合
      $record['target'] = $data['target'];
      $record['img_data'] = $data['img_data'];
      $record['img_type'] = $data['img_type'];
    }
    $sql = "SELECT
          MAX(id) as  max_input_id
        FROM
          e_contract_input
        WHERE
          1
        ";
    $rtn = $this->db->fetchRow($sql, array());

    $result["input"] = $record;
    $result["input"]["width"] = $input['width'];
    $result["input"]["height"] = $input['height'];
    if($input['type'] == 'sign') {
      $result["input"]["img_width"] = $input['img_width'];
      $result["input"]["img_height"] = $input['img_height'];
    }
    $result["input"]["input_id"] = $rtn["max_input_id"];
    return $result;
  }

  public function valueInputRollBack($condition)
  { 
    $record['value'] = NULL;
    $record['target'] =  NULL;
    $record['size'] =  NULL;
    $record['img_data'] =  NULL;
    $record['img_type'] =  NULL;
    $record['img_size'] =  NULL;
    $this->db->update('e_contract_input', $record, $condition);
  }

  /**
   * 条件を指定してインプットとパートナー情報一覧を取得する
   * @param unknown
   * @return unknown
   */
  public function getInputWithPartnerList($condition) {
    $sql = "SELECT
        a.id,
        a.e_contract_case_id,
        a.e_contract_material_basic_id,
        a.e_contract_form_id,
        a.e_contract_partner_id,
        a.type,
        a.x,
        a.y,
        a.width,
        a.height,
        a.font_size,
        a.page,
        a.doc_idx,
        a.value,
        a.target,
        a.size,
        a.required,
        a.img_data,
        a.img_type,
        a.img_size,
        a.img_width,
        a.img_height,
        b.email,
        b.lastname,
        b.firstname,
        b.title,
        b.organization_name,
        b.approval_order
      FROM
        e_contract_input AS a
      LEFT JOIN
        e_contract_partner2 AS b
      ON
        a.e_contract_partner_id = b.id
      WHERE
        {$condition}
      GROUP BY
        a.id
    ;";
    $rtn = $this->db->fetchAll($sql, array());
    return $rtn;
  }

  /**
   * 条件を指定してインプット情報を1件取得する
   * @param unknown
   * @return unknown
   */
  public function getInputRow($condition) {
    $sql = "SELECT
          id,
          e_contract_case_id,
          e_contract_material_basic_id,
          e_contract_form_id,
          e_contract_partner_id,
          type,
          x,
          y,
          width,
          height,
          page,
          doc_idx,
          value,
          target,
          size,
          required,
          img_data,
          img_type,
          img_size,
          img_width,
          img_height,
          create_date,
          update_date
        FROM
          e_contract_input
        WHERE
          {$condition}
    ";
    $rtn = $this->db->fetchRow($sql, array());
    return $rtn;
  }

  /**
   * 登録
   * @param. unknown $params データ
   * @return unknown
   */
  public function insertInput($params) {
    $params['create_date'] = new Zend_Db_Expr('now()');
    $params['update_date'] = new Zend_Db_Expr('now()');
    $rtn = $this->db->insert('e_contract_input', $params);
    return $rtn;
  }

  /**
   * 条件を指定してインプット情報を削除取得する
   * @param unknown
   * @return unknown
   */
  public function deleteInput($condition) {
    $result = $this->db->delete('e_contract_input', $condition);
    return $result;
  }

}
