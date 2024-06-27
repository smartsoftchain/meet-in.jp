<?php

/**
 * MasterStaffDao クラス
 *
 * 全利用者のデータを扱うDaoクラス
 *
 * @version 2015/06/06 19:02 ochi
 * @package Dao
*/
class MasterStaffDao extends AbstractDao {

	const TABLE_NAME = "master_staff_new";

	// 担当者種別[AA:管理担当者,TA:在宅担当者,CE:クライアント担当者]
	const STAFF_TYPE_AA = "AA";
	const STAFF_TYPE_CE = "CE";

	private $db;

	function __construct($db){
		parent::init();
		$this->db = $db;
	}

	/**
	 * 担当者情報登録
	 * @param unknown $form
	 * @throws Exception
	 */
	public function setStaff($form) {
		$staffId = "0";
		$record = array(
				'client_id' 					=> $this->returnNullZero($form["client_id"]),
				'staff_type'					=> $form["staff_type"],
				'staff_del_flg' 				=> $form["staff_del_flg"],
				'client_name' 					=> $form['client_name'],
				'staff_firstname' 				=> new Zend_Db_Expr("AES_ENCRYPT({$this->db->quote($form['staff_firstname'])}, @key)"),
				'staff_firstnamepy' 			=> new Zend_Db_Expr("AES_ENCRYPT({$this->db->quote($form['staff_firstnamepy'])}, @key)"),
				'staff_comment' 				=> "",
				'staff_lastname' 				=> new Zend_Db_Expr("AES_ENCRYPT({$this->db->quote($form['staff_lastname'])}, @key)"),
				'staff_lastnamepy' 				=> new Zend_Db_Expr("AES_ENCRYPT({$this->db->quote($form['staff_lastnamepy'])}, @key)"),
				'staff_name' 					=> new Zend_Db_Expr("AES_ENCRYPT({$this->db->quote($form['staff_name'])}, @key)"),
				'staff_email' 					=> $form["staff_email"],
				'webphone_id' 					=> $form["webphone_id"],
				'webphone_pass' 				=> $form["webphone_pass"],
				'webphone_ip' 					=> $form["webphone_ip"],
				'gaccount' 						=> $form["gaccount"],
				'gaccount_pass' 				=> new Zend_Db_Expr("AES_ENCRYPT({$this->db->quote($form['gaccount_pass'])}, @key)"),
				'staff_role' 					=> $form["staff_role"],
				'record_method_type' 	=> $this->returnNullZero($form["record_method_type"]),
				'delete_general_authority_flg' 	=> $form["delete_general_authority_flg"],
				'e_contract_authority_flg' 	=> $form["e_contract_authority_flg"],
				'call_type' 					=> $form["call_type"],
				'sum_span_type' 				=> $form["sum_span_type"],
				'telephone_hour_price' 	 	 	=> $form["telephone_hour_price"],
				'staff_payment_type' 	 	 	=> $form["staff_payment_type"],
				'telephone_one_price' 			=> $form["telephone_one_price"],
				'maildm_hour_price' 			=> $form["maildm_hour_price"],
				'maildm_one_price' 				=> $form["maildm_one_price"],
				'inquiry_hour_price' 	 	 	=> $form["inquiry_hour_price"],
				'inquiry_one_price' 			=> $form["inquiry_one_price"],
				'auto_call' 					=> $form["auto_call"],
				'login_flg' 					=> $form["login_flg"],
				'client_postcode1' 				=> $form["client_postcode1"],
				'client_postcode2' 				=> $form["client_postcode2"],
				'address' 						=> $form["address"],
				'tel1' 							=> $form["tel1"],
				'tel2' 							=> $form["tel2"],
				'tel3' 							=> $form["tel3"],
				'fax1' 							=> $form["fax1"],
				'fax2' 							=> $form["fax2"],
				'fax3' 							=> $form["fax3"],
				'department' 					=> $form["department"],
				'executive' 					=> $form["executive"],
				'cell1' 						=> $form["cell1"],
				'cell2' 						=> $form["cell2"],
				'cell3' 						=> $form["cell3"],
				'picture_flg'					=> $this->returnNullZero($form['picture_flg']),
				'name_public_flg'				=> $this->returnNullZero($form['name_public_flg']),
				'meetin_id_public_flg'			=> $this->returnNullZero($form['meetin_id_public_flg']),
				'picture_public_flg'			=> $this->returnNullZero($form['picture_public_flg']),
				'namecard_public_flg'			=> $this->returnNullZero($form['namecard_public_flg']),
				'email_public_flg'				=> $this->returnNullZero($form['email_public_flg']),
				'client_name_public_flg'		=> $this->returnNullZero($form['client_name_public_flg']),
				'department_name_public_flg'	=> $this->returnNullZero($form['department_name_public_flg']),
				'executive_public_flg'			=> $this->returnNullZero($form['executive_public_flg']),
				'postcode_public_flg'			=> $this->returnNullZero($form['postcode_public_flg']),
				'address_public_flg'			=> $this->returnNullZero($form['address_public_flg']),
				'tel_public_flg'				=> $this->returnNullZero($form['tel_public_flg']),
				'cell_public_flg'				=> $this->returnNullZero($form['cell_public_flg']),
				'fax_public_flg'				=> $this->returnNullZero($form['fax_public_flg']),
				'facebook_public_flg'			=> $this->returnNullZero($form['facebook_public_flg']),
				'sns_public_flg'				=> $this->returnNullZero($form['sns_public_flg']),
				'free1_public_flg'				=> $this->returnNullZero($form['free1_public_flg']),
				'free2_public_flg'				=> $this->returnNullZero($form['free2_public_flg']),
				'desktop_notify_flg'			=> $this->returnNullZero($form['desktop_notify_flg']),
				'remind_record_flg'             => $this->returnNullZero($form['remind_record_flg']),
				'staff_authenticate_flg'        => $this->returnNullZero($form['staff_authenticate_flg']),
				'room_name'                     => $this->returnNullZero($form['room_name']),
				'salescrowd_staff_id'           => empty($form['salescrowd_staff_id']) ? NULL : $form["salescrowd_staff_id"],
				'salescrowd_staff_type'         => empty($form['salescrowd_staff_type']) ? NULL : $form["salescrowd_staff_type"],
				'salescrowd_token'              => empty($form['salescrowd_token']) ? NULL : $form["salescrowd_token"],
				'update_date'                   => new Zend_Db_Expr('now()')
		);
		// パスワードは設定されている場合のみ登録する
		if(array_key_exists("staff_password_mod", $form) && $form['staff_password_mod'] == "1"){
			$record['staff_password'] = md5($form['staff_password']);
		} else if(array_key_exists("staff_password", $form) && $form['staff_password'] != ''){
			$record['staff_password'] = md5($form['staff_password']);
		}
		if(!array_key_exists("staff_id", $form) || $form['staff_id'] == ''){
			// meetin番号の採番
			$num = $this->generateMeetinNumber($form["client_id"]);
			// 番号取得失敗
			if(empty($num)) {
				return $staffId;
			}
			// staff_idの設定
			$record['staff_id'] = new Zend_Db_Expr('master_staff_new_increment(staff_type)');
			$record['meetin_number'] = $num;
			// 登録日を設定する
			$record['create_date'] = new Zend_Db_Expr('now()');
			// 自サーバーに登録
			$this->db->insert('master_staff_new', $record);
			// 登録データを取得する
			$sql = "SELECT
						MAX(staff_id) as staff_id
					FROM
						master_staff_new
					WHERE
						staff_type		= '{$form["staff_type"]}' AND
						staff_name		= AES_ENCRYPT({$this->db->quote($form['staff_name'])}, @key);";
			$rtn = $this->db->fetchRow($sql, array());
			// 戻り値を設定する
			$staffId = $rtn['staff_id'];
			//$num = sprintf("090%04d%04d", $staffId, $form["client_id"]);// 課題 090固定
			//$num = $this->createMeetinNumber($staffId, $form["client_id"]);
			//$record = array();
			//$record2['meetin_number'] = $num;
			//$this->db->update('master_staff_new', $record2, " staff_type = '{$form['staff_type']}' AND staff_id = {$staffId} " );
		}else{
			//$num = sprintf("090%04d%04d", $form['staff_id'], $form["client_id"]);// 課題 090固定
			//$num = $this->createMeetinNumber($form['staff_id'], $form["client_id"]);
			$record['meetin_number'] = $form['meetin_number'];
			// 自サーバーに登録
			$this->db->update('master_staff_new', $record, " staff_type = '{$form['staff_type']}' AND staff_id = {$form['staff_id']} " );
			$staffId = $form['staff_id'];
			// クライアント選択があれば名刺データを更新
			if ( ($form["namecard_client_id"] != 0) &&
				($form["staff_type"] == $this->user['staff_type'] && $form["staff_id"] == $this->user['staff_id']) ) {
				$namecard_record = array(
					'client_id' => $form["namecard_client_id"],
					'staff_type' => $form["staff_type"],
					'staff_id' => $form["staff_id"],
					'staff_firstname' => new Zend_Db_Expr("AES_ENCRYPT({$this->db->quote($form['staff_firstname'])}, @key)"),
					'staff_lastname' => new Zend_Db_Expr("AES_ENCRYPT({$this->db->quote($form['staff_lastname'])}, @key)"),
					'namecard_name_public_flg' => $this->returnNullZero($form['name_public_flg']),
					'namecard_meetin_public_flg' => $this->returnNullZero($form['meetin_id_public_flg']),
					'namecard_room_public_flg' => $this->returnNullZero($form['namecard_room_public_flg']),
					'namecard_client_name' => $form['client_name'],
					'namecard_client_name_public_flg' => $this->returnNullZero($form['client_name_public_flg']),
					'namecard_email' => $form["namecard_email"],
					'namecard_email_public_flg' => $this->returnNullZero($form['email_public_flg']),
					'namecard_url' => $form["namecard_url"],
					'namecard_url_public_flg' => $this->returnNullZero($form['url_public_flg']),
					'namecard_picture_public_flg' => $this->returnNullZero($form['picture_public_flg']),
					'namecard_card_public_flg' => $this->returnNullZero($form['namecard_public_flg']),
					'namecard_department' => $form["department"],
					'namecard_department_public_flg' => $this->returnNullZero($form['department_name_public_flg']),
					'namecard_executive' => $form["executive"],
					'namecard_executive_public_flg' => $this->returnNullZero($form['executive_name_public_flg']),
					'namecard_postcode1' => $form["client_postcode1"],
					'namecard_postcode2' => $form["client_postcode2"],
					'namecard_address' => $form["address"],
					'namecard_address_public_flg' => $this->returnNullZero($form['address_public_flg']),
					'namecard_tel1' => $form["tel1"],
					'namecard_tel2' => $form["tel2"],
					'namecard_tel3' => $form["tel3"],
					'namecard_tel_public_flg' => $this->returnNullZero($form['tel_public_flg']),
					'namecard_cell1' => $form["cell1"],
					'namecard_cell2' => $form["cell2"],
					'namecard_cell3' => $form["cell3"],
					'namecard_cell_public_flg' => $this->returnNullZero($form['cell_public_flg']),
					'namecard_fax1' => $form["fax1"],
					'namecard_fax2' => $form["fax2"],
					'namecard_fax3' => $form["fax3"],
					'namecard_fax_public_flg' => $this->returnNullZero($form['fax_public_flg']),
					'namecard_facebook' => $form["facebook"],
					'namecard_facebook_public_flg' => $this->returnNullZero($form['facebook_public_flg']),
					'namecard_sns' => $form["sns"],
					'namecard_sns_public_flg' => $this->returnNullZero($form['sns_public_flg']),
					'namecard_free1_name' => $form["free_item_name1"],
					'namecard_free1_val' => $form["free_item_val1"],
					'namecard_free1_public_flg' => $this->returnNullZero($form['free1_public_flg']),
					'namecard_free2_name' => $form["free_item_name2"],
					'namecard_free2_val' => $form["free_item_val2"],
					'namecard_free2_public_flg' => $this->returnNullZero($form['free2_public_flg']),
					'namecard_free3_name' => $form["free_item_name3"],
					'namecard_free3_val' => $form["free_item_val3"],
					'namecard_free3_public_flg' => $this->returnNullZero($form['free3_public_flg']),
					'namecard_free4_name' => $form["free_item_name4"],
					'namecard_free4_val' => $form["free_item_val4"],
					'namecard_free4_public_flg' => $this->returnNullZero($form['free4_public_flg']),
					'namecard_free5_name' => $form["free_item_name5"],
					'namecard_free5_val' => $form["free_item_val5"],
					'namecard_free5_public_flg' => $this->returnNullZero($form['free5_public_flg']),
					'namecard_photo1_desc' => $form['namecard_photo1_desc'],
					'namecard_photo1_desc_public_flg' => $this->returnNullZero($form['namecard_photo1_desc_public_flg']),
					'namecard_photo1_public_flg' => $this->returnNullZero($form['namecard_photo1_public_flg']),
					'namecard_photo2_desc' => $form['namecard_photo2_desc'],
					'namecard_photo2_desc_public_flg' => $this->returnNullZero($form['namecard_photo2_desc_public_flg']),
					'namecard_photo2_public_flg' => $this->returnNullZero($form['namecard_photo2_public_flg']),
					'namecard_introduction' => $form['namecard_introduction'],
					'namecard_introduction_public_flg' => $this->returnNullZero($form['namecard_introduction_public_flg']),
					'namecard_cate1_title' => $form['namecard_cate1_title'],
					'namecard_cate1_title_public_flg' => $this->returnNullZero($form['namecard_cate1_title_public_flg']),
					'namecard_cate2_title' => $form['namecard_cate2_title'],
					'namecard_cate2_title_public_flg' => $this->returnNullZero($form['namecard_cate2_title_public_flg']),
					'namecard_cate3_title' => $form['namecard_cate3_title'],
					'namecard_cate3_title_public_flg' => $this->returnNullZero($form['namecard_cate3_title_public_flg']),
					'namecard_cate4_title' => $form['namecard_cate4_title'],
					'namecard_cate4_title_public_flg' => $this->returnNullZero($form['namecard_cate4_title_public_flg']),
					'update_date' => new Zend_Db_Expr('now()'),
				);
				// staff_clien_id取得
				$condition = " client_id={$form["namecard_client_id"]} AND staff_type='{$form["staff_type"]}' AND staff_id={$form["staff_id"]}";
				$sql = "SELECT
					staff_client_id
				FROM
					staff_client
				WHERE
					{$condition}
				";
				$rtn = $this->db->fetchRow($sql, array());
				if(empty($rtn)) {
					// なければ新規追加
					$namecard_record["create_date"] = new Zend_Db_Expr('now()');
					$this->db->insert('staff_client',$namecard_record);
				} else {
					// あれば更新
					if(array_key_exists("staff_client_id", $rtn)){
						$this->db->update('staff_client', $namecard_record, " staff_client_id={$rtn['staff_client_id']}");
					}
				}
			}
		}
		return $staffId;
	}

