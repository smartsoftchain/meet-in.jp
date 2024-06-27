<?php

/**
 * MasterStaffInvitationDao クラス
 *
 * クライアントのDaoクラス
 *
 * @version 2021/10/06 Nishimura
 * @package Dao
*/
class MasterStaffInvitationDao extends AbstractDao {

	private $db;
	private $tableName = "master_staff_invitation";


	function __construct($db){
		parent::init();
		$this->db = $db;
	}

	/**
	 * 招待メールテーブルから 指定条件に一致する全件取得する
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
	public function insert($sender, $email, $hashKey, $createTime) {
		$record = array(
			"send_client_id"		 => $sender["client_id"],
			"send_staff_type"		 => $sender["staff_type"],
			"send_staff_id"			 => $sender["staff_id"],
			"dprofile_email"         => $email, //dprofile_GeneralMlAddr
			"hash_key"               => $hashKey,
			"create_time"			 => $createTime,
			"delete_time"			 => null,
			"processed_time"		 => null,
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
	 * @param string $condition
	 * @return void
	 */
	public function delete($condition) {
		$row["delete_time"] = new Zend_Db_Expr('now()');
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
}
