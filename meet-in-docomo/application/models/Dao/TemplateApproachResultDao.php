<?php

/**
 * TemplateApproachResultDao クラス
 *
 * アプローチ結果を扱うDaoクラス
 *
 * @package Dao
*/
class TemplateApproachResultDao extends AbstractDao {

	private $db;
	function __construct($db){
		parent::init();
		$this->db = $db;
	}

	/**
	 * アプローチ結果の登録
	 * @param unknown $dataDict
	 * @return unknown
	 */
	public function regist($dataDict) {
		$resultId = 0;
		$record = array(
				'client_id'			=> $dataDict["client_id"],
				'approach_type'		=> $dataDict["approach_type"],
				'name'				=> $dataDict["name"],
				'view_flg'			=> $dataDict["view_flg"],
				'update_staff_type'	=> $dataDict["update_staff_type"],
				'update_staff_id'	=> $dataDict["update_staff_id"],
				'del_flg'			=> $dataDict["del_flg"],
				'update_date'		=> new Zend_Db_Expr('now()')
		);
		if(!array_key_exists("id", $dataDict) || $dataDict['id'] == ''){
			$record['id'] = new Zend_Db_Expr('template_approach_result_increment(client_id, approach_type)');
			$record['create_date'] = new Zend_Db_Expr('now()');
			// 自サーバーに登録
			$this->db->insert('template_approach_result', $record);
			// TODO 登録したapproach_listのidをMAXで取得する（担当者指定なのでアカウントの使いまわしがなければ必ず正確な値が取得できるはず）
			$sql = "SELECT
						MAX(id) as id
					FROM
						template_approach_result
					WHERE
						client_id			= :clientId AND
						approach_type		= :approachType AND 
						name				= :name AND 
						update_staff_type	= :updateStaffType AND
						update_staff_id		= :updateStaffId";
			$rtn = $this->db->fetchRow($sql, array("clientId"=>$dataDict["client_id"], "approachType"=>$dataDict["approach_type"], "name"=>$dataDict["name"], "updateStaffType"=>$dataDict["update_staff_type"], "updateStaffId"=>$dataDict["update_staff_id"]));
			$resultId = $rtn["id"];
		}else{
			// 自サーバーに登録
			$this->db->update('template_approach_result', $record, "client_id = {$dataDict['client_id']} AND approach_type = {$dataDict["approach_type"]} AND id = {$dataDict["id"]}" );
			$resultId = $dataDict["id"];
		}
		return $resultId;
	}
	
	/**
	 * メールDMアプローチ結果の登録
	 * @param unknown $dataDict
	 * @return unknown
	 */
	public function insertMailResult($dataDict) {
		$resultId = 0;
		$record = array(
				'id'				=> $dataDict["id"],
				'client_id'			=> $dataDict["client_id"],
				'approach_type'		=> $dataDict["approach_type"],
				'name'				=> $dataDict["name"],
				'view_flg'			=> $dataDict["view_flg"],
				'update_staff_type'	=> $dataDict["update_staff_type"],
				'update_staff_id'	=> $dataDict["update_staff_id"],
				'del_flg'			=> $dataDict["del_flg"],
				'update_date'		=> new Zend_Db_Expr('now()')
		);
		$record['create_date'] = new Zend_Db_Expr('now()');
		// 自サーバーに登録
		$this->db->insert('template_approach_result', $record);
		return $dataDict["id"];
	}
	
	/**
	 * アプローチ結果画面の表示データ
	 * @param unknown $condition
	 * @param unknown $order
	 * @param unknown $ordertype
	 * @return unknown
	 */
	public function getTemplateApproachResultAndTab($condition, $order, $ordertype){
		$sql = "
				SELECT 
					a.client_id, 
					a.approach_type, 
					a.id, 
					a.name, 
					a.view_flg, 
					a.update_staff_type, 
					a.update_staff_id, 
					a.del_flg, 
					GROUP_CONCAT(DISTINCT c.name order by c.id separator '<br>') as tab_name 
				FROM 
					template_approach_result as a 
				LEFT OUTER JOIN 
					tab_and_result_relation as b 
				ON 
					a.client_id = b.client_id AND 
					a.approach_type = b.approach_type AND 
					a.id = b.approach_result_id 
				LEFT OUTER JOIN 
					leadtab_and_result_relation as d 
				ON 
					a.client_id = d.client_id AND 
					a.approach_type = d.approach_type AND 
					a.id = d.approach_result_id 
				LEFT OUTER JOIN 
					template_approach_tab as c 
				ON 
					a.client_id = c.client_id AND 
					(
						(b.approach_type = c.approach_type AND b.approach_tab_id = c.id ) OR 
						(c.approach_type = 4 AND d.approach_tab_id = c.id ) 
					) AND 
					c.del_flg = 0 
				
				WHERE 
					{$condition} 
				GROUP BY 
					a.client_id, a.approach_type, a.id 
				ORDER BY 
					{$order} {$ordertype}
				";
		$rtn = $this->db->fetchAll($sql, array());
		return $rtn;
	}
	
