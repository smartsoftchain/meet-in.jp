<?php
/**
* EContractCertificateDao クラス
* 電子契約API 電子証明書データを扱うDaoクラス
* @package Dao
**/
class EContractCertificateDao extends AbstractDao
{
    private $db;

    public function __construct($db)
    {
        parent::init();
        $this->db = $db;
    }

    /**
    * 電子証明書情報を1件取得
    * @param unknown $condition
    * @throws Exception
    */
    public function getEContractCertificate($condition)
    {
        $sql = "SELECT
        client_id,
        lastname,
        firstname,
        lastnameReading,
        firstnameReading,
        email,
        phone,
        postalCode,
        address,
        organizationName,
        corporationNumber,
        title,
        department,
        businessName,
        status,
        validFrom,
        validTo,
        create_date,
        update_date
      FROM
        e_contract_certificate
      WHERE
        {$condition}
    ;";
        $return = $this->db->fetchRow($sql, array());
        return $return;
    }

    /**
    * 電子証明書情報登録
    * @param unknown $form
    * @throws Exception
    */
    public function certificateRegist($form)
    {
        $record = array(
      'client_id'         => $form['client_id'],
      'lastname'          => $form['lastname'],
      'firstname'         => $form['firstname'],
      'lastnameReading'   => $form['lastnameReading'],
      'firstnameReading'  => $form['firstnameReading'],
      'email'             => $form['email'],
      'phone'             => $form['phone'],
      'postalCode'        => $form['postalCode'],
      'address'           => $form['address'],
      'organizationName'  => $form['organizationName'],
      'corporationNumber' => $form['corporationNumber'],
      'title'             => $form['title'],
      'department'        => $form['department'],
      'businessName'      => $form['businessName'],
      'onetimepass'      => $form['onetimepass'],
      'status'            => $form['status'],
      'validFrom'         => $form['validFrom'],
      'validTo'           => $form['validTo'],
      'create_date'       => new Zend_Db_Expr('now()'),
      'update_date'       => new Zend_Db_Expr('now()')
    );
        // 自サーバーに登録
        $this->db->insert('e_contract_certificate', $record);
    }

    /**
    * 電子証明書情報更新
    * @param unknown $form
    * @throws Exception
    */
    public function certificateUpdate($form)
    {
        $record = array(
      'client_id'         => $form['client_id'],
      'lastname'          => $form['lastname'],
      'firstname'         => $form['firstname'],
      'lastnameReading'   => $form['lastnameReading'],
      'firstnameReading'  => $form['firstnameReading'],
      'email'             => $form['email'],
      'phone'             => $form['phone'],
      'postalCode'        => $form['postalCode'],
      'address'           => $form['address'],
      'organizationName'  => $form['organizationName'],
      'corporationNumber' => $form['corporationNumber'],
      'title'             => $form['title'],
      'department'        => $form['department'],
      'businessName'      => $form['businessName'],
      'onetimepass'      => $form['onetimepass'],
      'status'            => $form['status'],
      'validFrom'         => $form['validFrom'],
      'validTo'           => $form['validTo'],
      'create_date'       => $form['create_date'],
      'update_date'       => new Zend_Db_Expr('now()')
    );
        // 更新
        $this->db->update('e_contract_certificate', $record, "client_id = {$form['client_id']}");
    }
}
