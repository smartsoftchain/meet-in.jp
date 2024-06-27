<?php

/**
 * CollaborativeServicesProvidedDataDao クラス
 *
 * クライアントのDaoクラス
 *
 * @version 2021/10/06 Nishimura
 * @package Dao
*/
class CollaborativeServicesProvidedDataDao extends AbstractDao {

	private $db;
	private $tableName = "collaborative_services_provided_data";


	function __construct($db){
		parent::init();
		$this->db = $db;
	}

	/**
	 * 連携データからスタッフ情報を取得する.
	 * @param unknown $condition
	 * @return unknown
	 */
	public function getMasterStaffAllByAccountID($accountid){
		$sql = "
			SELECT
				b.*,
				a.accountid,
				a.DocomoID,
				a.dprofile_email
			FROM
				collaborative_services_provided_data as a,
				master_staff_new as b
			WHERE
				a.staff_type = b.staff_type AND
				a.staff_id   = b.staff_id   AND
				accountid = \"{$accountid}\"
		";
		$rtn = $this->db->fetchAll($sql);
		return $rtn[0];
	}

	/**
	 * DoCoMoログ通知をする対象のデータ
	 */
	public function getDoCoMoLogNotification($expireContractPeriod){
		$sql = "
			SELECT
				accountid, docomoid
			FROM
				master_staff_new as a,
				collaborative_services_provided_data as b
			WHERE
				a.staff_id = b.staff_id AND
				a.staff_del_flg = 0 AND
				a.client_id IN (
					SELECT
						client_id
					FROM
						master_client_new
					WHERE
						contract_period_start_date <= \"{$expireContractPeriod}\" AND
						(
							contract_period_end_date >= \"{$expireContractPeriod}\" OR
							contract_period_end_date = \"0000-00-00 00:00:00\" OR
							contract_period_end_date IS NULL
						)
				);
		";
		$rtn = $this->db->fetchAll($sql);
		return $rtn;
	}

	/**
	 * 全件取得する
	 *
	 * @param string $condition
	 * @param string $order
	 * @param string $orderType = "asc" or "desc"
	 * @return array
	 */
	public function fetchAll($condition= NULL, $order = NULL, $orderType = NULL) {
		$sql = "SELECT * FROM {$this->tableName}";
		if($condition != NULL) {
			$sql = $sql." WHERE {$condition}";
		}
		if($order != NULL) {
			$sql = $sql." ORDER BY {$order}";
			if($orderType != NULL) {
				 $sql = $sql." {$orderType}";
			}
		}
		return $this->db->fetchAll($sql);
	}

	/**
	 * 全件数を返す
	 *
	 * @param string $condition
	 * @return int
	 */
	public function fetchAllCount($condition = NULL) {
		$sql = "SELECT count(*) as count FROM {$this->tableName}";
		if($condition != NULL) {
			$sql = $sql." WHERE {$condition}";
		}
		$result = $this->db->fetchRow($sql);
		return 0 < count($result) ? $result["count"] : 0;
	}

	/**
	 * 新規作成
	 *
	 * @param  array $row
	 * @return boolean
	 */
	public function insert($row) {
		$record = array(
			"staff_type"             => $row["staff_type"],
			"staff_id"               => $row["staff_id"],
			"accountid"              => $row["accountid"],
			"DocomoID"               => $row["DocomoID"],
			"dprofile_email"         => $row["dprofile_email"]
		);

		$this->db->beginTransaction();
		try {
			$result = $this->db->insert($this->tableName, $record);
			$this->db->commit();
		} catch(Exception $e) {
			$this->db->rollBack();
			error_log($e->getMessage());
			throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
		}
		return $result;
	}

	/**
	 * 編集
	 *
	 * @param string $condition
	 * @param array $row
	 * @return boolean
	 */
	public function update($condition, $row) {
		$this->db->beginTransaction();
		try {
			$result = $this->db->update($this->tableName, $row, $condition);
			$this->db->commit();
		} catch(Exception $e) {
			$this->db->rollBack();
			error_log($e->getMessage());
			throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
		}
		return $result;
	}

	/**
	 * 削除
	 *
	 * @param unknown $staffType スタッフタイプ.
	 * @param unknown $staffId	 担当者ID
	 * @return void
	 */
	public function deletStaff($staffType, $staffId) {
		return $this->db->delete($this->tableName, "staff_type = '{$staffType}' AND staff_id = {$staffId}");
	}

	/**
	 * 削除
	 *
	 * @param string $condition
	 * @return void
	 */
	public function delete($condition) {
		$this->db->beginTransaction();
		try {
			$result = $this->db->delete($this->tableName, $condition);
			$this->db->commit();
		} catch(Exception $e) {
			$this->db->rollBack();
			error_log($e->getMessage());
			throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
		}
		return $result;
	}
}
