<?php

/**
 * EContractDocumentMaterialDetailDao クラス
 *
 * 電子の詳細データを扱うDaoクラス
 *
 * @version 2020/11/20 18:30 Nishimura
 * @package Dao
*/
class EContractDocumentMaterialDetailDao extends AbstractDao {

	const TABLE_NAME  = "e_contract_document_material_detail";

	private $db;

	function __construct($db){
		parent::init();
		$this->db = $db;
	}

}
