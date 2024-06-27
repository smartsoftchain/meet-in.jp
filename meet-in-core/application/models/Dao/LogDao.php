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
	 * アカウント総数を取得
	 * @param unknown $condition
	 * @return unknown
	 */
	public function getAccountCount($condition){
		
		$sql = "
			SELECT 
				staff_id
			FROM
				master_staff_new
			WHERE
				{$condition};";

		$res = $this->db->fetchAll($sql);
		return count($res);
	}

	/**
	 * インクリメンタルサーチ
	 */
	public function getAccountName($keyword,$condition){
		$sql = "
			SELECT 
				AES_DECRYPT(staff_name,@key) as staff_name, staff_type, staff_id
			FROM
				master_staff_new
			WHERE
				AES_DECRYPT(staff_name,@key) LIKE '%{$keyword}%' AND {$condition}
		";
		$res = $this->db->fetchAll($sql);
		
		return $res;
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
				{$order} {$ordertype}
			LIMIT
				{$limit}
			OFFSET
				{$offset};";

		$res = $this->db->fetchAll($sql);
		return $res;
	}

	/**
	 * 代理店の顧客のログ取得
	 * @param unknown $talkBindId
	 * @param unknown $clientId
	 * @return unknown
	 */
	public function getDistributorClientLogList($client_id, $free_word, $order=null, $ordertype=null, $page=null, $limit=null){

		$offset = 0;
		$page = $page - 1;
		if($page > 0){
			$offset = $page * $limit;
		}

		// MEMO.
		// 要約すると、このクエリーの結果は AAアカウントの操作ログを含まない.
		// ログテーブルの AAアカウントの操作ログは、 client_id!=0の状態で保存されている.
		// 結果、master_staff_newと client_idを含めて AND検索すると client_id値一致せず、ログテーブルにあっても結合が成立せず除外されている.
		$sql = "
			SELECT
				a.create_time,
				a.action_name,
				AES_DECRYPT(b.staff_name,@key) AS staff_name,
				c.client_name
			FROM
				logs as a,
				master_staff_new as b,
				master_client_new as c
			WHERE
				a.client_id IN (select client_id from master_client_new where distribution_channel_client_id = {$client_id}) AND
				b.client_id = a.client_id AND b.staff_id = a.staff_id AND b.staff_type = a.staff_type AND
				c.client_id = a.client_id"
				.$this->makeConditionDistributorClientLog($free_word);

		if(!is_null($order) && !is_null($ordertype)) {
			$sql .= " ORDER BY {$order} {$ordertype}";
		}
		if(!is_null($limit) && !is_null($offset)) {
			$sql .= " LIMIT {$limit} OFFSET {$offset}";
		}

		$res = $this->db->fetchAll($sql);
		return $res;
	}

	/**
	 * 販売代理店の顧客のログのカウント取得
	 * @param unknown $talkBindId
	 * @param unknown $clientId
	 * @return unknown
	 */
	public function getDistributorClientLogCount($client_id, $free_word){

		$sql = "
			SELECT
				COUNT(a.create_time) as log_count
			FROM
				logs as a,
				master_staff_new as b,
				master_client_new as c
			WHERE
				a.client_id IN (select client_id from master_client_new where distribution_channel_client_id = {$client_id}) AND
				b.client_id = a.client_id AND b.staff_id = a.staff_id AND b.staff_type = a.staff_type AND
				c.client_id = a.client_id"
				.$this->makeConditionDistributorClientLog($free_word);

		$res = $this->db->fetchRow($sql);
		$count = $res["log_count"];

		return $count;
	}

	private function makeConditionDistributorClientLog($free_word) {

		$condition = null;
		$where = [];
		if(!empty($free_word)){
			$freeWord = mb_convert_kana($free_word, 's');
			$create_times = [];

			$patterns = [
				'/(2\d{3}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2})$/',
				'/(2\d{3}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2})[^\d]/',
				'/(2\d{3}-\d{2}-\d{2}\s\d{2}:\d{2})$/',
				'/(2\d{3}-\d{2}-\d{2}\s\d{2}:\d{2})[^\d]/',
				'/(2\d{3}-\d{2}-\d{2}\s\d{2})$/',
				'/(2\d{3}-\d{2}-\d{2}\s\d{2})[^\d]/',
				'/(2\d{3}-\d{2}-\d{2})$/',
				'/(2\d{3}-\d{2}-\d{2})[^\d]/',
				'/(2\d{3}-\d{2})$/',
				'/(2\d{3}-\d{2})[^\d]/',
				'/(2\d{3})$/',
				'/(2\d{3})[^\d]/',
				'/(\d{2}:\d{2}:\d{2})$/',
				'/(\d{2}:\d{2}:\d{2})[^\d]/',
				'/(\d{2}:\d{2})$/',
				'/(\d{2}:\d{2})[^\d]/'
			];
			for($i = 0; $i < count($patterns); $i++) {
				$pattern = $patterns[$i];

				preg_match($pattern, $freeWord, $result);
				if(0 < count($result)) {
					$create_times[] = "a.create_time LIKE '%".trim($result[0])."%'";
					$freeWord = trim(preg_replace("/".$result[0]."/", '', $freeWord));

					if(!empty($freeWord)) {
						$i = -1;
					} else {
						break;
					}

				}
			}
			if(0 < count($create_times)) {
				$where[] = sprintf(" AND (%s)", join(' OR ', $create_times));
			}

			if(!empty($freeWord)) {
				foreach (preg_split("/\s/", $freeWord) as $word) {
					$where[] = " AND (a.action_name LIKE '%".$word."%' OR AES_DECRYPT(b.staff_name,@key) LIKE '%".$word."%' OR c.client_name LIKE '%".$word."%')";
				}
			}
		}
		if (0 < count($where)) {
			$condition = implode($where);
		}
		return $condition;
	}


	/**
	 * ウェビナーの使用回数を取得
	 * @param unknown $condition
	 * @return unknown
	 */
	public function getLogWebinarCount($condition){
		$sql = "
			SELECT
				a.client_id
			FROM
				webinar as a 
			WHERE
				{$condition}";

		$res = $this->db->fetchAll($sql);
		return count($res);
	}

	/**
	 * アクティブなroomを取得
	 * @param unknown $condition
	 * @return unknown
	 */
	public function getActiveRoom($condition){
		
		$sql = "
			SELECT
				a1.room_name,
				a1.user_peer_id_1,
				a1.user_peer_id_2,
				a1.user_peer_id_3,
				a1.user_peer_id_4,
				a1.user_peer_id_5,
				a1.user_peer_id_6,
				a1.user_peer_id_7,
				a1.user_peer_id_8
			FROM
				connection_info a1
			WHERE
				{$condition}
			AND
				a1.created_datetime = (
				SELECT
					MAX(a2.created_datetime)
				FROM
					connection_info a2
				WHERE
					a1.room_name = a2.room_name
				)
			;";

		$res = $this->db->fetchAll($sql);

		return $res;
	}

	/**
	 * 使用されたroomの回数を取得
	 * @param unknown $condition
	 * @return unknown
	 */
	public function getRoomUseCount($condition){
		$sql = "
			SELECT
				staff_type,
				staff_id,
				room_name,
				stime,
				etime
			FROM
				business_discussion_result as a 
			WHERE
				a.del_flg = 0  AND
				{$condition}
			ORDER BY
				stime DESC;";

		$res = $this->db->fetchAll($sql);
		return $res;
	}

	/**
	 * 使用されたroomの時間を取得
	 * @param unknown $condition
	 * @return unknown
	 */
	public function getLogUseTime($condition){
		$sql = "
			SELECT
				a.stime,
				a.etime
			FROM
				business_discussion_result as a 
			WHERE
				a.del_flg = 0  AND
				{$condition}";

		$res = $this->db->fetchAll($sql);
		return $res;
	}

	/**
	 * ダッシュボードのログ取得
	 * @param unknown $condition
	 * @return unknown
	 */
	public function getLogDashBord($condition, $limit){
		$sql = "
			SELECT
				a.staff_id,
				a.client_id,
				a.staff_type,
				a.create_time as create_date,
				a.action_name,
				a.send_data
			FROM
				logs as a
			WHERE
				{$condition}
			ORDER BY 
				create_time DESC
			LIMIT
				{$limit}
				;";

		$res = $this->db->fetchAll($sql);
		return $res;
	}

	/**
	 * 使用された資料を取得
	 * @param unknown $condition
	 * @param unknown $materialIdCondition
	 * @return unknown
	 */
	public function getLogMaterialList($condition, $materialIdCondition){
		$sql = "
			SELECT
				a.material_id,
				a.material_name
			FROM
				material_basic as a 
			WHERE
				{$condition} {$materialIdCondition};";

		$res = $this->db->fetchAll($sql);

		return array_column($res, 'material_name');
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

	/**
	 * ダッシュボードの最新ログ取得
	 * @param unknown $condition
	 * @return unknown
	 */
	public function getLogDashBordLastData($condition){
		$sql = "
			SELECT
				a.staff_id,
				a.client_id,
				a.staff_type,
				MAX(a.create_time) as create_date,
				a.action_name,
				a.send_data
			FROM
				logs as a
			WHERE
				{$condition}
			GROUP BY 
				a.staff_id,
				a.client_id,
				a.staff_type,
				a.action_name,
				a.send_data
				;";
		$res = $this->db->fetchAll($sql);
		return $res;
	}

	/**
	 * ダッシュボードのログ機能別件数取得
	 * @param unknown $condition
	 * @return unknown
	 */
	public function getLogDashBordActionCount($condition){
		$sql = "
			SELECT
				a.action_name,
				COUNT(*) as action_count
			FROM
				logs as a
			WHERE
				{$condition}
			GROUP BY a.action_name
				;";
		$res = $this->db->fetchAll($sql);
		return $res;
	}
}
?>