	/**
	 * meetin_numberを生成する関数
	 * 敷居値が固定になっているので、仕様変更の際は注意
	 * @param unknown $staffId
	 * @param unknown $clientId
	 * @return string
	 */
	private function createMeetinNumber($staffId, $clientId){
		// 担当者のIDの桁数によりmeetin_numberを変更する
		$num = 0;
		if($staffId < 10000){
			$num = "090";
		}else if($staffId >= 10000 && $staffId < 20000){
			$num = "080";
		}else{
			// 30000を超えると登録できなくなるが、現状３万人を超える事は想定しない
			$num = "070";
		}
		$staffIdNumber = substr(sprintf("%04d", $staffId), -4);
		$clientIdNumber = substr(sprintf("%04d", $clientId), -4);

		$num = "{$num}{$staffIdNumber}{$clientIdNumber}";
		return $num;
	}
	/**
	 * meetin番号の空き番チェック関数
	 * アカウント新規追加時用
	 * @param unknown $meetin_number
	 * @return bool
	 */
	public function emptyMeetinNumber($meetin_number) {
		$sql = "SELECT
			COUNT(*) as meetin_exist
		FROM
			master_staff_new
		WHERE
			meetin_number = '{$meetin_number}'
		;";
		$rtn = $this->db->fetchRow($sql, array());
		if(empty($rtn["meetin_exist"])) {
			return true;
		}
		return false;
	}
	/**
	 * meetin番号の生成関数
	 * クライアント毎に採番する
	 * 既に発行されている番号があるため空き番チェックを行う
	 * @param unknown $clientId
	 * @return string
	 */
	private function generateMeetinNumber($clientId) {
		if(!isset($clientId) || empty($clientId) || $clientId == '') {
			$clientId = "0";
		}
		// 該当クライアントIDのstaffレコード数でmeetin番号が作れるかチェック
		$sql = "SELECT
			COUNT(staff_id) as staff_count
		FROM
			master_staff_new
		WHERE
			client_id = {$clientId}
		;";
		$rtn = $this->db->fetchRow($sql, array());
		if(!isset($rtn["staff_count"]) || empty($rtn["staff_count"]) || $rtn["staff_count"] == 0) {
			$rtn["staff_count"] = 1;
		}
		// 数値化
		$count = intval($rtn["staff_count"]);
		$meetin0x0 = 9;
		if($count > 0 && $count < 10000) {
		} else if($count > 10000 && $count < 20000) {
			$meetin0x0 -= 1;
		} else if($count > 20000 && $count < 30000) {
			$meetin0x0 -= 2;
		} else {
			return "";
		}
		for($meetin1st = $meetin0x0; $meetin1st > 6; $meetin1st--) {
			for($meetin2nd = $count; $meetin2nd < 10000; $meetin2nd++) {
				$meetin = sprintf("0%d0%04d%04d", $meetin1st, $meetin2nd, $clientId);
				if(true == $this->emptyMeetinNumber($meetin)) {
					return $meetin;
				}
			}
			$count = 1;
		}
		return "";
	}
	/**
	 * ルーム名の空きチェック関数
	 * アカウント編集用(自アカウントはルームは除外)
	 * @param unknown $room_name
	 * @param unknown $staff_type
	 * @param unknown $staff_id
	 * @return bool
	 */
	public function existRoomName($room_name, $staff_type, $staff_id) {
		$staff_info = "0";
		if(!empty($staff_type) && !empty($staff_id)) {
			$staff_info = "staff_type = '{$staff_type}' AND staff_id = {$staff_id}";
		}
		$sql = "SELECT
			COUNT(*) as room_exist
		FROM
			master_staff_new
		WHERE
			room_name = '{$room_name}'
		AND
			NOT({$staff_info})
		;";
		$rtn = $this->db->fetchRow($sql, array());
		if(empty($rtn["room_exist"])) {
			return true;
		}
		return false;
	}
	/**
	 * meetin番号の空き番チェック関数
	 * アカウント編集用(自アカウントの番号は除外)
	 * @param unknown $meetin_number
	 * @param unknown $staff_type
	 * @param unknown $staff_id
	 * @return bool
	 */
	public function existMeetinNumber($meetin_number, $staff_type, $staff_id) {
		$sql = "SELECT
			COUNT(*) as meetin_exist
		FROM
			master_staff_new
		WHERE
			meetin_number = '{$meetin_number}'
		AND
			NOT(staff_type = '{$staff_type}' AND staff_id = {$staff_id})
		;";
		$rtn = $this->db->fetchRow($sql, array());
		if(empty($rtn["meetin_exist"])) {
			return true;
		}
		return false;
	}
	/**
	 * 対象の担当者情報を更新
	 * @param unknown $form
	 * @return unknown
	 */
	public function setStaffOne($form) {
		$record = array();
		if (array_key_exists("name3", $form)) {
			$record = array($form["name"]=>$form["val"],
							$form["name2"]=>$form["val2"],
							$form["name3"]=>$form["val3"]);
		}
		else if (array_key_exists("name2", $form)) {
//			if ($form["name"] == "staff_firstname") {
				$record = array($form["name"]=>$form["val"],
								$form["name2"]=>$form["val2"],
								'staff_name' => "{$form['staff_firstname']} {$form['staff_lastname']}" );
//			} else {
//				$record = array($form["name"]=>$form["val"],
//								$form["name2"]=>$form["val2"]);
//			}
		}
		else {
			$record = array($form["name"]=>$form["val"]);
		}
		if(array_key_exists("staff_id", $form) && $form['staff_id'] != ''){
			// 自サーバーに登録
			$this->db->update('master_staff_new', $record, " staff_type = '{$form['staff_type']}' AND staff_id = {$form['staff_id']} " );
		}
		return array('state'=> "1");
	}

