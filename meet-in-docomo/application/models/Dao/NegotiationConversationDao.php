<?php

/**
 * NegotiationConversationDao クラス
 *
 * 感情解析Daoクラス
 *
 * @version 2020/12/10 15:00 nishimura
 * @package Dao
*/
class NegotiationConversationDao extends AbstractDao {

	private $db;
	private $table_name = "negotiation_conversations";


	function __construct($db) {
		parent::init();
		$this->db = $db;
	}


	/*
	 * day_of_the_week カラム値の辞書.
	 *
	 * data値が day_of_the_week カラムに保持されている値を表す.
	 * 値は Mysql WEEKDAY() 関数遵守.
	 */
	public function getDayOfTheWeekDict() {
		// MEMO.
		// jp値は ['jp']"曜日" or (['jp']) のような感じで 月曜日 or (月) と出力する感じで使えます.
		// en値は 逆引き時に "月"という日本語で 配列を検索するのに違和感があるならばそれをmonを使ったり、出力時cssクラス名として使って固有色を着けたりする想定.
		return [
			0 => ['data' => 0, 'jp' => '月', "en" => 'mon'],
			1 => ['data' => 1, 'jp' => '火', "en" => 'tue'],
			2 => ['data' => 2, 'jp' => '水', "en" => 'wed'],
			3 => ['data' => 3, 'jp' => '木', "en" => 'thu'],
			4 => ['data' => 4, 'jp' => '金', "en" => 'fri'],
			5 => ['data' => 5, 'jp' => '土', "en" => 'sat'],
			6 => ['data' => 6, 'jp' => '日', "en" => 'sun'],
		];
	}


	public function find($condition, $order=null, $ordertype=null, $page=null, $limit=null) {
		$offset = 0;
		$page = $page - 1;
		if($page > 0){
			$offset = $page * $limit;
		}

		$sql =
		"SELECT
			CONCAT(IFNULL(staff_id, ''), IFNULL(staff_type, ''))  AS staff_key,
			AES_DECRYPT(staff_name,@key) as staff_name
		FROM master_staff_new";
		$stafflist = array_column($this->db->fetchAll($sql, array()), 'staff_name', 'staff_key');

		$sql =
		"SELECT
			conversation_id,
			client_id,
			staff_id,
			staff_type,
			CONCAT(IFNULL(staff_id, ''), IFNULL(staff_type, ''))  AS staff_key,
			room_name,
			conversation_date,
			day_of_the_week,
			del_flg
		FROM
			{$this->table_name}
		WHERE
			{$condition}";

		if(!is_null($order) && !is_null($ordertype) && !is_null($page) && !is_null($limit)) {
			$sql = $sql.
			"ORDER BY
				{$order} {$ordertype}
			LIMIT
				{$limit}
			OFFSET
				{$offset};
			";
		}

		$rtn = $this->db->fetchAll($sql, array());
		foreach ($rtn as $key => $value) {
			if (array_key_exists($value['staff_key'], $stafflist)) {
				$rtn[$key]['staff_name'] = $stafflist[$value['staff_key']];
			} else {
				$rtn[$key]['staff_name'] = 'ゲスト';
			}
			unset($rtn[$key]['staff_key']);
		}
		return $rtn;
	}


	public function count($condition) {
		$sql =
		"SELECT
			COUNT(*) as count
			FROM
			{$this->table_name}
			WHERE
				{$condition}
		";
		$rtn = $this->db->fetchRow($sql, array());
		return $rtn["count"];
	}


	public function insert($params)
	{
		$data = [
			'conversation_id'	=> $params["conversation_id"],
			'client_id'	        => $params["client_id"],
			'staff_id'	        => $params["staff_id"],
			'staff_type'	    => $params["staff_type"],
			'room_name'	        => $params["room_name"],
			'day_of_the_week'	=> new Zend_Db_Expr('WEEKDAY(now())'),
			'conversation_date'	=> new Zend_Db_Expr('now()'),
			'del_flg'	        => 0,
		];
		try {
			$this->db->beginTransaction();
			$this->db->insert($this->table_name, $data); // オートインクリメントが無いテーブル.
			$this->db->commit();
		} catch (Exception $e) {
			$this->db->rollback();
		}
		return $data;
	}


	public function update($params, $condition)
	{
		$this->db->beginTransaction();
		try {
			$this->db->update($this->table_name, $params, $condition);
			$this->db->commit();
		} catch (Exception $e) {
			$this->db->rollback();
		}
	}


	public function softDelete($condition) {
		$this->db->beginTransaction();
		try {
			$this->db->update($this->table_name, ['del_flg' => 1], $condition);
			$this->db->commit();
		} catch (Exception $e) {
			$this->db->rollback();
		}
	}


}
