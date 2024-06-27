<?php

/**
 * MasterClientServiceDao クラス
 *
 * クライアントのDaoクラス
 *
 * @version 2015/08/11 16:16 ochi
 * @package Dao
*/
class MasterClientServiceDao extends AbstractDao {

	private $db;
	function __construct($db){
		parent::init();
		$this->db = $db;
	}

	/**
	 * マスタークライアントサービスの登録
	 * @param unknown $data
	 */
	public function regist($dataDict) {
		$clientServiceId = "";
		$record = array(
				'client_id' 		=> $dataDict["client_id"],
				'service_name' 		=> $dataDict["service_name"],
				'update_staff_type' => $dataDict["update_staff_type"],
				'update_staff_id' 	=> $dataDict["update_staff_id"],
				'del_flg' 			=> $dataDict["del_flg"],
				'update_date' 		=>  new Zend_Db_Expr('now()'),
		);

		if(!array_key_exists("id", $dataDict) || $dataDict['id'] == ''){
			$record['create_date'] = new Zend_Db_Expr('now()');
			$this->db->insert('master_client_service', $record);
			// client_idcharを設定する
			$clientServiceId = $this->db->lastInsertId();
		}else{
			// 自サーバーに登録
			$this->db->update('master_client_service', $record, "id = {$dataDict['id']}" );
			$clientServiceId = $dataDict['id'];
		}
		return $clientServiceId;
	}

	/**
	 * マスタークライアントサービスのmigrate登録
	 * @param unknown $data
	 */
	public function migrateRegist($data) {
			$this->db->insert('master_client_service', $data);
	}

	/**
	 * マスタークライアントサービスの削除
	 * @param unknown $data
	 */
	public function delete($condition) {
		$record = array(
				'del_flg' 			=> "1"
		);
		$this->db->update('master_client_service', $record, $condition );
	}
	
	/**
	 * クライアントに紐付くサービス/商品名を取得する
	 */
	public function getClientServiceList($clientId){
		$sql = "
				SELECT
					* 
				FROM
					master_client_service
				WHERE
					client_id = :clientId AND 
					del_flg = 0
				ORDER BY id ";
		$res = $this->db->fetchAll($sql, array("clientId"=>$clientId));
		return $res;
	}
	
	/**
	 * クライアントIDとサービス/商品名IDを指定し一意に取得する
	 */
	public function getClientServiceRow($id, $clientId){
		$sql = "
				SELECT
					*
				FROM
					master_client_service
				WHERE 
					id = :id AND 
					client_id = :clientId AND 
					del_flg = 0";
		$res = $this->db->fetchRow($sql, array("id"=>$id, "clientId"=>$clientId));
		return $res;
	}
	
	/**
	 * クライアントIDとサービス/商品名IDを指定し一意に取得する
	 */
	public function getAllClientServiceRow($id, $clientId){
		$sql = "
				SELECT
					*
				FROM
					master_client_service
				WHERE
					id = :id AND
					client_id = :clientId";
		$res = $this->db->fetchRow($sql, array("id"=>$id, "clientId"=>$clientId));
		return $res;
	}
	
	/**
	 * client_idを元にプロジェクトとの紐づきと共にサービス/商品名を取得する
	 */
	public function getProjectServiceList($clientId){

		$sql = "
				SELECT
					a.*,
					COALESCE(b.client_service_id, '0') as project_relation
				FROM
					master_client_service as a
				LEFT OUTER JOIN
					(
						SELECT
							client_id,
							client_service_id
						FROM
							approach_list
						WHERE
							client_id = '".$clientId."' AND
							del_flg = '0'
						GROUP BY
							client_id, client_service_id
					) as b
				ON
					a.client_id = b.client_id AND
					a.id = b.client_service_id
				WHERE
					a.client_id = '".$clientId."' AND
				 	a.del_flg = 0
				ORDER BY a.id ";

		$res = $this->db->query($sql);

		return $res->fetchAll();
	}

	/**
	 * 対象のクライアント情報に紐づくサービス・商品名を更新（更新・登録）
	 * @param unknown $form
	 * @return unknown
	 */
	public function registService($serviceRecord) {
		
		$record = array(
			'client_id'         => $this->user["client_id"],
			'service_name'      => $serviceRecord["service_name"],
			'update_staff_id'   => $this->user['staff_id'],
			'update_staff_type' => $this->user['staff_type'],
			'update_date'       => new Zend_Db_Expr('now()')
		);
		
		//idが存在しない場合、新規登録
		if (empty($serviceRecord["id"])) {
			
			$record['create_date'] = new Zend_Db_Expr('now()');	// 登録日を設定する

			// 自サーバーに登録
			$this->db->insert('master_client_service', $record);
			
		} else {
			
			$where = array(
				"id = ?" => $serviceRecord["id"]
			);
			
			// 自サーバーに登録
			$this->db->update('master_client_service', $record, $where);
		}
	}

	/**
	 * 対象のクライアント情報に紐づくサービス・商品名を削除
	 * @param unknown $form
	 * @return unknown
	 */
	public function deleteService($deleteId) {
		
		$record = array(
			'del_flg'           => 1,
			'update_staff_id'   => $this->user['staff_id'],
			'update_staff_type' => $this->user['staff_type'],
			'update_date'       => new Zend_Db_Expr('now()')
		);
		
		$where = array(
			"id = ?" => $deleteId
		);
		
		// 自サーバーに登録
		$this->db->update('master_client_service', $record, $where);
	}
}