	/**
	 * 条件を指定し担当者の件数を取得する
	 * @param unknown $condition	検索条件
	 * @return unknown
	 */
	public function getMasterStaffCount($condition) {
		$sql = "SELECT
					COUNT(staff_id) as count
				FROM
					master_staff_new
				WHERE
					{$condition} AND
					staff_del_flg = 0;
		";
		$rtn = $this->db->fetchRow($sql, array());
		return $rtn["count"];
	}
	/**
	 * 条件を指定し担当者の一覧を取得する
	 * @param unknown $condition	検索条件
	 * @param unknown $order		ソートを行う為のカラム
	 * @param unknown $ordertype	昇順、降順
	 * @param unknown $page			ページインデックス
	 * @param unknown $limit		データ取得件数
	 * @return unknown
	 */
	public function getMasterStaffList($condition, $order, $ordertype, $page, $limit) {
		$offset = 0;
		$page = $page - 1;
		if($page > 0){
			$offset = $page * $limit;
		}
		$sql = "SELECT
					staff_type,
					staff_id,
					staff_password,
					client_id,
					staff_del_flg,
					client_name,
					AES_DECRYPT(staff_firstname,@key) as staff_firstname,
					AES_DECRYPT(staff_firstnamepy,@key) as staff_firstnamepy,
					staff_comment,
					AES_DECRYPT(staff_lastname,@key) as staff_lastname,
					AES_DECRYPT(staff_lastnamepy,@key) as staff_lastnamepy,
					AES_DECRYPT(staff_name,@key) as staff_name,
					staff_email,
					staff_role,
					delete_general_authority_flg,
					e_contract_authority_flg,
					webphone_id,
					webphone_pass,
					webphone_ip,
					gaccount,
					AES_DECRYPT(gaccount_pass,@key) as gaccount_pass,
					telework_start_date,
					telework_end_date,
					call_type,
					sum_span_type,
					staff_payment_type,
					telephone_hour_price,
					telephone_one_price,
					maildm_hour_price,
					maildm_one_price,
					inquiry_hour_price,
					inquiry_one_price,
					auto_call,
					login_flg,
					meetin_number,
					enter_login_date,
					create_date,
					update_date
				FROM
					master_staff_new
				WHERE
					{$condition} AND
					staff_del_flg = 0
				ORDER BY
					{$order} {$ordertype}
				LIMIT
					{$limit}
				OFFSET
					{$offset};
		";
		$rtn = $this->db->fetchAll($sql, array());
		return $rtn;
	}

	/**
	 * 条件を指定し担当者全件の一覧を取得する
	 * @param unknown $condition	検索条件
	 * @param unknown $order		ソートを行う為のカラム
	 * @param unknown $ordertype	昇順、降順
	 * @return unknown
	 */
	public function getMasterStaffAllList($condition, $order, $ordertype) {
		$sql = "SELECT
					staff_type,
					staff_id,
					staff_password,
					client_id,
					staff_del_flg,
					client_name,
					AES_DECRYPT(staff_firstname,@key) as staff_firstname,
					AES_DECRYPT(staff_firstnamepy,@key) as staff_firstnamepy,
					staff_comment,
					AES_DECRYPT(staff_lastname,@key) as staff_lastname,
					AES_DECRYPT(staff_lastnamepy,@key) as staff_lastnamepy,
					AES_DECRYPT(staff_name,@key) as staff_name,
					staff_email,
					staff_role,
					delete_general_authority_flg,
					e_contract_authority_flg,
					webphone_id,
					webphone_pass,
					webphone_ip,
					gaccount,
					AES_DECRYPT(gaccount_pass,@key) as gaccount_pass,
					telework_start_date,
					telework_end_date,
					call_type,
					sum_span_type,
					staff_payment_type,
					telephone_hour_price,
					telephone_one_price,
					maildm_hour_price,
					maildm_one_price,
					inquiry_hour_price,
					inquiry_one_price,
					auto_call,
					login_flg,
					meetin_number,
					create_date,
					update_date
				FROM
					master_staff_new
				WHERE
					{$condition} AND
					staff_del_flg = 0
				ORDER BY
					{$order} {$ordertype};
					";
		$rtn = $this->db->fetchAll($sql, array());
		return $rtn;
	}

