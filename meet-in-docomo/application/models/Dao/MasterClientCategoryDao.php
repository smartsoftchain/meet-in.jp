<?php

/**
 * MasterClientCategoryDao クラス
 *
 * クライアントのDaoクラス
 *
 * @version 2015/08/19 19:00 sonoda
 * @package Dao
*/
class MasterClientCategoryDao extends AbstractDao {

	private $db;
	function __construct($db){
		$this->db = $db;
	}

	/**
	 * マスタークライアントカテゴリーの登録
	 * @param unknown $data
	 */
	public function regist($dataDict) {
		$record = array(
				'client_id' 		=> $dataDict["client_id"],
				'category1_id' 		=> $dataDict["category1_id"],
				'category2_id' 		=> $dataDict["category2_id"],
				'category3_id' 		=> $dataDict["category3_id"],
				'update_staff_type' => $dataDict["update_staff_type"],
				'update_staff_id' 	=> $dataDict["update_staff_id"],
				'del_flg' 			=> $dataDict["del_flg"],
				'update_date' 		=>  new Zend_Db_Expr('now()'),
		);

		if(!array_key_exists("id", $dataDict) || $dataDict['id'] == ''){
			$record['create_date'] = new Zend_Db_Expr('now()');
			$this->db->insert('master_client_category', $record);
		}else{
			// 自サーバーに登録
			$this->db->update('master_client_category', $record, "id = {$dataDict['id']}" );
		}
	}
	/**
	 * マスタークライアントカテゴリーの削除
	 * @param unknown $data
	 */
	public function delete($condition) {
		$record = array(
				'del_flg' 		=> "1"
		);
		$this->db->update('master_client_category', $record, $condition );
	}
	
	/**
	 * クライアントIDに紐づく「業種１」「業種２」「業種３」情報を取得する
	 * @param unknown $client_id
	 * @return unknown
	 */
	public function getClientAndCategory($client_id) {
		$selector = $this->db->select()
									->from(array("a"=>"master_client_category"))
									->joinInner(
										array("b"=>"business_category1"),
										'a.category1_id = b.id',
										array("b.id as category1_id", "b.name as category1_name")
									)
									->joinLeft(
										array("c"=>"business_category2"),
										'b.id = c.business_category1_id and a.category2_id = c.id',
										array("c.id as category2_id","c.name as category2_name")
									)
									->joinLeft(
										array("d"=>"business_category3"),
										'b.id = d.business_category1_id and c.id = d.business_category2_id and a.category3_id = d.id',
										array("d.id as category3_id","d.name as category3_name")
									)
									->where("a.client_id = :client_id")
									->where("a.del_flg = '0'")
									->order("a.id");

		$list = $this->db->fetchAll($selector, array("client_id" => $client_id));
		return $list;
	}
}