<?php

/**
 * ClientStaffDao クラス
 *
 * 担当者を扱うDaoクラス
 *
 * @version
 * @package Dao
*/
class MasterClientStaffDao extends AbstractDao {
	const STAFF_ROLE_1 	= "管理者";
	const STAFF_ROLE_2 	= "社員";
	const STAFF_ROLE_3 	= "バイト";
	const AUTO_CALL_0	= "無し";
	const AUTO_CALL_1	= "有り";
	const LOGIN_0		= "不可";
	const LOGIN_1		= "可能";
	const DEFAULT_PAGE  	= "1";	//初期ページデフォルト
	const DEFAULT_PAGE_SIZE = "20";	//初期行数
	private $db;
	function __construct($db){
		$this->db = $db;
	}

	/**
	 * 担当者一覧を取得する
	 * @param unknown $clientId
	 * @return unknown
	 */
	public function getClientStaffList($clientId,  $pageSize, $page,  $order,  $ordertype) {
		//表示件数の指定がなければ10とする
		if($pageSize==""){
			$pageSize=self::DEFAULT_PAGE_SIZE;
		}
		//並べ替えの場合
		if(!$order==""){
			$oderBy = "ORDER BY ". $order." ". $ordertype ;
		}
		//抽出開始行を指定
		$lineNo = $pageSize * $page - $pageSize;

		$query = "select
					client_id,
					staff_id,
					staff_type,
					concat(staff_type,RIGHT(concat('00000',staff_id),5)) as account_id,
					AES_DECRYPT(staff_name,@key) as staff_name,
					concat(AES_DECRYPT(staff_firstnamepy,@key), ' ' , AES_DECRYPT(staff_lastnamepy,@key)) as staff_namepy,
					staff_email,
				 	CASE 	WHEN staff_role = 1 THEN '".self::STAFF_ROLE_1."'
							WHEN staff_role = 2 THEN '".self::STAFF_ROLE_2."'
							WHEN staff_role = 3 THEN '".self::STAFF_ROLE_3."'
					ELSE NULL END staff_role_title,
				 	CASE 	WHEN LENGTH(webphone_id)*LENGTH(webphone_ip)*LENGTH(webphone_pass)  = 0 	THEN '".self::AUTO_CALL_0."'
							WHEN LENGTH(webphone_id)*LENGTH(webphone_ip)*LENGTH(webphone_pass) <=> NULL THEN '".self::AUTO_CALL_0."'
							WHEN LENGTH(webphone_id)*LENGTH(webphone_ip)*LENGTH(webphone_pass) <> 0 	THEN '".self::AUTO_CALL_1."'
					ELSE NULL END auto_call_title,
				 	CASE 	WHEN login_flg = 0 THEN '".self::LOGIN_0."'
							WHEN login_flg = 1 THEN '".self::LOGIN_1."'
					ELSE NULL END login_flg_title,
					webphone_id,
					login_flg
				from
					master_staff_new
				where
					client_id = '".$clientId."' AND
					staff_del_flg = '0'
				$oderBy
				LIMIT ".$lineNo." , ".$pageSize."
				";

		$rtn = $this->db->fetchAll($query, array());

		return $rtn;
	}


	/**
	 * 担当者一覧の件数を取得する
	 * @param unknown $clientId
	 * @return unknown
	 */
	public function getClientStaffListCount($clientId) {

		$selector = $this->db->select()->from("master_staff_new")
		->where("client_id = :client_id")
		->where("staff_del_flg = '0'")
		->order("create_date");

		$query = "select
					COUNT(client_id) as count
				from
					master_staff_new
				where
					client_id = '".$clientId."' AND
					staff_del_flg = '0'
				";

		$rtn = $this->db->fetchRow($query, array());
		return $rtn;
	}

	/**
	 * 担当者情報を取得する
	 * @param unknown $clientId
	 * @return unknown
	 */
	public function getClientStaff( $client_id , $staff_type ,$staff_id) {

		$query = "select
					client_id,
					staff_id,
					staff_type,
					concat(staff_type,RIGHT(concat('00000',staff_id),5)) as account_id,
					AES_DECRYPT(staff_firstname,@key) as staff_firstname ,
					AES_DECRYPT(staff_lastname,@key) as staff_lastname,
					AES_DECRYPT(staff_firstnamepy,@key) as staff_firstnamepy,
					AES_DECRYPT(staff_lastnamepy,@key) as staff_lastnamepy,
					staff_email,
					staff_role,
					auto_call,
					login_flg,

					client_postcode1,
					client_postcode2,
					address,
					tel1,
					tel2,
					tel3,
					fax1,
					fax2,
					fax3,

					gaccount,
					AES_DECRYPT(gaccount_pass,@key) as gaccount_pass,
					login_flg,
					telephone_hour_price, 
					telephone_one_price, 
					maildm_hour_price, 
					maildm_one_price, 
					inquiry_hour_price, 
					inquiry_one_price, 
					staff_payment_type
				from
					master_staff_new
				where
					client_id 		= '".$client_id."' AND
					staff_type		= '".$staff_type."' AND
					staff_id 		= '".$staff_id."'
				";

		$rtn = $this->db->fetchRow($query, array());

		return $rtn;
	}

