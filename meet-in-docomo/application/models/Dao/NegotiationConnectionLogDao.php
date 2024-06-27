<?php

/**
 * NegotiationConnectionLogDao クラス
 *
 * DataConnectionとMediaConnectionのログを扱うDaoクラス
 *
 * @version 2017/05/17 17:54 李
 * @package Dao
*/
class NegotiationConnectionLogDao extends AbstractDao {
	
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
				'connection_info_id'								=> $dict['connection_info_id'],
				'connect_no'										=> $dict['connect_no'],
				'connection_type'									=> $dict['connection_type'],
				'connection_id'										=> $dict['connection_id'],
				'from_peer_id'										=> $dict['from_peer_id'],
				'to_peer_id'										=> $dict['to_peer_id'],
				'from_user_id'										=> $dict['from_user_id'],
				'to_user_id'										=> $dict['to_user_id'],
				'data_connection_connect_datetime'					=> $dict['data_connection_connect_datetime'],
				'data_connection_open_datetime_1'					=> $dict['data_connection_open_datetime_1'],
				'data_connection_open_datetime_2'					=> $dict['data_connection_open_datetime_2'],
				'data_connection_close_datetime_1'					=> $dict['data_connection_close_datetime_1'],
				'data_connection_close_datetime_2'					=> $dict['data_connection_close_datetime_2'],
				'media_connection_call_datetime'					=> $dict['media_connection_call_datetime'],
				'media_connection_answer_datetime'					=> $dict['media_connection_answer_datetime'],
				'media_connection_stream_send_confirm_datetime'		=> $dict['media_connection_stream_send_confirm_datetime'],
				'media_connection_stream_datetime_1'				=> $dict['media_connection_stream_datetime_1'],
				'media_connection_stream_datetime_2'				=> $dict['media_connection_stream_datetime_2'],
				'media_connection_close_datetime_1'					=> $dict['media_connection_close_datetime_1'],
				'media_connection_close_datetime_2'					=> $dict['media_connection_close_datetime_2'],
				'created_datetime'									=> new Zend_Db_Expr('now()'),
				'updated_datetime'									=> new Zend_Db_Expr('now()'),
		);
		$id = $this->db->insert('negotiation_connection_log', $record);
		
		return $this->db->lastInsertId('negotiation_connection_log', 'id');
	}

	public function update($dict, $condition) {
		$dict['updated_datetime'] = new Zend_Db_Expr('now()');
		$n = $this->db->update('negotiation_connection_log', $dict, $condition);
		
		return $n;
	}

	/**
	 * ログ取得
	 * @param unknown $talkBindId
	 * @param unknown $clientId
	 * @return unknown
	 */
	public function getNegotiationConnectionLog($condition){
		$sql = "
			SELECT 
				id,
				connection_info_id,
				connect_no,
				connection_type,
				connection_id,
				from_peer_id,
				to_peer_id,
				from_user_id,
				to_user_id,
				data_connection_connect_datetime,
				data_connection_open_datetime_1,
				data_connection_open_datetime_2,
				data_connection_close_datetime_1,
				data_connection_close_datetime_2,
				media_connection_call_datetime,
				media_connection_answer_datetime,
				media_connection_stream_send_confirm_datetime,
				media_connection_stream_datetime_1,
				media_connection_stream_datetime_2,
				media_connection_close_datetime_1,
				media_connection_close_datetime_2,
				created_datetime,
				updated_datetime
			FROM
				negotiation_connection_log 
			WHERE 
				{$condition} 
			;";

		$rtn = $this->db->fetchRow($sql, array());
		return $rtn;
	}

/*
///////////////////////////////////////////////////////
// negotiation_connection_logのテーブル定義
///////////////////////////////////////////////////////

DROP TABLE IF EXISTS `negotiation_connection_log`;
CREATE TABLE IF NOT EXISTS `negotiation_connection_log` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT 'ユニークなID',
  `connection_info_id` bigint(20) NOT NULL COMMENT 'connection_infoのID',
  `connect_no` varchar(13) COLLATE utf8_unicode_ci NOT NULL COMMENT '接続番号',
  `connection_type` tinyint(4) NOT NULL DEFAULT '0' COMMENT '種類(0:不明,1:データ,2:カメラ,3:マイク,4:画面共有)',
  `connection_id` varchar(16) COLLATE utf8_unicode_ci NOT NULL COMMENT '接続ID',
  `from_peer_id` varchar(16) COLLATE utf8_unicode_ci NOT NULL COMMENT '発信側のピアID',
  `to_peer_id` varchar(16) COLLATE utf8_unicode_ci NOT NULL COMMENT '着信側のピアID',
  `from_user_id` tinyint(4) DEFAULT NULL COMMENT '発信側のユーザーID',
  `to_user_id` tinyint(4) DEFAULT NULL COMMENT '着信側のユーザーID',
  `data_connection_connect_datetime` datetime DEFAULT NULL COMMENT 'DataConnectionの接続要求日時',
  `data_connection_open_datetime_1` datetime DEFAULT NULL COMMENT 'DataConnectionの接続開始日時(発信側)',
  `data_connection_open_datetime_2` datetime DEFAULT NULL COMMENT 'DataConnectionの接続開始日時(着信側)',
  `data_connection_close_datetime_1` datetime DEFAULT NULL COMMENT 'DataConnectionの接続終了日時(発信側)',
  `data_connection_close_datetime_2` datetime DEFAULT NULL COMMENT 'DataConnectionの接続終了日時(着信側)',
  `media_connection_call_datetime` datetime DEFAULT NULL COMMENT 'MediaConnectionの接続要求日時',
  `media_connection_answer_datetime` datetime DEFAULT NULL COMMENT 'MediaConnectionの接続返答日時',
  `media_connection_stream_send_confirm_datetime` datetime DEFAULT NULL COMMENT 'MediaConnectionのストリーム送信確認日時(発信側が着信側に送るストリーム)',
  `media_connection_stream_datetime_1` datetime DEFAULT NULL COMMENT 'MediaConnectionのストリーム受信日時(発信側が着信側のストリームを受信[現在の作りでは着信側が発信側にストリームを返すことがないので、カラムの値が必ずNULLになる])',
  `media_connection_stream_datetime_2` datetime DEFAULT NULL COMMENT 'MediaConnectionのストリーム受信日時(着信側が発信側のストリームを受信)',
  `media_connection_close_datetime_1` datetime DEFAULT NULL COMMENT 'MediaConnectionの接続終了日時(発信側)',
  `media_connection_close_datetime_2` datetime DEFAULT NULL COMMENT 'MediaConnectionの接続終了日時(着信側)',
  `created_datetime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '作成日時',
  `updated_datetime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '更新日時',
  PRIMARY KEY (`id`),
  KEY `connection_info_id` (`connection_info_id`,`connection_type`,`connection_id`,`from_peer_id`,`to_peer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=1 ;

*/
}
?>