<?php

/**
 * ConnectionInfo クラス
 *
 * 接続情報を扱うDaoクラス
 *
 * @version 2016/11/24 17:54 李
 * @package Dao
*/
class ConnectionInfoDao extends AbstractDao {

	private $db;
	function __construct($db){
		parent::init();
		$this->db = $db;
	}

	public function returnNullZero($val) {
		if ( $val == null) {
			return "0";
		} else {
			return $val;
		}
	}
	/**
	 * 登録
	 * Enter description here ...
	 * @param unknown_type $form
	 * @throws Exception
	 */
	public function regist($dict) {
		$record = array(
				'room_name'								=> $dict['room_name'],
				'connect_no'							=> $dict['connect_no'],
				'collabo_id'							=> $this->returnNullZero($dict['collabo_id']),
				'operator_peer_id'						=> $dict['operator_peer_id'],
				'user_peer_id_1'						=> $dict['user_peer_id_1'],
				'user_peer_id_2'						=> $dict['user_peer_id_2'],
				'user_peer_id_3'						=> $dict['user_peer_id_3'],
				'user_peer_id_4'						=> $dict['user_peer_id_4'],
				'user_peer_id_5'						=> $dict['user_peer_id_5'],
				'user_peer_id_6'						=> $dict['user_peer_id_6'],
				'user_peer_id_7'						=> $dict['user_peer_id_7'],
				'user_peer_id_8'						=> $dict['user_peer_id_8'],
				'connection_request_start_datetime'		=> $dict['connection_request_start_datetime'],
				'connection_start_datetime'				=> $dict['connection_start_datetime'],
				'connection_stop_datetime'				=> $dict['connection_stop_datetime'],
				'connection_state'						=> $dict['connection_state'],
				'operator_client_id'					=> $dict['operator_client_id'],
				'operator_staff_type'					=> $dict['operator_staff_type'],
				'operator_staff_id'						=> $dict['operator_staff_id'],
				'client_id'										=> $dict['client_id'],
				'created_datetime'						=> new Zend_Db_Expr('now()'),
				'updated_datetime'						=> new Zend_Db_Expr('now()'),
		);
		$id = $this->db->insert('connection_info', $record);

		return $this->db->lastInsertId('connection_info', 'id');
	}

	public function update($dict, $condition) {
		$dict['updated_datetime'] = new Zend_Db_Expr('now()');
		$n = $this->db->update('connection_info', $dict, $condition);

		return $n;
	}

	/**
	 * ログのカウント取得
	 * @param unknown $talkBindId
	 * @param unknown $clientId
	 * @return unknown
	 */
	public function getConnectionInfoCount($condition){
		$sql = "
			SELECT
				COUNT(*) as count
			FROM
				connection_info
			WHERE
				{$condition};";

		$res = $this->db->fetchRow($sql);
		$count = $res["count"];

		return $count;
	}

	/**
	 * ロックされたルームに入室したいユーザ達のリクエスト情報の取得.
	 * @param bigint(20) $id
	 * @return JSON
	 */
	public function getConnectionInfoUsersWantEnterLockedRoom($id){
		$sql = "
			SELECT
				users_want_enter_locked_room
			FROM
				connection_info
			WHERE
				id = {$id};";
		$res = $this->db->fetchRow($sql);
		return $res;
	}



	/**
	 * @param unknown $talkBindId
	 * @param unknown $clientId
	 * @return unknown
	 */
	public function getConnectionInfoByClient($condition){
		$sql = "
			SELECT
				id,
				a.room_name,
				a.connection_request_start_datetime,
				a.connection_start_datetime,
				a.connection_stop_datetime,
				a.connection_state,
				a.operator_client_id,
				b.negotiation_room_type
			FROM
				connection_info as a
			LEFT JOIN
				master_client_new as b
			ON
				a.client_id = b.client_id
			WHERE
				{$condition}
			;";

		$rtn = $this->db->fetchRow($sql, array());
		return $rtn;
	}

