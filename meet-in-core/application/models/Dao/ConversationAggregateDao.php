<?php

/**
 * ConversationAggregateDao クラス
 *
 * 感情解析を扱うDaoクラス
 *
 * @package Dao
*/
class ConversationAggregateDao extends AbstractDao {

	private $db;

	private $table_name = "conversation_aggregate";

	function __construct($db) {
		parent::init();
		$this->db = $db;
	}


	public function find($condition, $order=null, $ordertype=null, $page=null, $limit=null) {
		$offset = 0;
		$page = $page - 1;
		if($page > 0){
			$offset = $page * $limit;
		}
		$sql =
		"SELECT
			a.conversation_id,
			a.speaker_label,
			a.client_id,
			a.staff_id,
			a.staff_type,
			CASE WHEN AES_DECRYPT(b.staff_name,@key) is NULL THEN 'ゲスト' ELSE AES_DECRYPT(b.staff_name,@key) END as staff_name,
			a.pause_count,
			a.bargein_count,
			a.volume_avg,
			a.speech_rate_avg,
			a.energy_avg,
			a.stress_avg,
			a.emo_cog_avg,
			a.concentration_avg,
			a.anticipation_avg,
			a.excitement_avg,
			a.hesitation_avg,
			a.uncertainty_avg,
			a.intensive_thinking_avg,
			a.imagination_activity_avg,
			a.embarrassment_avg,
			a.passionate_avg,
			a.brain_power_avg,
			a.confidence_avg,
			a.aggression_avg,
			a.call_priority_avg,
			a.atmosphere_avg,
			a.upset_avg,
			a.content_avg,
			a.dissatisfaction_avg,
			a.extreame_emotion_avg,
			a.conversation_count,
			a.rally_count,
			a.conversation_ratio,
			a.conversation_date,
			DATE_FORMAT(a.conversation_date, '%H') AS span_of_time
		FROM
			{$this->table_name} as a
		LEFT JOIN master_staff_new as b ON a.staff_id = b.staff_id AND a.staff_type = b.staff_type
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
		return $rtn;
	}


