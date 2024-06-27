<?php

/**
 * MailTemplateDao クラス
 *
 * クライアントのDaoクラス
 *
 * @version 2020/05/01 abe
 * @package Dao
*/
class MailTemplateDao extends AbstractDao {

	const MAIL_TYPE_TEXT = 	1;          // mail_type.textの場合
	const MAIL_TYPE_HTML = 	2;          // mail_type.htmlの場合

	private $db;
	private $tableName;
	function __construct($db){
		parent::init();
		$this->db = $db;
		$this->tableName = "mail_template";
	}

	/**
	 * 全件取得する
	 *
	 * @param int $clientId
	 * @param string $keyword
	 * @param string $order
	 * @param string $orderType
	 * @param int $page
	 * @param int $pagesize
	 * @return array [{}]
	 */
	public function fetchAll($clientId, $keyword = NULL, $order = NULL, $orderType = NULL, $page = NULL, $pagesize = NULL) {
		$keywordCondition = "";
		$limitCondition = "";

		// テンプレート名と件名で部分一致検索
		if(isset($keyword) && $keyword !== "") {
			$keywordCondition = "AND (
														`name` LIKE '%{$keyword}%'
														OR
														`subject` LIKE '%{$keyword}%'
													)";
		}

		// orderの指定が無ければ、作成日で降順
		if(empty($order) || empty($orderType)) {
			$order = "create_time";
			$orderType = "desc";
		}

		$orderCondition = "ORDER BY
												`{$order}`
												{$orderType}
											";

		// ページネーション設定
		if(!empty($page) && !empty($pagesize)) {
			$offset = ($page-1) * $pagesize;
			$limitCondition = "LIMIT
													{$pagesize}
												OFFSET
													{$offset}
												";
		}

		$sql = "
			SELECT
			 *
			FROM
			 {$this->tableName}
			WHERE
			 `client_id` = {$clientId} AND
			 `del_flg` = 0
			 $keywordCondition
			 $orderCondition
			 $limitCondition
		";

		return $this->db->fetchAll($sql);
	}

	/**
	 * 全件数を返す
	 *
	 * @param int $clientId
	 * @param string $keyword
	 * @return int
	 */
	public function fetchAllCount($clientId, $keyword=NULL) {
		$keywordCondition = "";

		// テンプレート名と件名で部分一致検索
		if(isset($keyword) && $keyword !== "") {
			$keywordCondition = "AND (
														`name` LIKE '%{$keyword}%'
														OR
														`subject` LIKE '%{$keyword}%'
													)";
		}

		$sql = "
			SELECT
			 count(id) as count
			FROM
			 {$this->tableName}
			WHERE
			 `client_id` = {$clientId} AND
			 `del_flg` = 0
			 $keywordCondition
		";
		$result = $this->db->fetchRow($sql);
		return $result["count"];
	}

	/**
	 * PKから一件返す
	 *
	 * @param int $id
	 * @return array {}
	 */
	public function fetchRow($id) {
		$sql = "
			SELECT
			 *
			FROM
			 {$this->tableName}
			WHERE
			 `id` = {$id}
		";

		return $this->db->fetchRow($sql);
	}

	/**
	 * 新規作成
	 *
	 * @param array $row{client_id, name, text, recipients, from, from_name, subject, bodytext, mail_type, fname_actual, fname_in_attached, staff_type, staff_id}
	 * @return boolean
	 */
	public function insert($row) {
		$record = array(
			"client_id"=> $row["client_id"],
			"name"=> $row["name"],
			"text"=> $row["text"],
			"recipients"=> $row["recipients"],
			"from"=> $row["from"],
			"from_name"=> $row["from_name"],
			"subject"=> $row["subject"],
			"bodytext"=> $row["bodytext"],
			"mail_type"=> $row["mail_type"],
			"fname_actual"=> $row["fname_actual"],
			"fname_in_attached"=> $row["fname_in_attached"],
			"staff_type"=> $row["staff_type"],
			"staff_id"=> $row["staff_id"],
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
	 * @param array $row{client_id, name, text, recipients, from, from_name, subject, bodytext, mail_type, fname_actual, fname_in_attached, staff_type, staff_id}
	 * @return boolean
	 */
	public function update($id, $row) {
		$row["update_time"] = new Zend_Db_Expr('now()');
		return $this->db->update($this->tableName, $row, "`id` = $id");
	}

	/**
	 * 削除
	 *
	 * @param int $id
	 * @return void
	 */
	public function delete($id) {
		$row["del_flg"] = 1;
		$row["update_time"] = new Zend_Db_Expr('now()');
		return $this->db->update($this->tableName, $row, "`id` = $id");

	}
}