	/**
	 * @param unknown $talkBindId
	 * @param unknown $clientId
	 * @return unknown
	 */
	public function getConnectionInfo($condition){
		$sql = "
			SELECT
				id,
				room_name,
				room_state,
				collabo_id,
				connect_no,
				operator_peer_id,
				user_peer_id_1,
				user_peer_id_2,
				user_peer_id_3,
				user_peer_id_4,
				user_peer_id_5,
				user_peer_id_6,
				user_peer_id_7,
				user_peer_id_8,
				connection_request_start_datetime,
				connection_start_datetime,
				connection_stop_datetime,
				connection_state,
				operator_client_id,
				operator_staff_type,
				operator_staff_id,
				client_id,
				guest_redirect_url,
				created_datetime,
				updated_datetime
			FROM
				connection_info
			WHERE
				{$condition}
			;";

		$rtn = $this->db->fetchRow($sql, array());
		return $rtn;
	}

	/**
	 * @param unknown $talkBindId
	 * @param unknown $clientId
	 * @return unknown
	 */
	public function getConnectionLoginInfo($condition){
		$sql = "
			SELECT
				id,
				room_name,
				room_state,
				collabo_id,
				connect_no,
				operator_peer_id,
				user_peer_id_1,
				login_flg1,
				room_mode_flg1,
				connect_datetime1,
				user_peer_id_2,
				login_flg2,
				room_mode_flg2,
				connect_datetime2,
				user_peer_id_3,
				login_flg3,
				room_mode_flg3,
				connect_datetime3,
				user_peer_id_4,
				login_flg4,
				room_mode_flg4,
				connect_datetime4,
				user_peer_id_5,
				login_flg5,
				room_mode_flg5,
				connect_datetime5,
				user_peer_id_6,
				login_flg6,
				room_mode_flg6,
				connect_datetime6,
				user_peer_id_7,
				login_flg7,
				room_mode_flg7,
				connect_datetime7,
				user_peer_id_8,
				login_flg8,
				room_mode_flg8,
				connect_datetime8,
				connection_request_start_datetime,
				connection_start_datetime,
				connection_stop_datetime,
				connection_state,
				operator_client_id,
				operator_staff_type,
				operator_staff_id,
				client_id,
				guest_redirect_url,
				created_datetime,
				updated_datetime,
				users_want_enter_locked_room
			FROM
				connection_info
			WHERE
				{$condition}
			;";

		$rtn = $this->db->fetchRow($sql, array());
		return $rtn;
	}

	/**
	 *
	 * @param unknown $talkBindId
	 * @param unknown $clientId
	 * @return unknown
	 * 注意：参照ロック(SELECT FOR UPDATE)文ですので使用時は意識して使用してください。
	 */
	public function getConnectionInfoForUpdate($condition){
		$sql = "
			SELECT
				id,
				room_name,
				room_state,
				collabo_id,
				connect_no,
				operator_peer_id,
				user_peer_id_1,
				user_peer_id_2,
				user_peer_id_3,
				user_peer_id_4,
				user_peer_id_5,
				user_peer_id_6,
				user_peer_id_7,
				user_peer_id_8,
				connection_request_start_datetime,
				connection_start_datetime,
				connection_stop_datetime,
				connection_state,
				operator_client_id,
				operator_staff_type,
				operator_staff_id,
				client_id,
				guest_redirect_url,
				created_datetime,
				updated_datetime,
				users_want_enter_locked_room
			FROM
				connection_info
			WHERE
				{$condition}
			FOR UPDATE
			;";

		$rtn = $this->db->fetchRow($sql, array());
		return $rtn;
	}