	/**
	 * 条件を指定しチャット担当者全件の一覧を取得する
	 * [結合テーブルの存在目的]
	 *   [a] : 取得する担当者と、現在ログインしているユーザをSVとして生成しているチャットルームIDを取得するために存在
	 *   [e] : [a]で取得したルームIDで、チャット担当者が最後に送信しているメッセージIDを取得するために存在
	 *   [g] : 現在ログインしているSVユーザが、最後に既読にした担当者のメッセージIDを取得するために存在。[e]と[g]のメッセージIDを比較することで既読済みかわかる。
	 *   [h] : 取得する担当者が現在、「接続」なのか「未接続」なのか判定するために存在
	 * @param unknown $condition	検索条件
	 * @param unknown $order		ソートを行う為のカラム
	 * @param unknown $ordertype	昇順、降順
	 * @return unknown
	 */
	public function getChatMasterStaffAllList($condition, $order, $ordertype) {
		$sql = "SELECT
					a.staff_type,
					a.staff_id,
					a.staff_password,
					a.client_id,
					a.staff_del_flg,
					client_name,
					AES_DECRYPT(a.staff_firstname,@key) as staff_firstname,
					AES_DECRYPT(a.staff_firstnamepy,@key) as staff_firstnamepy,
					a.staff_comment,
					AES_DECRYPT(a.staff_lastname,@key) as staff_lastname,
					AES_DECRYPT(a.staff_lastnamepy,@key) as staff_lastnamepy,
					AES_DECRYPT(a.staff_name,@key) as staff_name,
					a.staff_email,
					a.staff_role,
					a.delete_general_authority_flg,
					a.e_contract_authority_flg,
					a.webphone_id,
					a.webphone_pass,
					a.webphone_ip,
					a.gaccount,
					AES_DECRYPT(a.gaccount_pass,@key) as gaccount_pass,
					a.telework_start_date,
					a.telework_end_date,
					a.call_type,
					a.sum_span_type,
					a.staff_payment_type,
					a.telephone_hour_price,
					a.telephone_one_price,
					a.maildm_hour_price,
					a.maildm_one_price,
					a.inquiry_hour_price,
					a.inquiry_one_price,
					a.auto_call,
					a.login_flg,
					a.meetin_number,
					a.create_date,
					a.update_date,
					(CASE
						WHEN h.view_flg = 1 THEN '接続'
						WHEN h.view_flg = 0 THEN '未接続'
						ELSE '未接続'
					END) AS connect_state,
					(CASE
						WHEN g.last_read_message_id < e.id THEN '未読あり'
						WHEN (g.last_read_message_id IS NULL && e.id IS NOT NULL) THEN '未読あり'
						WHEN e.id <= g.last_read_message_id THEN '未読なし'
						ELSE '履歴なし'
					END) AS unread_state,
					e.create_date as last_message_date
				FROM
					master_staff_new as a
					LEFT OUTER JOIN chat_room_staff as b ON
						b.staff_type = a.staff_type AND
						b.staff_id   = a.staff_id AND
						b.auth_type  = 2 AND
						b.room_id = (
							SELECT
								DISTINCT c.id
							FROM
								chat_room as c
								INNER JOIN chat_room_staff d ON
									d.room_id = c.id
							WHERE
								c.owner_staff_type = '{$this->user["staff_type"]}' AND
								c.owner_staff_id   = {$this->user["staff_id"]} AND
								d.staff_type = a.staff_type AND
								d.staff_id   = a.staff_id AND
								d.auth_type  = 2
						)
					LEFT OUTER JOIN chat_message as e ON
						e.sender_staff_type = a.staff_type AND
						e.sender_staff_id   = a.staff_id AND
						e.id = (
							SELECT
								MAX(id)
							FROM
								chat_message as f
							WHERE
								f.sender_staff_type = e.sender_staff_type AND
								f.sender_staff_id = e.sender_staff_id AND
								f.room_id = b.room_id
						) AND
						e.room_id = b.room_id
					LEFT OUTER JOIN chat_room_staff as g ON
						g.staff_type = '{$this->user["staff_type"]}' AND
						g.staff_id   = {$this->user["staff_id"]} AND
						g.room_id    = b.room_id AND
						g.auth_type  = 1
					LEFT OUTER JOIN chat_subscription as h ON
						h.staff_type = a.staff_type AND
						h.staff_id = a.staff_id AND
						h.auth_type = 2
				WHERE
					{$condition} AND
					a.staff_del_flg = 0
				ORDER BY
					h.view_flg desc,
					e.create_date desc;
					";
		$rtn = $this->db->fetchAll($sql, array());
		return $rtn;
	}

	/**
	 * 条件を指定し担当者選択で必要な全件の一覧を取得する
	 * @param unknown $condition	検索条件
	 * @param unknown $order		ソートを行う為のカラム
	 * @param unknown $ordertype	昇順、降順
	 * @return unknown
	 */
	public function getSelectMasterStaffAllList($condition, $order, $ordertype) {
		$sql = "SELECT
					staff_type,
					staff_id,
					staff_email,
					AES_DECRYPT(staff_name,@key) as staff_name
				FROM
					master_staff_new
				WHERE
					{$condition} AND
					staff_del_flg = 0
				ORDER BY
					{$order} {$ordertype};
		";
		$rtn = $this->db->fetchAll($sql, array());
		return $rtn;
	}

