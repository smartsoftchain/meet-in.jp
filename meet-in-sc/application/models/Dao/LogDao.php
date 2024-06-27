<?php

/**
 * LogDao クラス
 *
 * 操作ログ出力を扱うDaoクラス
 *
 * @version 2015/08/13 15:16 ochi
 * @package Dao
*/
class LogDao extends AbstractDao {
	
	private $db;
	function __construct($db){
		parent::init();
		$this->db = $db;
	}
	
	/**
	 * 登録
	 * Enter description here ...
	 * @param unknown_type $form
	 * @throws Exception
	 */
	public function regist($dict) {
		$record = array(
				'staff_id'		=> $dict['staff_id'],
				'staff_type'	=> $dict['staff_type'],
				'client_id'		=> $dict['client_id'],
				'create_time'	=> new Zend_Db_Expr('now()'),
				'action_name'	=> $dict['action_name'],
				'send_data'		=> $dict['send_data']
		);
		$this->db->insert('logs', $record);
	}

	/**
	 * migrate登録
	 * Enter description here ...
	 * @param unknown_type $data
	 * @throws Exception
	 */
	public function migrateRegist($data) {
		$this->db->insert('logs', $data);
	}

	/**
	 * ログ取得
	 * @param unknown $talkBindId
	 * @param unknown $clientId
	 * @return unknown
	 */
	public function getLogList($condition, $order, $ordertype, $page, $limit){
		
		$offset = 0;
		$page = $page - 1;
		if($page > 0){
			$offset = $page * $limit;
		}
		
		$sql = "
			SELECT 
				a.create_time as create_date,
				a.action_name,
				AES_DECRYPT(b.staff_name,@key) AS staff_name  
			FROM
				logs as a 
			INNER JOIN 
				master_staff_new as b 
			ON 
				a.client_id = b.client_id AND
				a.staff_type = b.staff_type AND
				a.staff_id = b.staff_id 
			WHERE 
				{$condition}  
			ORDER BY  
				{$order} 
			LIMIT 
				{$limit}
			OFFSET 
				{$offset};";

		$res = $this->db->fetchAll($sql);
		return $res;
	}
	
	/**
	 * ログのカウント取得
	 * @param unknown $talkBindId
	 * @param unknown $clientId
	 * @return unknown
	 */
	public function getLogCount($condition){
		
		$sql = "
			SELECT
				COUNT(a.create_time) as log_count 
			FROM
				logs as a
			INNER JOIN
				master_staff_new as b
			ON
				a.client_id = b.client_id AND
				a.staff_type = b.staff_type AND
				a.staff_id = b.staff_id
			WHERE
				{$condition};";
				
				
		$res = $this->db->fetchRow($sql);
		$count = $res["log_count"];
		
		return $count;
	}	
	
// 	/**
// 	 * ログ取得
// 	 * @param unknown $talkBindId
// 	 * @param unknown $clientId
// 	 * @return unknown
// 	 */
// 	public function getLogListByLimit($staffCondition, $clientStaffCondition, $order, $offset, $limit){
// 		$offset = 0;
// 		$page = $page - 1;
// 		if($page > 0){
// 			$offset = $page * $limit;
// 		}
		
// 		$sql = "
// 			SELECT
// 				a.*,
// 				AES_DECRYPT(b.staff_name,@key) AS staff_name
// 			FROM
// 				logs as a
// 			INNER JOIN
// 				staff as b
// 			ON
// 				a.staff_id = b.staff_id
// 			WHERE
// 				{$staffCondition} AND
// 				(a.staff_type = 'AA' OR a.staff_type = 'TA')
// 			UNION
// 			SELECT
// 				a.*,
// 				AES_DECRYPT(b.name,@key) AS staff_name
// 			FROM
// 				logs as a
// 			INNER JOIN
// 				client_staff as b
// 			ON
// 				a.staff_id = b.seq
// 			WHERE
// 				{$clientStaffCondition} AND
// 				(a.staff_type = 'CE') 
// 			ORDER BY {$order} 
// 			LIMIT {$limit}
//     		OFFSET {$offset};";
	
// 		$res = $this->db->fetchAll($sql);
// 		return $res;
// 	}

	/**
	 * ログテーブルを再作成する
	 */
	public function reCreateTable(){
		$sql = "
				DROP TABLE `logs`;
				CREATE TABLE IF NOT EXISTS `logs` (
					`staff_id` int(11) NOT NULL COMMENT 'スタッフID',
					`staff_type` varchar(4) NOT NULL COMMENT 'スタッフ種別[AA,TA,CE]',
					`client_id` int(11) COMMENT 'クライアントID',
					`create_time` datetime NOT NULL COMMENT '作成日時',
					`action_name` varchar(64) NOT NULL COMMENT 'アクション名',
					`send_data` text NOT NULL COMMENT 'サーバーへ送信したデータ'
				) ENGINE=InnoDB  DEFAULT CHARSET=utf8;
				";
		$this->db->exec($sql);
	}
	
}
?>