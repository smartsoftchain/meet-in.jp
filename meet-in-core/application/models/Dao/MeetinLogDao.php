<?php

/**
 * MeetinLogDao クラス
 *
 * DataConnectionとMeetinLognのログを扱うDaoクラス
 *
 * @version 2017/10/06 Ohta
 * @package Dao
*/
class MeetinLogDao extends AbstractDao {
	
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
		$sql = "INSERT INTO meetin_log(room_name,user_id,connection_info_id,connect_no,ip,message,type,user_agent,command,from_peer_id,to_peer_id) VALUES(?,?,?, ?, INET_ATON(?), ?, ?, ?, ?, ?, ?)";
		$statement = new Zend_Db_Statement_Pdo($this->db, $sql);
		$result = $statement->execute( array($dict['room_name'],$dict['user_id'],$dict['connection_info_id'], $dict['connect_no'], $dict['ip'], $dict['message'], $dict['type'], $dict['user_agent'], $dict['command'], $dict['from_peer_id'], $dict['to_peer_id']) );
		return $this->db->lastInsertId('meetin_log', 'id');
	}

}
?>