	public function getMasterStaffClientRow($condition, $join_condition) {
		$sql = "SELECT
					a.staff_type,
					a.staff_id,
					a.staff_password,
					a.client_id,
					a.staff_del_flg,
					a.client_name,
					AES_DECRYPT(a.staff_firstname,@key) as staff_firstname,
					AES_DECRYPT(a.staff_firstnamepy,@key) as staff_firstnamepy,
					a.staff_comment,
					AES_DECRYPT(a.staff_lastname,@key) as staff_lastname,
					AES_DECRYPT(a.staff_lastnamepy,@key) as staff_lastnamepy,
					AES_DECRYPT(a.staff_name,@key) as staff_name,
					a.staff_email,
					a.staff_role,
					a.record_method_type,
					a.delete_general_authority_flg,
					a.e_contract_authority_flg,
					a.webphone_id,
					a.webphone_pass,
					a.webphone_ip,
					a.gaccount,
					AES_DECRYPT(a.gaccount_pass,@key) as gaccount_pass,
					a.telework_start_date,
					a.telework_end_date,
					a.call_type,
					a.sum_span_type,
					a.staff_payment_type,
					a.telephone_hour_price,
					a.telephone_one_price,
					a.maildm_hour_price,
					a.maildm_one_price,
					a.inquiry_hour_price,
					a.inquiry_one_price,
					a.auto_call,
					a.login_flg,
					a.meetin_number,
					a.picture_flg,
					a.department,
					a.executive,
					a.client_postcode1,
					a.client_postcode2,
					a.address,
					a.tel1,
					a.tel2,
					a.tel3,
					a.cell1,
					a.cell2,
					a.cell3,
					a.fax1,
					a.fax2,
					a.fax3,
					a.facebook,
					a.sns,
					a.free_item_name1,
					a.free_item_val1,
					a.free_item_name2,
					a.free_item_val2,
					a.memo_template,
					a.name_public_flg,
					a.meetin_id_public_flg,
					a.picture_public_flg,
					a.namecard_public_flg,
					a.email_public_flg,
					a.client_name_public_flg,
					a.department_name_public_flg,
					a.executive_public_flg,
					a.postcode_public_flg,
					a.address_public_flg,
					a.tel_public_flg,
					a.cell_public_flg,
					a.fax_public_flg,
					a.facebook_public_flg,
					a.sns_public_flg,
					a.free1_public_flg,
					a.free2_public_flg,
					a.create_date,
					a.update_date,
					a.desktop_notify_flg,
					a.remind_record_flg,
					a.staff_authenticate_flg,
					a.room_name,
					a.salescrowd_token,
					a.salescrowd_staff_type,
					a.salescrowd_staff_id,
					b.client_id as namecard_client_id,
					b.namecard_name_public_flg,
					b.namecard_meetin_public_flg,
					b.namecard_room_public_flg,
					b.namecard_client_name,
					b.namecard_client_name_public_flg,
					b.namecard_email,
					b.namecard_email_public_flg,
					b.namecard_url,
					b.namecard_url_public_flg,
					b.namecard_picture_public_flg,
					b.namecard_card_public_flg,
					b.namecard_department,
					b.namecard_department_public_flg,
					b.namecard_executive,
					b.namecard_executive_public_flg,
					b.namecard_postcode1,
					b.namecard_postcode2,
					b.namecard_address,
					b.namecard_address_public_flg,
					b.namecard_tel1,
					b.namecard_tel2,
					b.namecard_tel3,
					b.namecard_tel_public_flg,
					b.namecard_cell1,
					b.namecard_cell2,
					b.namecard_cell3,
					b.namecard_cell_public_flg,
					b.namecard_fax1,
					b.namecard_fax2,
					b.namecard_fax3,
					b.namecard_fax_public_flg,
					b.namecard_facebook,
					b.namecard_facebook_public_flg,
					b.namecard_sns,
					b.namecard_sns_public_flg,
					b.namecard_free1_name,
					b.namecard_free1_val,
					b.namecard_free1_public_flg,
					b.namecard_free2_name,
					b.namecard_free2_val,
					b.namecard_free2_public_flg,
					b.namecard_free3_name,
					b.namecard_free3_val,
					b.namecard_free3_public_flg,
					b.namecard_free4_name,
					b.namecard_free4_val,
					b.namecard_free4_public_flg,
					b.namecard_free5_name,
					b.namecard_free5_val,
					b.namecard_free5_public_flg,
					b.namecard_photo1_desc,
					b.namecard_photo1_desc_public_flg,
					b.namecard_photo1_public_flg,
					b.namecard_photo2_desc,
					b.namecard_photo2_desc_public_flg,
					b.namecard_photo2_public_flg,
					b.namecard_introduction,
					b.namecard_introduction_public_flg,
					b.namecard_cate1_title,
					b.namecard_cate1_title_public_flg,
					b.namecard_cate2_title,
					b.namecard_cate2_title_public_flg,
					b.namecard_cate3_title,
					b.namecard_cate3_title_public_flg,
					b.namecard_cate4_title,
					b.namecard_cate4_title_public_flg
				FROM
					master_staff_new as a
				LEFT JOIN staff_client as b ON
					({$join_condition})
				WHERE
					{$condition} AND
					a.staff_del_flg = 0;
		";
		$rtn = $this->db->fetchRow($sql, array());
		return $rtn;
	}
	/**
	 * 条件を指定し担当者を取得する
	 * @param unknown $condition	検索条件
	 * @return unknown
	 */
	public function getMasterStaffRow($condition) {
		$sql = "SELECT
					staff_type,
					staff_id,
					staff_password,
					client_id,
					staff_del_flg,
					client_name,
					AES_DECRYPT(staff_firstname,@key) as staff_firstname,
					AES_DECRYPT(staff_firstnamepy,@key) as staff_firstnamepy,
					staff_comment,
					AES_DECRYPT(staff_lastname,@key) as staff_lastname,
					AES_DECRYPT(staff_lastnamepy,@key) as staff_lastnamepy,
					AES_DECRYPT(staff_name,@key) as staff_name,
					staff_email,
					staff_role,
					record_method_type,
					delete_general_authority_flg,
					e_contract_authority_flg,
					webphone_id,
					webphone_pass,
					webphone_ip,
					gaccount,
					AES_DECRYPT(gaccount_pass,@key) as gaccount_pass,
					telework_start_date,
					telework_end_date,
					call_type,
					sum_span_type,
					staff_payment_type,
					telephone_hour_price,
					telephone_one_price,
					maildm_hour_price,
					maildm_one_price,
					inquiry_hour_price,
					inquiry_one_price,
					auto_call,
					login_flg,
					meetin_number,
					picture_flg,
					department,
					executive,
					client_postcode1,
					client_postcode2,
					address,
					tel1,
					tel2,
					tel3,
					cell1,
					cell2,
					cell3,
					fax1,
					fax2,
					fax3,
					facebook,
					sns,
					free_item_name1,
					free_item_val1,
					free_item_name2,
					free_item_val2,
					memo_template,
					name_public_flg,
					meetin_id_public_flg,
					picture_public_flg,
					namecard_public_flg,
					email_public_flg,
					client_name_public_flg,
					department_name_public_flg,
					executive_public_flg,
					postcode_public_flg,
					address_public_flg,
					tel_public_flg,
					cell_public_flg,
					fax_public_flg,
					facebook_public_flg,
					sns_public_flg,
					free1_public_flg,
					free2_public_flg,
					desktop_notify_flg,
					remind_record_flg,
					staff_authenticate_flg,
					room_name,
					create_date,
					update_date
				FROM
					master_staff_new
				WHERE
					{$condition} AND
					staff_del_flg = 0;
		";
		$rtn = $this->db->fetchRow($sql, array());
		return $rtn;
	}

	/**
	 * 担当者を論理削除する
	 * @param unknown $clientId	クライアントID
	 * @param unknown $staffId	担当者ID
	 * @throws Exception
	 */
	public function deletStaff($staffType, $staffId) {
		// 担当者を論理削除する
		$record["staff_del_flg"] = "1";
		$this->db->update('master_staff_new', $record, "staff_type = '{$staffType}' AND staff_id = {$staffId}" );
	}

	/**
	 * クライアント担当者の一覧を取得する
	 * @param unknown $clientId	クライアントID
	 * @param unknown $condition	データ取得条件
	 * @param unknown $order
	 * @param unknown $ordertype
	 * @return unknown
	 */
	public function getClientStaffList($clientId, $condition, $order, $ordertype) {
		$sql = "SELECT
					client_id,
					staff_id,
					idchar,
					staff_password,
					staff_del_flg,
					client_name,
					AES_DECRYPT(staff_firstname,@key) as staff_firstname,
					AES_DECRYPT(staff_firstnamepy,@key) as staff_firstnamepy,
					staff_comment,
					AES_DECRYPT(staff_lastname,@key) as staff_lastname,
					AES_DECRYPT(staff_lastnamepy,@key) as staff_lastnamepy,
					AES_DECRYPT(staff_name,@key) as staff_name,
					staff_email,
					webphone_id,
					webphone_pass,
					webphone_ip,
					gaccount,
					AES_DECRYPT(gaccount_pass,@key) as gaccount_pass,
					staff_role,
					delete_general_authority_flg,
					e_contract_authority_flg,
					teleworker_flg,
					telework_start_date,
					telework_end_date,
					call_type,
					sum_span_type,
					staff_payment_type,
					telephone_hour_price,
					telephone_one_price,
					maildm_hour_price,
					maildm_one_price,
					inquiry_hour_price,
					inquiry_one_price,
					auto_call,
					login_flg,
					meetin_number,
					create_date,
					update_date
				FROM
					master_staff_new
				WHERE
					client_id = {$clientId} AND
					teleworker_flg = 0 AND
					staff_del_flg = 0
					{$condition}
				ORDER BY
					{$order} {$ordertype};
					";
		$rtn = $this->db->fetchAll($sql, array());
		return $rtn;
	}


	/**
	 * ログインする担当者の情報を返す
	 * @param unknown $idchar
	 * @param unknown $staffId
	 * @return unknown
	 */
	public function getLoginStaffRow($idchar, $staffId) {
		$sql = "SELECT
					client_id,
					staff_type,
					staff_id,
					staff_password,
					staff_del_flg,
					client_name,
					AES_DECRYPT(staff_firstname,@key) as staff_firstname,
					AES_DECRYPT(staff_firstnamepy,@key) as staff_firstnamepy,
					staff_comment,
					AES_DECRYPT(staff_lastname,@key) as staff_lastname,
					AES_DECRYPT(staff_lastnamepy,@key) as staff_lastnamepy,
					AES_DECRYPT(staff_name,@key) as staff_name,
					staff_email,
					staff_role,
					record_method_type,
					delete_general_authority_flg,
					e_contract_authority_flg,
					webphone_id,
					webphone_pass,
					webphone_ip,
					telework_start_date,
					telework_end_date,
					call_type,
					sum_span_type,
					staff_payment_type,
					telephone_hour_price,
					telephone_one_price,
					maildm_hour_price,
					maildm_one_price,
					inquiry_hour_price,
					inquiry_one_price,
					auto_call,
					login_flg,
					meetin_number,
					picture_flg,
					department,
					executive,
					client_postcode1,
					client_postcode2,
					address,
					tel1,
					tel2,
					tel3,
					cell1,
					cell2,
					cell3,
					fax1,
					fax2,
					fax3,
					facebook,
					sns,
					free_item_name1,
					free_item_val1,
					free_item_name2,
					free_item_val2,
					memo_template,
					name_public_flg,
					meetin_id_public_flg,
					picture_public_flg,
					namecard_public_flg,
					email_public_flg,
					client_name_public_flg,
					department_name_public_flg,
					executive_public_flg,
					postcode_public_flg,
					address_public_flg,
					tel_public_flg,
					cell_public_flg,
					fax_public_flg,
					facebook_public_flg,
					sns_public_flg,
					free1_public_flg,
					free2_public_flg,
					desktop_notify_flg,
					remind_record_flg,
					staff_authenticate_flg,
					room_name,
					bodypix_background_path,
					bodypix_internal_resolution,
					bodypix_segmentation_threshold,
					bodypix_mask_blur_amount,
					enter_room_date,
					enter_login_date,
					create_date,
					update_date
				FROM
					master_staff_new
				WHERE
					staff_type = :staffType AND
					staff_id = :staffId AND
					login_flg = 1 AND
					staff_del_flg = 0;
					";
		$rtn = $this->db->fetchRow($sql, array("staffType"=>$idchar, "staffId"=>$staffId));
		return $rtn;
	}

