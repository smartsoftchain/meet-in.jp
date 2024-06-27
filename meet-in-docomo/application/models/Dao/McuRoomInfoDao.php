<?php

/**
 * McuRoomInfoDao クラス
 *
 * mcu_room_infoを扱うDaoクラス
 *
 * @package Dao
*/
class McuRoomInfoDao extends AbstractDao {

	private $db;
	function __construct($db){
		parent::init();
		$this->db = $db;
	}

	/**
	 * 登録
	 */
	public function regist($dict) {
// error_log("regist mcu_info_id=[".$dict['mcu_info_id']."]\n", 3, "/var/tmp/negotiation.log");
// error_log("regist room_name=[".$dict['room_name']."]\n", 3, "/var/tmp/negotiation.log");
		$record = array(
			'mcu_info_id'=> $dict['mcu_info_id'],
			'room_name'	=> $dict['room_name'],
		);
// error_log("regist room_name=[".$dict['room_name']."]\n", 3, "/var/tmp/negotiation.log");
		$id = $this->db->insert('mcu_room_info', $record);
// error_log("regist id=[".$id."]\n", 3, "/var/tmp/negotiation.log");
		return $this->db->lastInsertId('mcu_room_info', 'id');
	}

	/**
	 * 更新
	 * ret 更新件数
	 * @throws Exception
	 */
	public function update($dict, $condition) {
		$dict['connect_datetime'] = new Zend_Db_Expr('now()');
		$n = $this->db->update('mcu_room_info', $dict, $condition);
		return $n;
	}

	public function remove($condition) {
		$n = $this->db->delete('mcu_room_info', $condition);
		return $n;
	}

	/**
	 * カウント取得
	 * @param unknown $talkBindId
	 * @param unknown $clientId
	 * @return unknown
	 */
	public function getMcuRoomInfCount($condition){
		$sql = "
			SELECT COUNT(*) as count
			FROM mcu_room_info
			WHERE {$condition};
		";

		$res = $this->db->fetchRow($sql);
		$count = $res["count"];
		return $count;
	}

/*
CREATE TABLE `mcu_room_info` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `mcu_info_id` int(11) NOT NULL,
  `room_name` varchar(128) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_mcu_info_id` (`mcu_info_id`),
  KEY `idx_name` (`room_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8
*/

}
?>