	/*
	 * 集計グラフ出力.
	 * 同じ日は平均の平均で まとめている.
	 */
	public function aggregateGraf($master_condition, $sub_condition, $time, $having_condition=null) {

		$offset = 0;
		$page = $page - 1;
		if($page > 0){
			$offset = $page * $limit;
		}
		// グラフに表示する再に 束ねて表示する単位=グループ化する範囲.
		switch ($time) {
			case 'hour':
				$group_condition = "a.staff_id, a.staff_type, DATE_FORMAT(a.conversation_date, '%H')";
				break;

			case 'day':
				$group_condition = "a.staff_id, a.staff_type, DATE_FORMAT(a.conversation_date, '%Y-%m-%d')";
				break;

			case 'week':
				$group_condition = "a.staff_id, a.staff_type, DATE_FORMAT(a.conversation_date, '%Y-%u')";
				break;

			case 'month':
				$group_condition = "a.staff_id, a.staff_type, DATE_FORMAT(a.conversation_date, '%Y-%m')";
				break;

			case 'year':
				$group_condition = "a.staff_id, a.staff_type, DATE_FORMAT(a.conversation_date, '%Y')";
				break;
			default:
				$group_condition = "a.staff_id, a.staff_type, DATE_FORMAT(a.conversation_date, '%H')"; // hour
				break;
		}
		$TEMPLATE_GUEST_NAME = 'ゲスト';

		// 負荷軽減処理 = conversation_aggregateが太って 数万行になった頃 JOINして 存在しない"ゲスト"を無駄に何度もスタッフマスタを探すコストをPHPで吸収.
		$sql =
		"SELECT
			CONCAT(IFNULL(staff_id, ''), IFNULL(staff_type, ''))  AS staff_key,
			AES_DECRYPT(staff_name,@key) as staff_name
		FROM master_staff_new";
		$stafflist = array_column($this->db->fetchAll($sql, array()), 'staff_name', 'staff_key');
		$stafflist['0ZZ'] = $TEMPLATE_GUEST_NAME; // MEMO. id0 で、 区分が ZZは　部外者であることから ゲスト扱い.

		$sql ="
		SELECT
			a.conversation_id,
			a.speaker_label,
			a.client_id,
			a.staff_id,
			a.staff_type,
			CONCAT(IFNULL(a.staff_id, ''), IFNULL(a.staff_type, ''))  AS staff_key,
			ROUND(AVG(a.pause_count), 2) AS pause_count,
			ROUND(AVG(a.bargein_count), 2) AS bargein_count,
			ROUND(AVG(a.volume_avg), 2) AS volume_avg,
			ROUND(AVG(a.speech_rate_avg), 2) AS speech_rate_avg,
			ROUND(AVG(a.energy_avg), 2) AS energy_avg,
			ROUND(AVG(a.stress_avg), 2) AS stress_avg,
			ROUND(AVG(a.emo_cog_avg), 2) AS emo_cog_avg,
			ROUND(AVG(a.concentration_avg), 2) AS concentration_avg,
			ROUND(AVG(a.anticipation_avg), 2) AS anticipation_avg,
			ROUND(AVG(a.excitement_avg), 2) AS excitement_avg,
			ROUND(AVG(a.hesitation_avg), 2) AS hesitation_avg,
			ROUND(AVG(a.uncertainty_avg), 2) AS uncertainty_avg,
			ROUND(AVG(a.intensive_thinking_avg), 2) AS intensive_thinking_avg,
			ROUND(AVG(a.imagination_activity_avg), 2) AS imagination_activity_avg,
			ROUND(AVG(a.embarrassment_avg), 2) AS embarrassment_avg,
			ROUND(AVG(a.passionate_avg), 2) AS passionate_avg,
			ROUND(AVG(a.brain_power_avg), 2) AS brain_power_avg,
			ROUND(AVG(a.confidence_avg), 2) AS confidence_avg,
			ROUND(AVG(a.aggression_avg), 2) AS aggression_avg,
			ROUND(AVG(a.call_priority_avg), 2) AS call_priority_avg,
			ROUND(AVG(a.atmosphere_avg), 2) AS atmosphere_avg,
			ROUND(AVG(a.upset_avg), 2) AS upset_avg,
			ROUND(AVG(a.content_avg), 2) AS content_avg,
			ROUND(AVG(a.dissatisfaction_avg), 2) AS dissatisfaction_avg,
			ROUND(AVG(a.extreame_emotion_avg), 2) AS extreame_emotion_avg,
			ROUND(AVG(a.conversation_count), 2) AS conversation_count,
			ROUND(AVG(a.rally_count), 2) AS rally_count,
			ROUND(AVG(a.conversation_ratio), 2) AS conversation_ratio,
			a.conversation_date,
			DATE_FORMAT(a.conversation_date, '%Y年%m月%d日') AS date,
			DATE_FORMAT(a.conversation_date, '%H時台')       AS span_of_time,
			DATE_FORMAT(a.conversation_date, '%Y年%u週')     AS week,
			DATE_FORMAT(a.conversation_date, '%Y年%m月')     AS month,
			DATE_FORMAT(a.conversation_date, '%Y年')         AS year
		FROM
			conversation_aggregate AS a
		WHERE
			a.conversation_id IN (SELECT conversation_id FROM negotiation_conversations WHERE {$master_condition} AND del_flg = 0)
			{$sub_condition}
		GROUP BY
			{$group_condition}
		";
		if(0 < mb_strlen($having_condition)) {
			$sql = $sql."
			HAVING
				{$having_condition}";
		}

		$rtn = $this->db->fetchAll($sql, array());
		foreach ($rtn as $key => $value) {
			if (array_key_exists($value['staff_key'], $stafflist)) {
				$rtn[$key]['staff_name'] = $stafflist[$value['staff_key']];
			} else {
				$rtn[$key]['staff_name'] = $TEMPLATE_GUEST_NAME;
			}

			unset($rtn[$key]['staff_key']);
		}
		return $rtn;
	}


