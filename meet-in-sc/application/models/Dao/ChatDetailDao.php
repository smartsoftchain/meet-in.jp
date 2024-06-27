<?php

/**
 *
 * ChatDetailDao クラス
 *
 * chat_detailを扱うDaoクラス
 *
 * @package Dao
*/
class ChatDetailDao extends AbstractDao {
	
	private $db;
	function __construct($db){
		parent::init();
		$this->db = $db;
	}

	/**
	 * 登録
	 * 
	 * @param unknown_type $form
	 * @throws Exception
	 */
	public function regist($dict) {
		$record = array(
			'connection_info_id'=> $dict['connection_info_id'],
//			'room_name'			=> $dict['room_name'],
//			'collabo_id'		=> $dict['collabo_id'],
			'user_id'			=> $dict['user_id'],
			'uuid'				=> $dict['uuid'],
			'message'			=> $dict['message']
		);
error_log("regist UUID=[".$dict['uuid']."]\n", 3, "/var/tmp/negotiation.log");

		$id = $this->db->insert('chat_detail', $record);
error_log("regist id=[".$id."]\n", 3, "/var/tmp/negotiation.log");

		return $this->db->lastInsertId('chat_detail', 'id');
	}

/** 更新なし */
/****
	public function update($dict, $condition) {
		$dict['updated_datetime'] = new Zend_Db_Expr('now()');
		$n = $this->db->update('negotiation_connection_log', $dict, $condition);
		
		return $n;
	}
*****/

	/**
	 * 取得
	 * @param unknown $talkBindId
	 * @param unknown $clientId
	 * @return unknown
	 */
	public function getChatDetail($condition){
		$sql = "SELECT
					id,
					connection_info_id,
					room_name,
					collabo_id,
					user_id,
					uuid,
					message,
					created_datetime,
					updated_datetime
				FROM 
					chat_detail
				WHERE
					{$condition}
				ORDER BY created_datetime
		;";

		$rtn = $this->db->fetchAll($sql, array());
		return $rtn;
	}

	public function remove($condition) {
		$n = $this->db->delete('chat_detail', $condition);
		return $n;
	}

/*
///////////////////////////////////////////////////////
// chat_detail のテーブル定義
///////////////////////////////////////////////////////

DROP TABLE IF EXISTS `chat_detail`;

CREATE TABLE `chat_detail` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `connection_info_id` bigint(20) NOT NULL,
  `room_name` varchar(32) COLLATE utf8_unicode_ci DEFAULT NULL,
  `collabo_id` tinyint(4) DEFAULT NULL,
  `user_id` tinyint(4) NOT NULL,
  `message` text CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `created_datetime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_datetime` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `index1` (`connection_info_id`),
  CONSTRAINT `FK1` FOREIGN KEY (`connection_info_id`) REFERENCES `connection_info` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='チャット詳細'
*/

}
?>