	public function getClientStaffListByNoClientId($condition, $order, $ordertype) {
		$sql = "SELECT
					client_id,
					staff_id,
					idchar,
					staff_password,
					staff_del_flg,
					client_name,
					AES_DECRYPT(staff_firstname,@key) as staff_firstname,
					AES_DECRYPT(staff_firstnamepy,@key) as staff_firstnamepy,
					staff_comment,
					AES_DECRYPT(staff_lastname,@key) as staff_lastname,
					AES_DECRYPT(staff_lastnamepy,@key) as staff_lastnamepy,
					AES_DECRYPT(staff_name,@key) as staff_name,
					staff_email,
					webphone_id,
					webphone_pass,
					webphone_ip,
					gaccount,
					AES_DECRYPT(gaccount_pass,@key) as gaccount_pass,
					staff_role,
					teleworker_flg,
					telework_start_date,
					telework_end_date,
					call_type,
					sum_span_type,
					staff_payment_type,
					telephone_hour_price,
					telephone_one_price,
					maildm_hour_price,
					maildm_one_price,
					inquiry_hour_price,
					inquiry_one_price,
					auto_call,
					login_flg,
					meetin_number,
					create_date,
					update_date
				FROM
					master_staff_new
				WHERE
					client_id <> 0 AND
					teleworker_flg = 0 AND
					staff_del_flg = 0
					{$condition}
				ORDER BY
					{$order} {$ordertype};
					";
		$rtn = $this->db->fetchAll($sql, array());
		return $rtn;
	}

	/**
	 * ログインする担当者の情報を返す
	 *
	 * @param unknown $clientId
	 * @param unknown $staffId
	 * @param unknown $teleworker_flg
	 * @return unknown
	 */
	public function getMasterStaffRow2($clientId, $staffId, $teleworker_flg) {

		$sql = "SELECT
					client_id,
					staff_id,
					idchar,
					staff_password,
					staff_del_flg,
					client_name,
					AES_DECRYPT(staff_firstname,@key) as staff_firstname,
					AES_DECRYPT(staff_firstnamepy,@key) as staff_firstnamepy,
					staff_comment,
					AES_DECRYPT(staff_lastname,@key) as staff_lastname,
					AES_DECRYPT(staff_lastnamepy,@key) as staff_lastnamepy,
					AES_DECRYPT(staff_name,@key) as staff_name,
					staff_email,
					webphone_id,
					webphone_pass,
					webphone_ip,
					gaccount,
					AES_DECRYPT(gaccount_pass,@key) as gaccount_pass,
					staff_role,
					delete_general_authority_flg,
					e_contract_authority_flg,
					teleworker_flg,
					telework_start_date,
					telework_end_date,
					call_type,
					sum_span_type,
					staff_payment_type,
					telephone_hour_price,
					telephone_one_price,
					maildm_hour_price,
					maildm_one_price,
					inquiry_hour_price,
					inquiry_one_price,
					auto_call,
					login_flg,
					meetin_number,
					bodypix_background_path,
					bodypix_internal_resolution,
					bodypix_segmentation_threshold,
					bodypix_mask_blur_amount,
					create_date,
					update_date
				FROM
					master_staff_new
				WHERE
					client_id = '{$clientId}' AND
					staff_id = {$staffId} AND
					teleworker_flg = {$teleworker_flg} AND
					login_flg = 1 AND
					staff_del_flg = 0;
		";

		$rtn = $this->db->fetchRow($sql, array());
		return $rtn;
	}

	public function returnNullZero($val) {
		if ( $val == null) {
			return "0";
		} else {
			return $val;
		}
	}

	/**
	 * 担当者情報の更新処理
	 * @param unknown_type $form
	 * @throws Exception
	 */
	public function updateStaffAccount($form, $userCondition) {
		$record = array('staff_email'					=> $form['staff_email'],
						'client_name'					=> $form['client_name'],
						'department'					=> $form['department'],
						'executive'						=> $form['executive'],
						'client_postcode1'				=> $form['client_postcode1'],
						'client_postcode2'				=> $form['client_postcode2'],
						'address'						=> $form['address'],
						'tel1'							=> $form['tel1'],
						'tel2'							=> $form['tel2'],
						'tel3'							=> $form['tel3'],
						'cell1'							=> $form['cell1'],
						'cell2'							=> $form['cell2'],
						'cell3'							=> $form['cell3'],
						'fax1'							=> $form['fax1'],
						'fax2'							=> $form['fax2'],
						'fax3'							=> $form['fax3'],
						'memo_template'					=> $form['memo_template'],
						'name_public_flg'				=> $this->returnNullZero($form['name_public_flg']),
						'meetin_id_public_flg'			=> $this->returnNullZero($form['meetin_id_public_flg']),
						'picture_public_flg'			=> $this->returnNullZero($form['picture_public_flg']),
						'namecard_public_flg'			=> $this->returnNullZero($form['namecard_public_flg']),
						'email_public_flg'				=> $this->returnNullZero($form['email_public_flg']),
						'client_name_public_flg'		=> $this->returnNullZero($form['client_name_public_flg']),
						'department_name_public_flg'	=> $this->returnNullZero($form['department_name_public_flg']),
						'executive_public_flg'			=> $this->returnNullZero($form['executive_public_flg']),
						'postcode_public_flg'			=> $this->returnNullZero($form['postcode_public_flg']),
						'address_public_flg'			=> $this->returnNullZero($form['address_public_flg']),
						'tel_public_flg'				=> $this->returnNullZero($form['tel_public_flg']),
						'cell_public_flg'				=> $this->returnNullZero($form['cell_public_flg']),
						'fax_public_flg'				=> $this->returnNullZero($form['fax_public_flg']),
						'facebook_public_flg'			=> $this->returnNullZero($form['facebook_public_flg']),
						'sns_public_flg'				=> $this->returnNullZero($form['sns_public_flg']),
						'free1_public_flg'				=> $this->returnNullZero($form['free1_public_flg']),
						'free2_public_flg'				=> $this->returnNullZero($form['free2_public_flg'])
						);

		if (!empty($form['staff_password'])) {
			$record['staff_password'] = md5($form['staff_password']);
		}

		if(file_exists("{$_SERVER['DOCUMENT_ROOT']}/img/profile/{$this->user['staff_type']}_{$this->user['staff_id']}.jpg")){
			$record['picture_flg'] = "1";
		} else {
			$record['picture_flg'] = "0";
		}

		$where = array(
			"staff_id = {$this->db->quote($userCondition['staff_id'])}",
			"staff_type  = {$this->db->quote($userCondition['staff_type'])}"
		);

		$this->db->update(self::TABLE_NAME, $record, $where);
	}

	/**
	 * 複数IDから一括でデータを取得する
	 * @param unknown $ids		カンマ区切りのID
	 * @param unknown $staffType	0:staff 1:teleworker
	 * @return NULL|unknown
	 */
	public function getStaffListByIds($ids, $staffType) {

		//$upLimit = ($page - 1) * $pagesize;
		$query = "select
					staff_id,
					AES_DECRYPT(staff_firstname,@key) AS staff_firstname,
					staff_password,
					staff_del_flg,
					client_name,
					AES_DECRYPT(staff_firstnamepy,@key) AS staff_firstnamepy,
					staff_comment,
					AES_DECRYPT(staff_lastname,@key) AS staff_lastname,
					staff_email,
					AES_DECRYPT(staff_lastnamepy,@key) AS staff_lastnamepy,
					AES_DECRYPT(staff_name,@key) AS staff_name,
					webphone_id,
					webphone_pass,
					webphone_ip,
					staff_role,
					delete_general_authority_flg,
					e_contract_authority_flg
				from
					master_staff_new
				where
					staff_id IN (".$ids.") and
					staff_del_flg=0 and
					teleworker_flg='".$staffType."'";

		$rtn = $this->db->fetchAll($query, array());

		$TotalRecord = count($rtn);

		if ($TotalRecord == 0) {
			return null;
		} else {
			return $rtn;
		}
	}