	/*
	 * 集計 表出力出力.
	 * ページングを想定した挙動.
	 */
	public function aggregateList($master_condition, $sub_condition, $having_condition=null, $order=null, $order_type=null) {

		// 負荷軽減処理 = conversation_aggregateが太って 数万行になった頃 JOINして 存在しない"ゲスト"を無駄に何度もスタッフマスタを探すコストをPHPで吸収.
		$sql =
		"SELECT
			CONCAT(IFNULL(staff_id, ''), IFNULL(staff_type, ''))  AS staff_key,
			AES_DECRYPT(staff_name,@key) as staff_name
		FROM master_staff_new";
		$stafflist = array_column($this->db->fetchAll($sql, array()), 'staff_name', 'staff_key');

		$sql ="
		SELECT
			*, CONCAT(IFNULL(staff_id, ''), IFNULL(staff_type, ''))  AS host_staff_key
		FROM
			negotiation_conversations
		WHERE
			{$master_condition} AND del_flg = 0";
		$masterlist = array_column($this->db->fetchAll($sql, array()), null, 'conversation_id');
		$stafflist['0ZZ'] = "ゲスト"; // MEMO. id0 で、 区分が ZZは　部外者であることから ゲスト扱い.

		$sql ="
		SELECT
			a.conversation_id,
			a.speaker_label,
			a.client_id,
			a.staff_id,
			a.staff_type,
			CONCAT(IFNULL(a.staff_id, ''), IFNULL(a.staff_type, ''))  AS staff_key,
			a.pause_count AS pause_count,
			a.bargein_count AS bargein_count,
			a.volume_avg AS volume_avg,
			a.speech_rate_avg AS speech_rate_avg,
			a.energy_avg AS energy_avg,
			a.stress_avg AS stress_avg,
			a.emo_cog_avg AS emo_cog_avg,
			a.concentration_avg AS concentration_avg,
			a.anticipation_avg AS anticipation_avg,
			a.excitement_avg AS excitement_avg,
			a.hesitation_avg AS hesitation_avg,
			a.uncertainty_avg AS uncertainty_avg,
			a.intensive_thinking_avg AS intensive_thinking_avg,
			a.imagination_activity_avg AS imagination_activity_avg,
			a.embarrassment_avg AS embarrassment_avg,
			a.passionate_avg AS passionate_avg,
			a.brain_power_avg AS brain_power_avg,
			a.confidence_avg AS confidence_avg,
			a.aggression_avg AS aggression_avg,
			a.call_priority_avg AS call_priority_avg,
			a.atmosphere_avg AS atmosphere_avg,
			a.upset_avg AS upset_avg,
			a.content_avg AS content_avg,
			a.dissatisfaction_avg AS dissatisfaction_avg,
			a.extreame_emotion_avg AS extreame_emotion_avg,
			a.conversation_count AS conversation_count,
			a.rally_count AS rally_count,
			a.conversation_ratio AS conversation_ratio,
			a.conversation_date
		FROM
			conversation_aggregate AS a
		WHERE
			a.conversation_id IN (SELECT conversation_id FROM negotiation_conversations WHERE {$master_condition} AND del_flg = 0)
			{$sub_condition}
		";

		if(0 < mb_strlen($having_condition)) {
			$sql = $sql."
			HAVING
				{$having_condition}";
		}

		if(!is_null($order) && !is_null($order_type)) {
			$sql = $sql."
			ORDER BY
				{$order} {$order_type}
			";
		}
		$rtn = $this->db->fetchAll($sql, array());
		foreach ($rtn as $key => $value) {

			$rtn[$key]['room_name'] = $masterlist[$value['conversation_id']]['room_name'];
			$rtn[$key]['host_staff_name'] = $stafflist[$masterlist[$value['conversation_id']]['host_staff_key']];

			if (array_key_exists($value['staff_key'], $stafflist)) {
				$rtn[$key]['staff_name'] = $stafflist[$value['staff_key']];
			} else {
				$rtn[$key]['staff_name'] = 'ゲスト';
			}
			unset($rtn[$key]['staff_key']);
		}

		return [
			'items' => $rtn,
			'count' => count($rtn)
		];
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
			'conversation_id'	        => $params["conversation_id"],
			'speaker_label'	            => $params["speaker_label"],
			'client_id'	                => $params["client_id"],
			'staff_id'	                => $params["staff_id"],
			'staff_type'	            => $params["staff_type"],
			'pause_count'	            => $params["pause_count"],
			'bargein_count'	            => $params["bargein_count"],
			'volume_avg'	            => $params["volume_avg"],
			'speech_rate_avg'	        => $params["speech_rate_avg"],
			'energy_avg'	            => $params["energy_avg"],
			'stress_avg'	            => $params["stress_avg"],
			'emo_cog_avg'	            => $params["emo_cog_avg"],
			'concentration_avg'	        => $params["concentration_avg"],
			'anticipation_avg'	        => $params["anticipation_avg"],
			'excitement_avg'	        => $params["excitement_avg"],
			'hesitation_avg'	        => $params["hesitation_avg"],
			'uncertainty_avg'	        => $params["uncertainty_avg"],
			'intensive_thinking_avg'	=> $params["intensive_thinking_avg"],
			'imagination_activity_avg'	=> $params["imagination_activity_avg"],
			'embarrassment_avg'	        => $params["embarrassment_avg"],
			'passionate_avg'	        => $params["passionate_avg"],
			'brain_power_avg'	        => $params["brain_power_avg"],
			'confidence_avg'	        => $params["confidence_avg"],
			'aggression_avg'	        => $params["aggression_avg"],
			'call_priority_avg'	        => $params["call_priority_avg"],
			'atmosphere_avg'	        => $params["atmosphere_avg"],
			'upset_avg'	                => $params["upset_avg"],
			'content_avg'	            => $params["content_avg"],
			'dissatisfaction_avg'	    => $params["dissatisfaction_avg"],
			'extreame_emotion_avg'	    => $params["extreame_emotion_avg"],
			'conversation_count'	    => $params["conversation_count"],
			'rally_count'	            => $params["rally_count"],
			'conversation_ratio'        => $params["conversation_ratio"],
			'conversation_date'	        => new Zend_Db_Expr('now()'),
		];
		$this->db->insert($this->table_name, $data); // オートインクリメントが無いテーブル.
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


	public function delete($condition) {
		return $this->db->delete($this->table_name, $condition);
	}


}