<?php

/**
 * ShareRoomNameTemplateDao クラス
 *
 * クライアントのDaoクラス
 *
 * @version 2022/02/01
 * @package Dao
*/
class ShareRoomNameTemplateDao extends AbstractDao {

	private $db;
	private $tableName;
	function __construct($db){
		parent::init();
		$this->db = $db;
		$this->tableName = "share_room_name_template";
	}


	/**
	 * 条件指定して一件取得
	 *
	 * @param int $clientId
	 * @param int $staffId
	 * @param string $staffType
	 * @return array {}
	 */
	public function fetchRow($clientId, $staffId, $staffType) {
		$sql = "
			SELECT
			 *
			FROM
			 {$this->tableName}
			WHERE
			 `client_id` = {$clientId} AND
			 `staff_id` = {$staffId} AND
			 `staff_type` = '{$staffType}' AND
			 `del_flg` = 0
		";

		$result = $this->db->fetchRow($sql);
		if (empty($result)) {
			$result = null;
		}

		return $result;
	}

	/**
	 * 新規作成
	 *
	 * @param array $row{client_id,  staff_id, staff_type, text}
	 * @return boolean
	 */
	public function insert($row) {
		$record = array(
			"client_id"=> $row["client_id"],
      "staff_type"=> $row["staff_type"],
			"staff_id"=> $row["staff_id"],
			"text"=> $row["text"],
			"create_time"=> new Zend_Db_Expr('now()'),
			"update_time"=> new Zend_Db_Expr('now()'),
			"del_flg"=> 0
		);

		return $this->db->insert($this->tableName, $record);
	}

	/**
	 * 編集
	 *
	 * @param int $id
	 * @param array $row{client_id, staff_id, staff_type, text}
	 * @return boolean
	 */
	public function update($id, $row) {
		$row["update_time"] = new Zend_Db_Expr('now()');
		return $this->db->update($this->tableName, $row, "`id` = $id");
	}

	/**
	 * 削除
	 *
	 * @param string $staffType
	 * @param int $staffId
	 * @return void
	 */
	public function delete($staffType, $staffId) {
		$row["del_flg"] = 1;
		$row["update_time"] = new Zend_Db_Expr('now()');
		return $this->db->update($this->tableName, $row, "staff_type = '{$staffType}' AND staff_id = {$staffId}");
	}
}