	/**
	 * 条件を指定しアプローチ結果を取得する
	 * @param unknown $condition
	 * @param unknown $order
	 * @param unknown $ordertype
	 * @return unknown
	 */
	public function getTemplateApproachResultByType($approach_type){
		
		$sql = "
				SELECT
					*
				FROM
					template_approach_result as a
				WHERE
					a.client_id = :client_id AND
					a.approach_type = :approach_type AND
					a.view_flg = 1 AND
					a.del_flg = 0
		";
		
		$rtn = $this->db->fetchAll($sql, array(
			"client_id"     => $this->user["client_id"],
			"approach_type" => $approach_type
		));
		
		return $rtn;
	}
	
	/**
	 * 編集用にアプローチ結果を取得する
	 * @param unknown $condition
	 * @param unknown $order
	 * @param unknown $ordertype
	 * @return unknown
	 */
	public function getTemplateApproachResultList($condition){
	
		$sql = "
				SELECT
					id, name
				FROM
					template_approach_result
				WHERE
					{$condition};
		";
		$rtn = $this->db->fetchAll($sql, array());
		return $rtn;
	}
	
	/**
	 * 条件を指定しデータを１件取得する
	 * アプローチ履歴で使用する為、削除フラグと表示フラグをみない
	 * @param unknown $clientId
	 * @param unknown $approachType
	 * @param unknown $id
	 * @return unknown
	 */
	public function getTemplateApproachResultRow($condition){
		$sql = "
				SELECT
					*
				FROM
					template_approach_result 
				WHERE
					{$condition};
		";
		$rtn = $this->db->fetchRow($sql, array());
		return $rtn;
	}
	
	/**
	 * 条件を指定しアプローチ結果を取得する
	 * @param unknown $condition
	 * @param unknown $order
	 * @param unknown $ordertype
	 * @return unknown
	 */
	public function getTemplateApproachResultByCondition($condition, $order, $ordertype){
		$sql = "
				SELECT
					* 
				FROM
					template_approach_result as a
				WHERE
					{$condition}
				ORDER BY
					{$order} {$ordertype}
		";
		$rtn = $this->db->fetchAll($sql, array());
		return $rtn;
	}
	
	/**
	 * アプローチタブに紐付く架電結果を取得する
	 * @param unknown $clientId
	 * @return unknown
	 */
	public function getApproachTabFromResult($clientId, $approachType, $approachTabId) {
		$sql = "
				SELECT
					b.*
				FROM
					(
						SELECT 
							approach_type, 
							approach_result_id 
						FROM 
							tab_and_result_relation 
						WHERE 
							client_id = {$clientId} AND 
							approach_type = {$approachType} AND 
							approach_tab_id = {$approachTabId} 
						GROUP BY 
							approach_type, approach_result_id 
					) as a
				INNER JOIN
					template_approach_result as b
				ON 
					a.approach_type = b.approach_type AND 
					a.approach_result_id = b.id 
				WHERE
					b.del_flg = 0
				GROUP BY
					b.approach_type, b.id
				ORDER BY
					b.approach_type, b.id;";
		$rtn = $this->db->fetchAll($sql, array());
		return $rtn;
	}
	
	/**
	 * アプローチリストに紐付くタブから、タブに紐付く架電結果を取得する
	 * @param unknown $clientId
	 * @return unknown
	 */
	public function getApproachListFromTabFromResult($condition) {
		$sql = "
				SELECT
					c.* 
				FROM 
					(
						SELECT 
							client_id, 
							approach_tab_type, 
							approach_tab_id 
						FROM 
							approach_list_and_tab_relation 
						WHERE 
							{$condition} 
						ORDER BY 
							view_order
					) as a 
				INNER JOIN 
					tab_and_result_relation as b 
				ON 
					a.client_id = b.client_id AND 
					a.approach_tab_type = b.approach_type AND 
					a.approach_tab_id = b.approach_tab_id 
				INNER JOIN 
					template_approach_result as c 
				ON 
					b.client_id = c.client_id AND 
					b.approach_type = b.approach_type AND 
					b.approach_result_id = c.id 
				WHERE 
					c.del_flg = 0 
				GROUP BY  
					c.approach_type, c.id 
				ORDER BY
					c.approach_type, c.id;";
		$rtn = $this->db->fetchAll($sql, array());
		return $rtn;
	}
	
	/**
	 * 一斉発信の架電結果ステータスはIDを指定して登録するので、個別queryとする
	 * @param unknown $clientId
	 * @return unknown
	 */
	public function registMultipleTelephoneResult($clientId) {
		$sql = "INSERT INTO template_approach_result (client_id, approach_type, id, name, view_flg, update_staff_type, update_staff_id, del_flg, create_date, update_date) VALUES ('{$clientId}', 1, 10, '一斉発信済', 1, 'AA', 1, 0, now(), now());";
		$this->db->query($sql);
	}
}