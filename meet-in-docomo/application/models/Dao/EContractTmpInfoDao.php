<?php
/**
 * EContractTmpInfoDao クラス
 * 電子契約API 契約一時保管データを扱うDaoクラス
 * @package Dao
*/
class EContractTmpInfoDao extends AbstractDao {

  private $db;

  function __construct($db){
    parent::init();
    $this->db = $db;
  }

  /**
  * 電子契約API 契約一時保管データ登録
  */
  public function tmpInfoRegist($form, $clientId, $staffType, $staffId, $fileSize, $pdfData, $imgPath) {
    $record = array(
      'client_id'          => $clientId,
      'staff_type'         => $staffType,
      'staff_id'           => $staffId,
      'name'               => $form["params"]["name"],
      'have_amount'        => $form["params"]["haveAmount"],
      'amount'             => ($form["params"]["amount"] !== "") ? $form["params"]["amount"] : NULL,
      'agreement_date'     => ($form["params"]["agreementDate"] !== "") ? $form["params"]["agreementDate"] : NULL,
      'effective_date'     => ($form["params"]["effectiveDate"] !== "") ? $form["params"]["effectiveDate"] : NULL,
      'expire_date'        => ($form["params"]["expireDate"] !== "") ? $form["params"]["expireDate"] : NULL,
      'auto_renewal'       => $form["params"]["autoRenewal"],
      'management_number'  => $form["params"]["managementNumber"],
      'comment'            => $form["params"]["comment"],
      'is_digital_sign'    => $form["signInfos"]["self"]["idDigitalSign"],
      'sign_turn'          => $form["signInfos"]["self"]["signTurn"],
      'sign_x'             => $form["signInfos"]["self"]["signAreas"][0]["x"],
      'sign_y'             => $form["signInfos"]["self"]["signAreas"][0]["y"],
      'sign_width'         => $form["signInfos"]["self"]["signAreas"][0]["width"],
      'sign_height'        => $form["signInfos"]["self"]["signAreas"][0]["height"],
      'sign_page'          => $form["signInfos"]["self"]["signAreas"][0]["page"],
      'sign_doc_idx'       => $form["signInfos"]["self"]["signAreas"][0]["docIdx"],
      'doc_idx'            => $form["documents"][0]["idx"],
      'doc_title'          => $form["documents"][0]["title"],
      'doc_name'           => $form["documents"][0]["name"],
      'doc_type'           => $form["documents"][0]["type"],
      'doc_size'           => $fileSize,
      'doc_data'           => $pdfData,
      'doc_path'           => $imgPath,
      'create_date'        => new Zend_Db_Expr('now()'),
      'update_date'        => new Zend_Db_Expr('now()')
    );
    $this->db->insert('e_contract_tmp_info', $record);

    // 登録データを取得する
    $sql = "SELECT
          MAX(id) as id
        FROM
          e_contract_tmp_info";
    $return = $this->db->fetchRow($sql, array());

    return $return["id"];
  }

  /*
  * 条件から契約一時保管データを取得する
  */
  public function getTmpInfo($condition) {
    $sql = "SELECT
      *
    FROM
      e_contract_tmp_info
    WHERE
      {$condition}
    ;";
    $return = $this->db->fetchRow($sql, array());

    return $return;
  }

}
