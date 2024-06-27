<?php

/**
 * ApproachList クラス
 *
 * アプローチリストを扱うDaoクラス
 *
 * @version 2015/08/14 16:56 ochi
 * @package Dao
*/
class AccessAuthDao extends AbstractDao {

	private $db;
	function __construct($db){
		$this->db = $db;
	}

	/**
	 * 条件を指定しアプローチリストを取得する
	 * @param unknown $condition
	 * @param unknown $order
	 * @param unknown $ordertype
	 * @return unknown
	 */
	public function getAccessAuth($controller, $action) {
		$sql = "SELECT
					* 
				FROM 
					access_auth 
				WHERE 
					controller_name = '{$controller}' AND 
					action_name = '{$action}' 
				LIMIT 1;
		";
		$rtn = $this->db->fetchRow($sql, array());
		return $rtn;
	}
}