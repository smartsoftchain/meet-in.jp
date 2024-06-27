<?php

/**
 * TsStaffLoginDao クラス
 *
 * ログイン情報を扱うDaoクラス
 *
 * @version 2018/10/01 ohta
 * @package Dao
*/
class TsStaffLoginDao extends AbstractDao {
	
	private $db;
	function __construct($db){
		parent::init();
		$this->db = $db;
	}
	private function returnNullZero($val) {
		if ( $val == null) {
			return "0";
		} else {
			return $val;
		}
	}

	/**
	 * @param unknown $talkBindId
	 * @param unknown $clientId
	 * @return unknown
	 */
	public function autoLoginFetch($condition){
error_log("autoLoginFetch $condition=(". $condition .")\n", 3, "/var/tmp/negotiation.log");
		$sql = "
			SELECT 
				staff_type,
				staff_id,
				client_id,
				auto_login_key,
				staff_del_flg,
				create_date,
				update_date
			FROM ts_staff_login 
			WHERE 
				{$condition} 
			;";

		$rtn = $this->db->fetchRow($sql, array());
error_log("autoLoginFetch rtn=(". $rtn .")\n", 3, "/var/tmp/negotiation.log");
		return $rtn;
	}

	/**
	 * カウント取得
	 * @param unknown $talkBindId
	 * @param unknown $clientId
	 * @return unknown
	 */
	public function getAutoLoginCount($condition){
		$sql = "
			SELECT COUNT(*) as count 
			FROM ts_staff_login
			WHERE
				{$condition};";
				
		$res = $this->db->fetchRow($sql);
		$count = $res["count"];
		return $count;
	}

	/**
	 * 自動ログイン情報登録
	 * @param unknown_type $dict
	 * @throws Exception
	 */
	public function regist($dict) {
		$record = array(
				'staff_type'	=> $dict['staff_type'],
				'staff_id'		=> $dict['staff_id'],
				'client_id'		=> $this->returnNullZero($dict['client_id']),
				'auto_login_key'=> $dict['auto_login_key']
		);
		$ret = $this->db->insert('ts_staff_login', $record);
		return $ret;
	}

	/**
	 * 更新(自動ログインKey))
	 * @param unknown $autoLoginKey	自動ログインKEY
	 * @throws Exception
	 */
	public function updateAutoLoginKey($oldAutoLoginKey, $newAutoLoginKey) {
		// 情報を更新する
		$dict['auto_login_key'] = $newAutoLoginKey;
		$condition = " auto_login_key='{$oldAutoLoginKey}' ";
		$rtn = $this->db->update('ts_staff_login', $dict, $condition);
		return $rtn;
	}
	/**
	 * 更新(client_id))
	 * @param unknown $autoLoginKey	自動ログインKEY
	 * @throws Exception
	 */
	public function updateAutoLoginClientId($autoLoginKey, $clientId) {
		// 情報を更新する
		$dict['client_id'] = $clientId;
		$condition = " auto_login_key='{$autoLoginKey}' ";
		$rtn = $this->db->update('ts_staff_login', $dict, $condition);
		return $rtn;
	}

	/**
	 * 更新
	 */
	public function update($dict, $condition) {
		$rtn = $this->db->update('ts_staff_login', $dict, $condition);
		return $rtn;
	}

	/**
	 * 削除する(担当者指定))
	 * @param unknown $clientId	クライアントID
	 * @param unknown $staffId	担当者ID
	 * @throws Exception
	 */
	public function deletStaff($staffType, $staffId) {
		// 情報を削除する
		$condition = " staff_type='{$staffType}' AND staff_id={$staffId} ";
		$rtn = $this->db->delete('ts_staff_login', $condition);
		return $rtn;
	}
	/**
	 * 削除する(自動ログインKey))
	 * @param unknown $autoLoginKey	自動ログインKEY
	 * @throws Exception
	 */
	public function deletAutoLoginKey($autoLoginKey) {
		// 情報を削除する
		$condition = " auto_login_key='{$autoLoginKey}' ";
		$rtn = $this->db->delete('ts_staff_login', $condition);
		return $rtn;
	}

}
?>