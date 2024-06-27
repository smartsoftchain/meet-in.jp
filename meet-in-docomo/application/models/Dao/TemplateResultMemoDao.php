<?php

/**
 * TemplateResultMemoDao クラス
 *
 * カスタマイズした架電メモを扱うDaoクラス
 *
 * @version 2015/08/13 15:21 ochi
 * @package Dao
*/
class TemplateResultMemoDao extends AbstractDao {

	private $db;
	function __construct($db){
		$this->db = $db;
	}

	/**
	 * 登録
	 * @param unknown $data
	 * @param unknown $aliveIds
	 * @return unknown
	 */
	public function regist($data) {
		$record = array(
			'client_id' 					=> $data["client_id"],
			'template_approach_result_id'	=> $data["template_approach_result_id"],
			'name'							=> $data["name"],
			'view_flg'						=> $data["view_flg"],
			'del_flg'						=> $data["del_flg"],
			'update_date' 					=> new Zend_Db_Expr('now()')
		);
		if(is_null($data["id"]) || $data["id"] == ""){
			$record["id"]					= new Zend_Db_Expr( 'template_result_memo_increment( client_id , template_approach_result_id )');
			$record["create_date"]			= new Zend_Db_Expr('now()');
			$this->db->insert('template_result_memo', $record);
		}else{
			$this->db->update('template_result_memo', $record, "client_id = {$data['client_id']} AND template_approach_result_id = {$data["template_approach_result_id"]} AND id = {$data['id']}" );
		}
	}

	/**
	 * アポイント状況テンプレートを取得する
	 * @param unknown $clientId
	 * @return unknown
	 */
	public function getAppointSituationListById($clientId) {

		$selector = $this->db->select()->from("template_result_memo")
		->where("client_id = :client_id")
		->where("del_flg = '0'")
		->order("create_date");

		$list = $this->db->fetchAll($selector, array("client_id" => $clientId));

		return $list;
	}
	/**
	 * 架電ひも付きアポイント状況テンプレートを取得する
	 * @param unknown $clientId
	 * @param unknown $resultTelTemplateId
	 * @return unknown
	 */
	public function getAppointSituationListByApproachId($clientId , $resultTelTemplateId) {

		$selector = $this->db->select()->from("template_result_memo")
		->where("template_approach_result_id = :template_approach_result_id")
		->where("client_id = :client_id")
		->where("del_flg = '0'")
		->order(array("create_date", "id"));

		$list = $this->db->fetchAll($selector, array("client_id" => $clientId, "template_approach_result_id" => $resultTelTemplateId));

		return $list;
	}
	/**
	 * 架電結果リストを取得する
	 * @param unknown $clientId
	 * @return unknown
	 */
	public function getResultTelList($clientId) {

		$selector = $this->db->select()->from("template_approach_result")
		->where("client_id = :client_id")
		->where("approach_type = 1")
		->where("del_flg = '0'")
		->order("create_date");

		$list = $this->db->fetchAll($selector, array("client_id" => $clientId));

		return $list;
	}
	/**
	 * アプローチ結果に紐づく架電結果リストを取得する
	 * @param unknown $clientId
	 * @return unknown $resultTelTemplateId
	 */
	public function getApproachResultTelList($clientId, $resultTelTemplateId) {

		$selector = $this->db->select()->from("template_result_memo")
		->where("client_id = :client_id")
		->where("template_approach_result_id = :resultTelTemplateId")
		->where("view_flg = '1'")
		->where("del_flg = '0'")
		->order("create_date");

		$list = $this->db->fetchAll($selector, array("client_id" => $clientId, "resultTelTemplateId"=>$resultTelTemplateId));

		return $list;
	}
	
	/**
	 * PKを指定し架電結果リストを取得する
	 * @param unknown $clientId
	 * @return unknown $resultTelTemplateId
	 */
	public function getApproachResultTelByPK($clientId, $resultTelTemplateId, $id) {
		$selector = $this->db->select()->from("template_result_memo")
		->where("client_id = :client_id")
		->where("template_approach_result_id = :resultTelTemplateId")
		->where("id = :id")
		->where("del_flg = '0'")
		->order("create_date");
		$list = $this->db->fetchRow($selector, array("client_id" => $clientId, "resultTelTemplateId"=>$resultTelTemplateId, "id"=>$id));
		return $list;
	}
	
	/**
	 * 表示対象のカスタマイズしたアポイント状況テンプレートを取得する
	 * @param unknown $clientId
	 * @param unknown $resultTelTemplateId
	 * @return unknown
	 */
	public function getViewAppointSituationListById($clientId) {

		$selector = $this->db->select()->from("template_result_memo")
		->where("client_id = :client_id")
		->where("view_flg = '1'")
		->where("del_flg = '0'")
		->order("create_date");

		$list = $this->db->fetchAll($selector, array("client_id" => $clientId));

		return $list;
	}

	/**
	 * 登録
	 * @param unknown $data
	 * @return unknown
	 */
	public function setRegist($data) {
		
		$record = array(
			'client_id' 				  => $data["client_id"],
			'template_approach_result_id' => $data["template_approach_result_id"],
			'del_flg'					  => $data["del_flg"],
			'update_date' 				  => new Zend_Db_Expr('now()')
		);
		
		if (empty($data["id"])) {
			
			$record["id"]		   = new Zend_Db_Expr('template_result_memo_increment( client_id , template_approach_result_id )');
			$record["name"]		   = $data["name"];
			$record["view_flg"]	   = $data["view_flg"];
			$record["create_date"] = new Zend_Db_Expr('now()');
			
			//idが存在しない場合、新規登録
			$this->db->insert('template_result_memo', $record);
			
		} else {
			
			// 編集の場合
			if ($data["del_flg"] == 0) {
				$record["name"]		= $data["name"];
				$record["view_flg"]	= $data["view_flg"];
			}
			
			$where = array(
				"client_id = ?"                   => $data['client_id'],
				"id = ?"                          => $data['id'],
				"template_approach_result_id = ?" => $data['template_approach_result_id']
			);
			
			$this->db->update('template_result_memo', $record, $where);
		}

	}


}