	/**
	 * 担当者種別と複数IDから一括でデータを取得する
	 * @param unknown $ids		カンマ区切りのID
	 * @param string $staffType	AA,CE,TAの担当者種別
	 * @return NULL|unknown
	 */
	public function getStaffListByIdsAndType($ids, $staffType) {

		$query = "select
					staff_id,
					AES_DECRYPT(staff_firstname,@key) AS staff_firstname,
					staff_password,
					staff_del_flg,
					client_name,
					AES_DECRYPT(staff_firstnamepy,@key) AS staff_firstnamepy,
					staff_comment,
					AES_DECRYPT(staff_lastname,@key) AS staff_lastname,
					staff_email,
					AES_DECRYPT(staff_lastnamepy,@key) AS staff_lastnamepy,
					AES_DECRYPT(staff_name,@key) AS staff_name,
					webphone_id,
					webphone_pass,
					webphone_ip,
					staff_role,
					delete_general_authority_flg,
					e_contract_authority_flg
				from
					master_staff_new
				where
					staff_type = '{$staffType}' and
					staff_id IN (".$ids.") and
					staff_del_flg=0";

		$rtn = $this->db->fetchAll($query, array());

		$TotalRecord = count($rtn);

		if ($TotalRecord == 0) {
			return null;
		} else {
			return $rtn;
		}
	}

	/**
	 * 条件を指定しアプローチリストに紐づいた担当者選択で必要な全件の一覧を取得する
	 * @param unknown $approachListIds	検索アプローチリストIDの配列
	 * @return unknown
	 */
	public function getRelatedApproachListMasterStaffAllList($approachListIds) {

		$sql = "SELECT
					a.staff_type,
					a.staff_id,
					AES_DECRYPT(a.staff_name,@key) as staff_name
				FROM
					master_staff_new as a
				INNER JOIN result_telephone as b ON
					(a.staff_type = b.create_staff_type AND a.staff_id = b.create_staff_id) OR
					(a.staff_type = b.update_staff_type AND a.staff_id = b.update_staff_id)
				INNER JOIN approach_list as c ON
	  				b.approach_list_id = c.id AND
	  				b.client_id = c.client_id
				WHERE
					a.staff_del_flg = 0 AND
					b.client_id = '{$this->user["client_id"]}' AND
					b.approach_list_id in (". implode(",", $approachListIds) .") AND
					b.del_flg = 0
				ORDER BY
					staff_id asc;
		";

		$rtn = $this->db->fetchAll($sql, array());
		return $rtn;
	}

	/**
	 * 条件に紐づいたバイト及び在宅スタッフの一覧を取得する
	 * @return unknown
	 */
	public function getWorkerStaffListByCondition($condition) {

		$sql = "
			SELECT
				staff_type,
				staff_id,
				AES_DECRYPT(staff_name,@key) as staff_name
			FROM
				master_staff_new
			WHERE
				staff_del_flg = 0
				{$condition}
			ORDER BY
				staff_id asc;
		";

		$rtn = $this->db->fetchAll($sql, array());
		return $rtn;
	}

	/**
	 * オートコール情報のみ登録する
	 * @param unknown $form
	 * @throws Exception
	 */
	public function registAutoCall($form) {
		$record = array(
				'auto_call' 			=> $form["auto_call"],
				'update_date' 			=> new Zend_Db_Expr('now()')
		);
		// 自サーバーに登録
		$this->db->update('master_staff_new', $record, " staff_type = '{$form['staff_type']}' AND staff_id = {$form['staff_id']} " );
	}
	/**
	 * アクティベーション情報を登録する
	 * @param unknown $form
	 * @param unknown $condition
	 * @throws Exception
	 */
	public function setActivationStaff($form, $condition) {
		$record = array(
			'staff_type' => $form["staff_type"],
			'staff_id' => $form["staff_id"],
			'activation_code' => $form["activation_code"],
			'temp_pw' => $form["temp_pw"],
			'update_date' => new Zend_Db_Expr('now()')
		);
		$sql = "SELECT
			COUNT(*) as staff_exists
		FROM
			activation_staff
		WHERE
			{$condition}
		";
		$rtn = $this->db->fetchRow($sql, array());
		if(empty($rtn["staff_exists"]) || $rtn["staff_exists"] == 0) {
			// insert
			$record["create_date"] = new Zend_Db_Expr('now()');
			$this->db->insert('activation_staff', $record);
			return true;
		}
		return false;
	}
	/**
	 * アクティベーション情報を取得する
	 * @param unknown $condition
	 * @throws Exception
	 */
	public function getActivateStaff($condition) {
		$sql = "SELECT
			id,
			staff_type,
			staff_id,
			activation_code,
			update_date,
			create_date
		FROM
			activation_staff
		WHERE
			{$condition}
		";
		$rtn = $this->db->fetchRow($sql, array());
		return $rtn;
	}
	/**
	 * アクティベーション情報のバリデーションチェックを行う
	 * @param unknown $data
	 * @throws Exception
	 */
	public function validateActivationStaff($data) {
		$validationDict = array(
			"temp_pw" => array(
				"name" =>"仮パスワード",
				"length" => 32,
				"validate" => array(1,4)
			),
			"password" => array(
				"name" =>"変更パスワード",
				"length" => 32,
				"validate" => array(1,4)
			),
			"confirm_password" => array(
				"name" =>"確認パスワード",
				"length" => 32,
				"validate" => array(1,4)
			),
		);
		$errorList = executionValidation($data, $validationDict);
		if(count($errorList) == 0) {
			if(strlen($data["password"]) < 8) {
				$errorList[] = '変更パスワードが8文字より小さいです';
			}
			if(strlen($data["confirm_password"]) < 8) {
				$errorList[] = '確認用パスワードが8文字より小さいです';
			}
			// 変更パスワードと確認パスワードが不一致
			if($data["password"] != $data["confirm_password"]) {
				$errorList[] = '変更パスワードと確認パスワードが一致しません';
			}
			if(!preg_match('/([A-Z]{2})0*([0-9]+)/', $data["id"], $match)) { // 入力値がAA + 数値
				$errorList[] = "ID形式が不正です";
			}
		}
		if(count($errorList) == 0) {
			// 仮パスワード一致
			$temp_pw = md5($data["temp_pw"]);
			$sql = "SELECT
				COUNT(*) as staff_exists
			FROM
				activation_staff
			WHERE
				staff_type = '{$match[1]}' AND staff_id = {$match[2]} AND temp_pw = '{$temp_pw}';
			";
			$rtn = $this->db->fetchRow($sql, array());
			if(empty($rtn["staff_exists"]) || $rtn["staff_exists"] == 0) {
				$errorList[] = "仮パスワードが一致しません";
			}
		}
		return $errorList;
	}
	/**
	 * アクティベーション処理を行う
	 * @param unknown $form
	 * @throws Exception
	 */
	public function activateStaff($form) {
		if(!preg_match('/([A-Z]{2})0*([0-9]+)/', $form["id"], $match)) { // 入力値がAA + 数値
			return array();
		}
		$record = array(
			'staff_password' => md5($form["password"])
		);
		$condition = " staff_type = '{$match[1]}' AND staff_id = {$match[2]} ";
		// アカウントのパスワードを更新
		$rtn = $this->db->update('master_staff_new', $record, $condition);
		// アクティベーションレコードを削除
		$rtn = $this->db->delete('activation_staff', $condition);
		// アカウント情報取得
		$rtn = $this->getMasterStaffRow($condition);
		return $rtn;
	}

