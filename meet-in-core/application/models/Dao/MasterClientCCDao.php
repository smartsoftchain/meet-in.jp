<?php

/**
 * MasterClientCategoryDao クラス
 *
 * クライアントのDaoクラス
 *
 * @version 2015/08/19 19:00 sonoda
 * @package Dao
*/
class MasterClientCCDao extends AbstractDao {

	private $db;
	function __construct($db){
		parent::init();
		$this->db = $db;
	}

	/**
	 * メールCC先の登録または更新を行う
	 * @param unknown $cc_list
	 */
	public function registAllCC($cc_list) {

		foreach ($cc_list as $cc) {
			
			$record = array(
				'mail_address' => $cc['address'],
				'update_date'  =>  new Zend_Db_Expr('now()'),
			);

			$cc_id = $cc['id'];

			if (is_null($cc_id)) {

				$record['client_id']   = $this->user["client_id"];
				$record['staff_type']  = $this->user["staff_type"];
				$record['staff_id']    = $this->user["staff_id"];
				$record['create_date'] = new Zend_Db_Expr('now()');								// 登録日を設定する

				$this->db->insert('master_client_cc', $record);

			} else {
				
				$where = array(
					"staff_type = ?" => $this->user['staff_type'],
					"staff_id = ?"   => $this->user['staff_id'],
					"id = ?"         => $cc_id
				);

				if($cc['status'] == 'delete'){
					$record['del_flg'] = 1;
				}

				$this->db->update('master_client_cc', $record, $where);
			}
		}
	}

	/**
	 * クライアントに紐付くCC設定を取得する
	 * @param unknown $client_id
	 */
	public function getMailCcByClientId($clientId) {
	
		$sql = "SELECT 
					* 
				FROM 
					master_client_cc 
				WHERE 
					client_id = :clientId AND 
					del_flg=0 
				ORDER BY 
					update_date";
		return $this->db->fetchAll($sql, array("clientId"=>$clientId));
	}
	
	/**
	 * クライアントに紐付くCC設定を条件を指定し取得する
	 * @param unknown $client_id
	 */
	public function getAllMailCcByCondition($condition, $order, $ordertype) {
	
		$sql = "SELECT
					*
				FROM
					master_client_cc
				WHERE
					{$condition} 
				ORDER BY
					{$order} {$ordertype}";
		return $this->db->fetchAll($sql, array());
	}
	
	
	/**
	 * 現在のCC設定を取り出す
	 */
	public function getCurrentClientAndCC () {

		$sql = "select
					id
				from
					master_client_cc
				where
					client_id = {$this->user["client_id"]} and
					del_flg = 0";

		return $this->db->fetchAll($sql);
	}

	/**
	 * // クライアントの全プロジェクトに対して更新をしていく TODO master_clientとJOINするのではなく、直接ApproachList内のclient_idを検索したら駄目なのか？
	 * @param unknown $client_id
	 */
	public function getAllClientsProjectList($client_id){

		$sql = "
				select
					cl.client_id
					,pl.id
				from
					master_client as cl
					left outer join approach_list as pl on
						pl.client_id = cl.client_id
				where
					cl.client_id={$client_id} and
					cl.client_del_flg=0 and
					pl.del_flg=0
				";

		return $this->db->fetchAll($sql);
	}
	
	/**
	 * 対象のクライアント情報に紐づくCCメールアドレス情報を取得
	 * @param unknown $client_id
	 * @return unknown
	 */
	public function getClientCCList() {
	
		$sql = "select
					id,
					mail_address as address
				from
					master_client_cc
				where
					client_id = :client_id and
					del_flg = 0";
	
		$cc_mail_address_list = $this->db->fetchAll($sql, array(
			"client_id" => $this->user["client_id"]
		));
	
		return $cc_mail_address_list;
	}
}