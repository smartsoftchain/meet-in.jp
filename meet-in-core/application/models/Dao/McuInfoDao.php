<?php

/**
 *
 * McuInfoDao クラス
 *
 * mcu_room_infoを扱うDaoクラス
 *
 * @package Dao
*/
class McuInfoDao extends AbstractDao {

	private $db;
	function __construct($db){
		parent::init();
		$this->db = $db;
	}

/** 登録なし */
/** 削除なし */

	/**
	 * 更新
	 * ret 更新件数
	 * @throws Exception
	 */
	public function updateMcuServer($mcu_info_id, $room_cnt, $access_cnt) {
		// 情報を更新する
		$dict = array();
		$dict['room_cnt'] = $room_cnt;
		$dict['access_cnt'] = $access_cnt;

		$condition = " id='{$mcu_info_id}' ";
		$rtn = $this->db->update('mcu_info', $dict, $condition);
		return $rtn;
	}

	/**
	 * 取得
	 */
	public function getMcuServerByRoomName($condition){
		$sql = "SELECT
					a.id,
					a.url,
					a.room_cnt,
					a.access_cnt,
					a.acc_max,
					a.unit_type,
					b.room_name
				FROM
					mcu_info as a
				INNER JOIN
					mcu_room_info as b
				ON
					a.id = b.mcu_info_id
				WHERE
					{$condition}
		;";

		$rtn = $this->db->fetchAll($sql, array());
		return $rtn;
	}

	/**
	 * サーバ情報取得
	 * room_cnt が小さい順
	 * room_cnt が同じ場合は、idが小さい順
	 */
	public function getMcuServer(){
		$sql = "SELECT
					id,
					url,
					room_cnt,
					access_cnt,
					acc_max,
					unit_type
				FROM
					mcu_info
				ORDER BY
					room_cnt,id
		;";

		$rtn = $this->db->fetchAll($sql, array());
		return $rtn;
	}

	/**
	 * 取得
	 */
	public function getMcuServerlist(){
		$sql = "SELECT id, url, room_cnt,
					access_cnt, acc_max, unit_type
				FROM
					mcu_info;";
		$rtn = $this->db->fetchAll($sql, array());
		return $rtn;
	}

/*
CREATE TABLE `mcu_info` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `url` varchar(128) NOT NULL,
  `room_cnt` int(11) NOT NULL DEFAULT '0',
  `access_cnt` bigint(20) NOT NULL DEFAULT '0',
  `acc_max` bigint(20) NOT NULL DEFAULT '0',
  `unit_type` tinyint(4) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `idx_room_cnt` (`room_cnt`),
  KEY `idx_access_cnt` (`access_cnt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8
*/

}
?>