	/**
	 * 登録
	 * @param unknown $data
	 * @param unknown $aliveIds
	 * @return unknown
	 */
	public function setRegist($data, $user) {
		//idが存在しない場合、新規登録
		if($data["staff_id"]==""){
			$record = array(
						'staff_name'     		=> new Zend_Db_Expr("AES_ENCRYPT('$data[staff_name]'	, @key)"),
						'staff_firstname' 		=> new Zend_Db_Expr("AES_ENCRYPT('$data[staff_firstname]'	, @key)"),
						'staff_lastname' 		=> new Zend_Db_Expr("AES_ENCRYPT('$data[staff_lastname]'	, @key)"),
						'staff_firstnamepy' 	=> new Zend_Db_Expr("AES_ENCRYPT('$data[staff_firstnamepy]'	, @key)"),
						'staff_lastnamepy' 		=> new Zend_Db_Expr("AES_ENCRYPT('$data[staff_lastnamepy]'	, @key)"),
						'gaccount_pass' 		=> new Zend_Db_Expr("AES_ENCRYPT('$data[gaccount_pass]'	, @key)"),
						'staff_type' 			=> "CE",
						'staff_comment'			=> "",
						'client_id' 			=> $user["client_id"],
						'staff_id' 				=> new Zend_Db_Expr( 'master_staff_new_increment(staff_type)'),
						'staff_email' 			=> $data["staff_email"],

						'client_postcode1' 		=> $data["client_postcode1"],
						'client_postcode2' 		=> $data["client_postcode2"],
						'address' 				=> $data["address"],
						'tel1' 					=> $data["tel1"],
						'tel2' 					=> $data["tel2"],
						'tel3' 					=> $data["tel3"],
						'fax1' 					=> $data["fax1"],
						'fax2' 					=> $data["fax2"],
						'fax3' 					=> $data["fax3"],
/*
						'gaccount' 				=> "0",
						'staff_payment_type'	=> "0",
						'telephone_hour_price' 	=> "0",
						'telephone_one_price' 	=> "0",
						'maildm_hour_price' 	=> "0",
						'maildm_one_price' 		=> "0",
						'inquiry_hour_price' 	=> "0",
						'inquiry_one_price' 	=> "0",
						'staff_role' 			=> "0",
						'login_flg' 			=> "0",
*/
						'create_date' 			=> new Zend_Db_Expr('now()'),
						'update_date' 			=> new Zend_Db_Expr('now()')
						);
			//ランダムパスワードを生成しmd5変換後に登録
			$len = 8; // 生成するパスワードの桁数
			$genPassword =substr(str_shuffle('1234567890abcdefghijklmnopqrstuvwxyz'), 0, $len);
			$record["staff_password"] = md5($genPassword);


			$this->db->insert('master_staff_new', $record);
		}else{
			//編集の場合
			// Tabeleのフィールドがblob型のもの
			$record = array(
					'staff_name' 			=> new Zend_Db_Expr("AES_ENCRYPT('$data[staff_name]'	, @key)"),
					'staff_firstname' 		=> new Zend_Db_Expr("AES_ENCRYPT('$data[staff_firstname]'	, @key)"),
					'staff_lastname' 		=> new Zend_Db_Expr("AES_ENCRYPT('$data[staff_lastname]'	, @key)"),
					'staff_firstnamepy' 	=> new Zend_Db_Expr("AES_ENCRYPT('$data[staff_firstnamepy]'	, @key)"),
					'staff_lastnamepy' 		=> new Zend_Db_Expr("AES_ENCRYPT('$data[staff_lastnamepy]'	, @key)"),
					'gaccount_pass' 		=> new Zend_Db_Expr("AES_ENCRYPT('$data[gaccount_pass]'	, @key)"),

					'staff_email' 			=> $data["staff_email"],
					'client_postcode1' 		=> $data["client_postcode1"],
					'client_postcode2' 		=> $data["client_postcode2"],
					'address' 				=> $data["address"],
					'tel1' 					=> $data["tel1"],
					'tel2' 					=> $data["tel2"],
					'tel3' 					=> $data["tel3"],
					'fax1' 					=> $data["fax1"],
					'fax2' 					=> $data["fax2"],
					'fax3' 					=> $data["fax3"],
/*					
					'gaccount' 				=> $data["gaccount"],
					'staff_payment_type'	=> $data["staff_payment_type"],
					'telephone_hour_price' 	=> $data["telephone_hour_price"],
					'telephone_one_price' 	=> $data["telephone_one_price"],
					'maildm_hour_price' 	=> $data["maildm_hour_price"],
					'maildm_one_price' 		=> $data["maildm_one_price"],
					'inquiry_hour_price' 	=> $data["inquiry_hour_price"],
					'inquiry_one_price' 	=> $data["inquiry_one_price"],
					'staff_role' 			=> $data["staff_role"],
					'login_flg' 			=> $data["login_flg"],
*/
					'update_date' 			=> new Zend_Db_Expr('now()')
					);
			//パスワードがあればmd5変換後に登録
			if( !$data["staff_password"] == ""){
				$record["staff_password"] = md5($data["staff_password"]);
			}
			// アップデート実行
			$this->db->update('master_staff_new', $record ,"staff_id 	= {$data['staff_id']} AND staff_type = '{$data['staff_type']}' " );
		}
	}

	/**
	 * 削除
	 * @param unknown $data
	 * @param unknown $aliveIds
	 * @return unknown
	 */
	public function delete($staff_type,  $staff_id) {

		$record["staff_del_flg"]		= "1";
		$record["update_date"]		= new Zend_Db_Expr('now()');

		// アップデート実行
		$this->db->update('master_staff_new', $record ,"staff_id 	= $staff_id 	AND
															staff_type 	= '$staff_type' " );
	}
}