	/**
	 * ログ取得
	 * @param unknown $talkBindId
	 * @param unknown $clientId
	 * @return unknown
	 */
	public function getConnectionInfoList($condition, $order, $ordertype, $page, $limit){

		$offset = 0;
		$page = $page - 1;
		if($page > 0){
			$offset = $page * $limit;
		}

		$sql = "
			SELECT
				id,
				room_name,
				room_state,
				collabo_id,
				room_enter_cnt,
				room_access_cnt,
				connect_no,
				operator_peer_id,
				user_peer_id_1,
				user_peer_id_2,
				user_peer_id_3,
				user_peer_id_4,
				user_peer_id_5,
				user_peer_id_6,
				user_peer_id_7,
				user_peer_id_8,
				connection_request_start_datetime,
				connection_start_datetime,
				connection_stop_datetime,
				connection_state,
				operator_client_id,
				operator_staff_type,
				operator_staff_id,
				guest_redirect_url,
				created_datetime,
				updated_datetime
			FROM
				connection_info
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
	 * 削除
	 */
	public function deleteConnectionInfo($condition){
		$n = $this->db->delete('connection_info', $condition);
		return $n;
	}

	/**
	 * ゲストのログイン処理
	 * @param unknown $connectNo
	 * @return unknown
	 */
	public function getOperatorInfo($id){
		$sql = "
				SELECT
					a.operator_client_id,
					b.staff_type,
					b.staff_id,
					b.staff_password,
					b.client_id,
					b.staff_del_flg,
					b.client_name,
					AES_DECRYPT(b.staff_firstname,@key) as staff_firstname,
					AES_DECRYPT(b.staff_firstnamepy,@key) as staff_firstnamepy,
					b.staff_comment,
					AES_DECRYPT(b.staff_lastname,@key) as staff_lastname,
					AES_DECRYPT(b.staff_lastnamepy,@key) as staff_lastnamepy,
					AES_DECRYPT(b.staff_name,@key) as staff_name,
					b.staff_email,
					b.staff_role,
					b.webphone_id,
					b.webphone_pass,
					b.webphone_ip,
					b.gaccount,
					AES_DECRYPT(b.gaccount_pass,@key) as gaccount_pass,
					b.telework_start_date,
					b.telework_end_date,
					b.call_type,
					b.sum_span_type,
					b.staff_payment_type,
					b.telephone_hour_price,
					b.telephone_one_price,
					b.maildm_hour_price,
					b.maildm_one_price,
					b.inquiry_hour_price,
					b.inquiry_one_price,
					b.auto_call,
					b.login_flg,
					b.meetin_number,
					b.picture_flg,
					b.department,
					b.executive,
					b.client_postcode1,
					b.client_postcode2,
					b.address,
					b.tel1,
					b.tel2,
					b.tel3,
					b.cell1,
					b.cell2,
					b.cell3,
					b.fax1,
					b.fax2,
					b.fax3,
					b.facebook,
					b.sns,
					b.free_item_name1,
					b.free_item_val1,
					b.free_item_name2,
					b.free_item_val2,
					b.memo_template,
					b.name_public_flg,
					b.meetin_id_public_flg,
					b.picture_public_flg,
					b.namecard_public_flg,
					b.email_public_flg,
					b.client_name_public_flg,
					b.department_name_public_flg,
					b.executive_public_flg,
					b.postcode_public_flg,
					b.address_public_flg,
					b.tel_public_flg,
					b.cell_public_flg,
					b.fax_public_flg,
					b.facebook_public_flg,
					b.sns_public_flg,
					b.free1_public_flg,
					b.free2_public_flg,
					b.create_date,
					b.update_date,
					c.namecard_name_public_flg,
					c.namecard_meetin_public_flg,
					c.namecard_client_name,
					c.namecard_client_name_public_flg,
					c.namecard_email,
					c.namecard_email_public_flg,
					c.namecard_picture_public_flg,
					c.namecard_card_public_flg,
					c.namecard_department,
					c.namecard_department_public_flg,
					c.namecard_executive,
					c.namecard_executive_public_flg,
					c.namecard_postcode1,
					c.namecard_postcode2,
					c.namecard_address,
					c.namecard_address_public_flg,
					c.namecard_tel1,
					c.namecard_tel2,
					c.namecard_tel3,
					c.namecard_tel_public_flg,
					c.namecard_cell1,
					c.namecard_cell2,
					c.namecard_cell3,
					c.namecard_cell_public_flg,
					c.namecard_fax1,
					c.namecard_fax2,
					c.namecard_fax3,
					c.namecard_fax_public_flg,
					c.namecard_facebook,
					c.namecard_facebook_public_flg,
					c.namecard_sns,
					c.namecard_sns_public_flg,
					c.namecard_free1_name,
					c.namecard_free1_val,
					c.namecard_free1_public_flg,
					c.namecard_free2_name,
					c.namecard_free2_val,
					c.namecard_free2_public_flg
				FROM
					connection_info as a
				INNER JOIN
					master_staff_new as b
				ON
					a.operator_staff_type = b.staff_type AND
					a.operator_staff_id = b.staff_id
				LEFT OUTER JOIN
					staff_client as c
				ON
					a.operator_staff_type = c.staff_type AND
					a.operator_staff_id = c.staff_id AND
					a.operator_client_id = c.client_id
				WHERE
					a.id = {$id}
				LIMIT 1;
		;";
		$res = $this->db->fetchRow($sql);
		return $res;
	}

	/**
	 * 現在のルーム内にログインユーザーが存在する場合にデータを返す
	 * @param unknown $connectionInfoId	connection_infoのPK
	 * @return unknown
	 */
	public function getOperatorCount($connectionInfoId){
		$sql = "
			SELECT
				id
			FROM
				connection_info
			WHERE
				id = {$connectionInfoId} AND
				(
					login_flg1 = 1 OR
					login_flg2 = 1 OR
					login_flg3 = 1 OR
					login_flg4 = 1 OR
					login_flg5 = 1 OR
					login_flg6 = 1 OR
					login_flg7 = 1 OR
					login_flg8 = 1
				)
		";
		$res = $this->db->fetchRow($sql);
		return $res;
	}

	public function updateRedirectUrl($connectionInfoId, $redirect_url){
		$dict = array();
		$dict['guest_redirect_url'] = $redirect_url;
		$condition = "(id = {$connectionInfoId}) ";
		$this->update($dict, $condition);
	}

/*
///////////////////////////////////////////////////////
// connection_infoのテーブル定義
///////////////////////////////////////////////////////

DROP TABLE IF EXISTS `connection_info`;
CREATE TABLE IF NOT EXISTS `connection_info` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT 'ユニークなID',
  `connect_no` varchar(13) COLLATE utf8_unicode_ci NOT NULL COMMENT '接続番号',
  `operator_peer_id` varchar(17) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'オペレータのPeerID',
  `user_peer_id_1` varchar(17) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'ユーザー1のPeerID',
  `user_peer_id_2` varchar(17) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'ユーザー2のPeerID',
  `user_peer_id_3` varchar(17) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'ユーザー3のPeerID',
  `user_peer_id_4` varchar(17) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'ユーザー4のPeerID',
  `user_peer_id_5` varchar(17) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'ユーザー5のPeerID',
  `user_peer_id_6` varchar(17) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'ユーザー6のPeerID',
  `user_peer_id_7` varchar(17) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'ユーザー7のPeerID',
  `user_peer_id_8` varchar(17) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'ユーザー8のPeerID',
  `connection_request_start_datetime` datetime DEFAULT NULL COMMENT '接続要求発行日時',
  `connection_start_datetime` datetime DEFAULT NULL COMMENT '接続開始日時',
  `connection_stop_datetime` datetime DEFAULT NULL COMMENT '接続終了日時',
  `connection_state` tinyint(4) NOT NULL DEFAULT '0' COMMENT '接続状態(0:未使用,1:接続要求中(オペレータ側),2:接続要求中(ユーザー側),3:接続中,4:接続切断中,5:終了',
  `operator_client_id` int(11) DEFAULT NULL COMMENT 'オペレータのクライアントID',
  `operator_staff_type` char(2) COLLATE utf8_unicode_ci NOT NULL COMMENT 'オペレータの種別[AA,CE,TA]',
  `operator_staff_id` int(11) NOT NULL COMMENT 'オペレータのID',
  `created_datetime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '作成日時',
  `updated_datetime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '更新日時',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=1 ;

///////////////////////////////////////////////////////
// connection_info_historyのテーブル定義
///////////////////////////////////////////////////////

DROP TABLE IF EXISTS `connection_info_history`;
CREATE TABLE IF NOT EXISTS `connection_info_history` (
  `id_history` bigint(20) NOT NULL AUTO_INCREMENT COMMENT 'ユニークなID',
  `id` bigint(20) DEFAULT NULL COMMENT 'connection_infoのユニークなID',
  `connect_no` varchar(13) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT '接続番号',
  `operator_peer_id` varchar(17) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'オペレータのPeerID',
  `user_peer_id_1` varchar(17) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'ユーザー1のPeerID',
  `user_peer_id_2` varchar(17) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'ユーザー2のPeerID',
  `user_peer_id_3` varchar(17) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'ユーザー3のPeerID',
  `user_peer_id_4` varchar(17) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'ユーザー4のPeerID',
  `user_peer_id_5` varchar(17) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'ユーザー5のPeerID',
  `user_peer_id_6` varchar(17) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'ユーザー6のPeerID',
  `user_peer_id_7` varchar(17) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'ユーザー7のPeerID',
  `user_peer_id_8` varchar(17) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'ユーザー8のPeerID',
  `connection_request_start_datetime` datetime DEFAULT NULL COMMENT '接続要求発行日時',
  `connection_start_datetime` datetime DEFAULT NULL COMMENT '接続開始日時',
  `connection_stop_datetime` datetime DEFAULT NULL COMMENT '接続終了日時',
  `connection_state` tinyint(4) DEFAULT NULL COMMENT '接続状態(0:未使用,1:接続要求中(オペレータ側),2:接続要求中(ユーザー側),3:接続中,4:接続切断中,5:終了',
  `operator_client_id` int(11) DEFAULT NULL COMMENT 'オペレータのクライアントID',
  `operator_staff_type` char(2) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'オペレータの種別[AA,CE,TA]',
  `operator_staff_id` int(11) DEFAULT NULL COMMENT 'オペレータのID',
  `created_datetime` datetime DEFAULT NULL COMMENT 'connection_infoの作成日時',
  `updated_datetime` datetime DEFAULT NULL COMMENT 'connection_infoの更新日時',
  `created_datetime_history` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '作成日時',
  `updated_datetime_history` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '更新日時',
  PRIMARY KEY (`id_history`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=1 ;

///////////////////////////////////////////////////////
// 古いconnection_infoとconnection_info_historyを新しいconnection_infoとconnection_info_historyに変換
///////////////////////////////////////////////////////

ALTER TABLE connection_info DROP COLUMN user_peer_id;
ALTER TABLE connection_info DROP COLUMN operator_peer_id_screen;
ALTER TABLE connection_info DROP COLUMN user_peer_id_screen;
ALTER TABLE connection_info ADD user_peer_id_1 varchar(17) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'ユーザー1のPeerID' AFTER operator_peer_id;
ALTER TABLE connection_info ADD user_peer_id_2 varchar(17) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'ユーザー1のPeerID' AFTER user_peer_id_1;
ALTER TABLE connection_info ADD user_peer_id_3 varchar(17) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'ユーザー1のPeerID' AFTER user_peer_id_2;
ALTER TABLE connection_info ADD user_peer_id_4 varchar(17) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'ユーザー1のPeerID' AFTER user_peer_id_3;
ALTER TABLE connection_info ADD user_peer_id_5 varchar(17) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'ユーザー1のPeerID' AFTER user_peer_id_4;
ALTER TABLE connection_info ADD user_peer_id_6 varchar(17) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'ユーザー1のPeerID' AFTER user_peer_id_5;
ALTER TABLE connection_info ADD user_peer_id_7 varchar(17) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'ユーザー1のPeerID' AFTER user_peer_id_6;
ALTER TABLE connection_info ADD user_peer_id_8 varchar(17) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'ユーザー1のPeerID' AFTER user_peer_id_7;

ALTER TABLE connection_info_history DROP COLUMN user_peer_id;
ALTER TABLE connection_info_history DROP COLUMN operator_peer_id_screen;
ALTER TABLE connection_info_history DROP COLUMN user_peer_id_screen;
ALTER TABLE connection_info_history ADD user_peer_id_1 varchar(17) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'ユーザー1のPeerID' AFTER operator_peer_id;
ALTER TABLE connection_info_history ADD user_peer_id_2 varchar(17) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'ユーザー1のPeerID' AFTER user_peer_id_1;
ALTER TABLE connection_info_history ADD user_peer_id_3 varchar(17) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'ユーザー1のPeerID' AFTER user_peer_id_2;
ALTER TABLE connection_info_history ADD user_peer_id_4 varchar(17) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'ユーザー1のPeerID' AFTER user_peer_id_3;
ALTER TABLE connection_info_history ADD user_peer_id_5 varchar(17) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'ユーザー1のPeerID' AFTER user_peer_id_4;
ALTER TABLE connection_info_history ADD user_peer_id_6 varchar(17) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'ユーザー1のPeerID' AFTER user_peer_id_5;
ALTER TABLE connection_info_history ADD user_peer_id_7 varchar(17) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'ユーザー1のPeerID' AFTER user_peer_id_6;
ALTER TABLE connection_info_history ADD user_peer_id_8 varchar(17) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'ユーザー1のPeerID' AFTER user_peer_id_7;

///////////////////////////////////////////////////////
// 古いconnection_infoのテーブル定義
///////////////////////////////////////////////////////

DROP TABLE IF EXISTS `connection_info`;
CREATE TABLE IF NOT EXISTS `connection_info` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT 'ユニークなID',
  `connect_no` varchar(13) COLLATE utf8_unicode_ci NOT NULL COMMENT '接続番号',
  `operator_peer_id` varchar(16) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'オペレータのPeerID',
  `user_peer_id` varchar(16) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'ユーザーのPeerID',
  `operator_peer_id_screen` varchar(16) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'オペレータのPeerID(画面共有)',
  `user_peer_id_screen` varchar(16) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'ユーザーのPeerID(画面共有)',
  `connection_request_start_datetime` datetime DEFAULT NULL COMMENT '接続要求発行日時',
  `connection_start_datetime` datetime DEFAULT NULL COMMENT '接続開始日時',
  `connection_stop_datetime` datetime DEFAULT NULL COMMENT '接続終了日時',
  `connection_state` tinyint(4) NOT NULL DEFAULT '0' COMMENT '接続状態(0:未使用,1:接続要求中(オペレータ側),2:接続要求中(ユーザー側),3:接続中,4:接続切断中,5:終了',
  `operator_client_id` int(11) DEFAULT NULL COMMENT 'オペレータのクライアントID',
  `operator_staff_type` char(2) COLLATE utf8_unicode_ci NOT NULL COMMENT 'オペレータの種別[AA,CE,TA]',
  `operator_staff_id` int(11) NOT NULL COMMENT 'オペレータのID',
  `created_datetime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '作成日時',
  `updated_datetime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '更新日時',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=1 ;

///////////////////////////////////////////////////////
// connection_info
///////////////////////////////////////////////////////

ALTER TABLE connection_info CHANGE operator_peer_id operator_peer_id varchar(17) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'オペレータのPeerID';
ALTER TABLE connection_info CHANGE user_peer_id_1 user_peer_id_1 varchar(17) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'ユーザー1のPeerID';
ALTER TABLE connection_info CHANGE user_peer_id_2 user_peer_id_2 varchar(17) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'ユーザー2のPeerID';
ALTER TABLE connection_info CHANGE user_peer_id_3 user_peer_id_3 varchar(17) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'ユーザー3のPeerID';
ALTER TABLE connection_info CHANGE user_peer_id_4 user_peer_id_4 varchar(17) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'ユーザー4のPeerID';
ALTER TABLE connection_info CHANGE user_peer_id_5 user_peer_id_5 varchar(17) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'ユーザー5のPeerID';
ALTER TABLE connection_info CHANGE user_peer_id_6 user_peer_id_6 varchar(17) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'ユーザー6のPeerID';
ALTER TABLE connection_info CHANGE user_peer_id_7 user_peer_id_7 varchar(17) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'ユーザー7のPeerID';
ALTER TABLE connection_info CHANGE user_peer_id_8 user_peer_id_8 varchar(17) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'ユーザー8のPeerID';

ALTER TABLE connection_info_history CHANGE operator_peer_id operator_peer_id varchar(17) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'オペレータのPeerID';
ALTER TABLE connection_info_history CHANGE user_peer_id_1 user_peer_id_1 varchar(17) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'ユーザー1のPeerID';
ALTER TABLE connection_info_history CHANGE user_peer_id_2 user_peer_id_2 varchar(17) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'ユーザー2のPeerID';
ALTER TABLE connection_info_history CHANGE user_peer_id_3 user_peer_id_3 varchar(17) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'ユーザー3のPeerID';
ALTER TABLE connection_info_history CHANGE user_peer_id_4 user_peer_id_4 varchar(17) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'ユーザー4のPeerID';
ALTER TABLE connection_info_history CHANGE user_peer_id_5 user_peer_id_5 varchar(17) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'ユーザー5のPeerID';
ALTER TABLE connection_info_history CHANGE user_peer_id_6 user_peer_id_6 varchar(17) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'ユーザー6のPeerID';
ALTER TABLE connection_info_history CHANGE user_peer_id_7 user_peer_id_7 varchar(17) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'ユーザー7のPeerID';
ALTER TABLE connection_info_history CHANGE user_peer_id_8 user_peer_id_8 varchar(17) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'ユーザー8のPeerID';

*/
}
?>