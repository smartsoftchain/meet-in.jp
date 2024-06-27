<?php

/**
 * CompanyCountDao クラス
 *
 * 企業導入数を扱うDaoクラス
 *
 * @version 2022/06/13 15:22 tosa
 * @package Dao
*/
class CompanyCountDao extends AbstractDao {

	private $db;
	function __construct($db){
		$this->db = $db;
	}

	/**
	 * 導入企業数を取得する
	 * @return integer
	 */
	public function getCompanyNumber() {
		$sql = "SELECT
					number
				FROM 
					company_count 
				LIMIT 1;
		";
		$rtn = $this->db->fetchRow($sql, array());
		return isset($rtn['number']) ? $rtn['number'] : false;
	}

	/**
	 * 導入企業数を設定する
	 * @return integer
	 */
	public function setCompanyNumber($number) {

		// 既に登録済みかどうか
		if ($this->getCompanyNumber() !== false) {
			$sql = "UPDATE company_count SET number = {$number};";
		} else {
			$sql = "INSERT INTO company_count (number, create_time, update_time) values ({$number}, now(), now());";
		}

		try{
			$this->db->beginTransaction();
			$this->db->query($sql);
			$this->db->commit();
		} catch (Exception $e) {
			error_log("enterRoom Exception=[". $e->getMessage() ."]\n", 3, "/var/tmp/negotiation.log");
			$this->db->rollBack();
		}
	}
}
