<?php

/**
 * NegotiationResultTmplDao クラス
 *
 * 商談結果テンプレートデータを扱うDaoクラス
 *
 * @version 2015/06/06 19:02 ochi
 * @package Dao
*/
class NegotiationResultTmplDao extends AbstractDao {

	const TABLE_NAME = "negotiation_result_template";
	
	private $db;

	function __construct($db){
		parent::init();
		$this->db = $db;
	}
	public function returnNullZero($val) {
		if ( $val == null) {
			return "0";
		} else {
			return $val;
		}
	}
	/**
	 * 条件を指定し資料の件数を取得する
	 * @param unknown $condition	検索条件
	 * @return unknown
	 */
	public function getTmplCount($condition) {
		$sql = "SELECT
					COUNT(template_id) as count
				FROM
					negotiation_result_template
				WHERE
					{$condition}
		";
		$rtn = $this->db->fetchRow($sql, array());
		return $rtn["count"];
	}
	/**
	 * 条件を指定し担当者の一覧を取得する
	 * @param unknown $condition	検索条件
	 * @param unknown $order		ソートを行う為のカラム
	 * @param unknown $ordertype	昇順、降順
	 * @param unknown $page			ページインデックス
	 * @param unknown $limit		データ取得件数
	 * @return unknown
	 */
	public function getTmplList($condition, $order, $ordertype, $page, $limit) {
		$offset = 0;
		$page = $page - 1;
		if($page > 0){
			$offset = $page * $limit;
		}
		$sql = "SELECT
					template_id,
					client_id,
					template_name,
					shareable_flg,
					result_list,
					next_action_list,
					template_del_flg,
					create_staff_type,
					create_staff_id,
					update_staff_type,
					update_staff_id,
					create_date,
					update_date
				FROM
					negotiation_result_template
		";
		if(isset($condition) && !empty($condition)) {
			$sql .= " WHERE {$condition} ";
		}
		if(isset($order) && !empty($order)) {
			$sql .= " ORDER BY {$order} ";
			if(isset($ordertype) && !empty($ordertype)) {
					$sql .= " {$ordertype} ";
			}
		}
		if(isset($limit) && !empty($limit)) {
			$sql .= " LIMIT {$limit} ";
		}
		if(isset($offset) && !empty($offset)) {
			$sql .= " OFFSET {$offset} ";
		}
		$rtn = $this->db->fetchAll($sql, array());
		return $rtn;
	}
	/**
	 * 条件を指定し担当者を取得する
	 * @param unknown $condition	検索条件
	 * @return unknown
	 */
	public function setTmpl($form) {
		// material_idがなければ新規
		$result = array();
		$record = array(
			'template_name'				=> $form["template_name"],
			'client_id'						=> $form["client_id"],
			'shareable_flg' 			=> $this->returnNullZero($form["shareable_flg"]),
			'result_list'					=> json_encode($form["negotiation_result_list"]),
			'next_action_list'		=> json_encode($form["negotiation_next_action_list"]),
			'update_date'					=> new Zend_Db_Expr('now()'),
			'update_staff_type'		=> $form['staff_type'],
			'update_staff_id'			=> $form['staff_id'],
		);
		if (!isset($form["template_id"]) || empty($form["template_id"])) {
			// 新規
			$record['create_date'] = new Zend_Db_Expr('now()');
			$record['create_staff_type'] = $form['staff_type'];
			$record['create_staff_id'] = $form['staff_id'];

			$this->db->insert('negotiation_result_template', $record);
		} else {
			// 更新
			$this->db->update('negotiation_result_template', $record, " template_id = {$form['template_id']}");
		}
		return $result;
	}
	public function getTmplRow($condition) {
		$sql = "SELECT
					template_id,
					client_id,
					template_name,
					shareable_flg,
					result_list,
					next_action_list,
					template_del_flg,
					create_staff_type,
					create_staff_id,
					update_staff_type,
					update_staff_id,
					create_date,
					update_date
				FROM
					negotiation_result_template
				WHERE
					{$condition} AND template_del_flg = 0
		";
		$rtn = $this->db->fetchRow($sql, array());
		return $rtn;
	}
	public function deleteTmpl($condition) {
		$record = array(
			'template_del_flg' => 1,
		);
		$result = $this->db->update('negotiation_result_template', $record, $condition);
		return $result;
	}
}