	/**
	 * トライアルユーザー登録用
	 */
	public function registTrialUser($form) {
		$staffId = "0";
		// カラム名にセットしつつ、情報を補完する
		$record = array(
				'client_id' 					=> $this->returnNullZero($form["client_id"]),
				'staff_password'				=> md5($form["password"]),
				'staff_type'					=> "CE",
				'staff_id'						=> new Zend_Db_Expr('master_staff_new_increment(staff_type)'),
				'client_name' 					=> "",
				'staff_firstname' 				=> new Zend_Db_Expr("AES_ENCRYPT({$this->db->quote($form['last_name'])}, @key)"),
				'staff_lastname' 				=> new Zend_Db_Expr("AES_ENCRYPT({$this->db->quote($form['farst_name'])}, @key)"),
				'staff_name' 					=> new Zend_Db_Expr("AES_ENCRYPT({$this->db->quote("{$form['last_name']} {$form['farst_name']}")}, @key)"),
				'staff_email' 					=> $form["mail"],
				'staff_role'					=> 2,
				'login_flg' 					=> 1,
				'tel1' 							=> $form["tel_number_1"],
				'tel2' 							=> $form["tel_number_2"],
				'tel3' 							=> $form["tel_number_3"],
				'update_date' 					=> new Zend_Db_Expr('now()'),
				'create_date' 					=> new Zend_Db_Expr('now()'),
				// 下記暫定設定
				"staff_comment"					=> "",
				'meetin_number'					=> 0,
				'delete_general_authority_flg'  => 0,
				'e_contract_authority_flg' => 0
		);
		// 自サーバーに登録
		$this->db->insert('master_staff_new', $record);
		// 登録データを取得する
		$sql = "SELECT
					MAX(staff_id) as staff_id
				FROM
					master_staff_new
				WHERE
					staff_type		= 'CE' AND
					staff_name		= AES_ENCRYPT({$this->db->quote("{$form['last_name']} {$form['farst_name']}")}, @key);";
		$rtn = $this->db->fetchRow($sql, array());
		// staffIdを返す
		return $rtn['staff_id'];
	}

	/**
	 * 企業名と使用用途登録用に名刺情報を作成する
	 * @param unknown $form
	 * @return unknown
	 */
	public function registTrialUserNameCard($form) {
		// カラム名にセットしつつ、情報を補完する
		$record = array(
			'client_id'				=> $form["client_id"],
			'staff_type'			=> "CE",
			'staff_id'				=> $form["staff_id"],
			'staff_firstname' 		=> new Zend_Db_Expr("AES_ENCRYPT({$this->db->quote($form['last_name'])}, @key)"),
			'staff_lastname' 		=> new Zend_Db_Expr("AES_ENCRYPT({$this->db->quote($form['farst_name'])}, @key)"),
			'namecard_client_name' 	=> $form['company'],
			'namecard_email'		=> $form["mail"],
			'namecard_cate4_title'	=> "使用用途",
			'namecard_introduction'	=> $form["use"],
			'update_date' 			=> new Zend_Db_Expr('now()'),
			'create_date' 			=> new Zend_Db_Expr('now()'),
			// 以下NOT NULLでデフォルト値がないカラム
			'namecard_url'			=> "",
			'namecard_tel1'			=> $form["tel_number_1"],
			'namecard_tel2'			=> $form["tel_number_2"],
			'namecard_tel3'			=> $form["tel_number_3"],
			'namecard_cell1'		=> "",
			'namecard_cell2'		=> "",
			'namecard_cell3'		=> "",
			'namecard_fax1'			=> "",
			'namecard_fax2'			=> "",
			'namecard_fax3'			=> "",
			'namecard_facebook'		=> "",
			'namecard_sns'			=> "",
			'namecard_free1_name'	=> "",
			'namecard_free1_val'	=> "",
			'namecard_free2_name'	=> "",
			'namecard_free2_val'	=> "",
			'namecard_free3_name'	=> "",
			'namecard_free3_val'	=> "",
			'namecard_free4_name'	=> "",
			'namecard_free4_val'	=> "",
			'namecard_free5_name'	=> "",
			'namecard_free5_val'	=> "",
		);
		// 自サーバーに登録
		$this->db->insert('staff_client', $record);
	}

	/**
	 * メールアドレスを条件に件数を取得する
	 * @param unknown $mail
	 * @return unknown
	 */
	public function getMailCount($mail){
		$sql = "
			SELECT
				count(staff_email) as count
			FROM
				master_staff_new
			WHERE
				staff_email = '{$mail}' AND
				staff_del_flg = 0;
		";
		$rtn = $this->db->fetchRow($sql, array());
		return $rtn["count"];
	}

	/**
	 * メールアドレスを元にパスワードを変更する
	 * @param unknown $form
	 */
	public function updatePasswordByMail($form){
		$record = array(
				'staff_password' => md5($form["password"])
		);
		$condition = " staff_email = '{$form["mail"]}' AND staff_del_flg = 0 ";
		// アカウントのパスワードを更新
		$this->db->update('master_staff_new', $record, $condition);
	}

	/**
	 * クライアントに紐づく、アクティブな担当者数を取得する
	 * @param unknown $clientId
	 * @return unknown
	 */
	public function getActiveStaffCount($clientId){
		$sql = "
			SELECT
				count(staff_id) as count
			FROM
				master_staff_new
			WHERE
				client_id = {$clientId} AND
				staff_del_flg = 0;
		";
		$rtn = $this->db->fetchRow($sql, array());
		return $rtn["count"];
	}

	/**
	 * 最終入室日時の更新
	 */
	public function updateEnterRoomDate($staffType, $staffId) {
		$record = array(
			'enter_room_date' => new Zend_Db_Expr('now()')
		);
		$condition = "staff_type = '{$staffType}' AND staff_id = {$staffId}";
		$this->db->update('master_staff_new', $record, $condition);
	}

	/**
	 * PKからスタッフ情報を取得
	 */
	public function fetchStaffRow($staffType, $staffId) {
		$sql = "
			SELECT
				*
			FROM
				master_staff_new
			WHERE
				staff_type = :staff_type
				AND
				staff_id = :staff_id
		";

		return $this->db->fetchRow($sql, array("staff_type" => $staffType, "staff_id" => $staffId));
	}

	/**
	 * 最終ログイン日時の更新
	 */
	public function updateLoginDate($staffType, $staffId) {

	    $record = array(
	       'enter_login_date' => new Zend_Db_Expr('now()')
	    );
	    $condition = "staff_type = '{$staffType}' AND staff_id = {$staffId}";

	    $this->db->beginTransaction();
	    try{
	        $this->db->update('master_staff_new', $record, $condition);
	        $this->db->commit();
	    }catch(Exception $e){
	        $this->db->rollBack();
	        error_log($e->getMessage());
	    }
	}

	/**
	 * 背景合成情報を取得する
	 */
	public function getBodypixInfo($condition) {
		$sql = "SELECT
					bodypix_background_path,
					bodypix_internal_resolution,
					bodypix_segmentation_threshold,
					bodypix_mask_blur_amount
				FROM
					master_staff_new
				WHERE
					{$condition}
		";
		$rtn = $this->db->fetchRow($sql, array());
		return $rtn;
	}

	/**
	 * 背景合成情報を取得する
	 */
	public function updateBodypixInfo($form) {
		$record = array(
			'bodypix_background_path'			=> $form['bodypix_background_path'],
			'bodypix_internal_resolution'		=> $form['bodypix_internal_resolution'],
			'bodypix_segmentation_threshold'	=> $form['bodypix_segmentation_threshold'],
			'bodypix_mask_blur_amount'			=> $form['bodypix_mask_blur_amount'],
		);
		$staffId = $form['staff_id'];
		$staffType  = $form['staff_type'];

		$condition = "staff_type = '{$staffType}' AND staff_id = {$staffId}";

		$this->db->beginTransaction();
		try{
			$this->db->update('master_staff_new', $record, $condition);
			$this->db->commit();
		}catch(Exception $e){
			$this->db->rollBack();
			error_log($e->getMessage());
		}
	}

	/**
	 * 該当のスタッフのみを取得
	 */
	public function getRoomAuthor($condition) {
		$sql = "SELECT
					staff_type,
					staff_id,
					AES_DECRYPT(staff_name,@key) as staff_name
				FROM
					master_staff_new
				WHERE
					{$condition}
		";
		$rtn = $this->db->fetchAll($sql);
		return $rtn;
	}

	/**
	 * 選択されたユーザーのID,typeを取得
	 * @param unknown $condition
	 * @return unknown
	 */
	public function getUniqueStaffIdentification($condition){
		$sql = "
			SELECT 
				staff_type,
				staff_id
			FROM
				master_staff_new
			WHERE
				{$condition}
		";
		$rtn = $this->db->fetchAll($sql);
		return $rtn;
	}
}
