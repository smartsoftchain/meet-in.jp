<?php

require_once ROOT.'library/Application/validation.php';

/**
 * 担当者情報設定入力コントローラーで使用するモデル
 * @author admin
 *
 */
class SettingUserInfoModel extends AbstractModel{

	const EQAUL_TA     = 1;		// TELワーカーフラグ：ON
	const NOT_EQAUL_TA = 0;		// TELワーカーフラグ：OFF

	private $db;							// DBコネクション
	private $validationErrors = array();  	// バリデーションエラー格納先

	// バリデーション定義
	private $validationDict = array(
		"staff_password" => array("name" =>"パスワード", 	 "length" => 8,  "validate" => array(4)),
		"staff_email" 	 => array("name" =>"メールアドレス", "length" => 50, "validate" => array(1,7))
	);

	// バリデーション定義
	private $mtaSettingValidationDict = array(
		"sender_address"     => array("name" => "送信者メールアドレス", "length" => 80,  "validate" => array(1,7)),
		"sender_smtp_server" => array("name" => "SMTPサーバ",           "length" => 40,  "validate" => array(14)),
		"sender_smtp_port"   => array("name" => "SMTPポート",           "length" => 10,  "validate" => array(2)),
		"ehlo_user" 	     => array("name" => "SMTPユーザ名",         "length" => 40,  "validate" => array(14)),
		"ehlo_password"      => array("name" => "SMTPパスワード",       "length" => 20,  "validate" => array(14)),
		"dsn_server"         => array("name" => "POPサーバ",            "length" => 40,  "validate" => array(14)),
		"dsn_port" 	         => array("name" => "POPポート",            "length" => 10,  "validate" => array(2)),
		"dsn_user" 	         => array("name" => "POPユーザ名",          "length" => 40,  "validate" => array(14)),
		"dsn_password" 	     => array("name" => "POPパスワード",        "length" => 20,  "validate" => array(14)),
		"note"               => array("name" => "備考",                 "length" => 200, "validate" => array())
	);

	function __construct($db){
		$this->db = $db;

		parent::init();
	}

	/**
	 * 担当者情報設定入力の編集に必要なデータを取得する
	 * @param unknown $form
	 * @param unknown $screenSession
	 */
	function getStaffInfo() {

		$user  = $this->user;
		$staff = null;

		$masterStaffDao = Application_CommonUtil::getInstance("dao", "MasterStaffDao", $this->db);
		//$staff = $daoMasterStaff->getLoginStaffRow($user['staff_type'], $user["staff_id"]);

		$StaffId   = $this->escape($user["staff_id"]);
		$staffType = $this->escape($user["staff_type"]);
		$condition = " staff_type = '{$staffType}' AND staff_id = '{$StaffId}' ";

		$staff = $masterStaffDao->getMasterStaffRow($condition);

    	return $staff;
	}

	/**
	 * スタッフ情報を更新
	 */
	function updateStaffAccount($form) {

		$updateAccount = array();
		$masterStaffDto = Application_CommonUtil::getInstance("dao", "MasterStaffDao", $this->db);
		$mtaSettingDto  = Application_CommonUtil::getInstance("dao", "MtaSettingDao", $this->db);
		
		$mailModel = Application_CommonUtil::getInstance("model", "MailModel", $this->db);

		$updateAccount["staff_id"] = $this->user['staff_id'];
		if($form["staff_password"] != ""){
			$updateAccount['staff_password'] = $form["staff_password"];
		}
		$updateAccount['staff_email'] = $form["staff_email"];

		// トランザクション開始
		$this->db->beginTransaction();

		try {

			// スタッフ情報の更新
//			$masterStaffDto->updateStaffAccount($updateAccount, $this->user);
			$masterStaffDto->updateStaffAccount($form, $this->user);

			if(!is_null($this->user["client_id"])){
				// 関連するMTA設定を一度全て削除する。（物理削除）
				$mtaSettingDto->deleteAll($this->user);
	
				// MTA設定を設定する。
				if (!empty($form["mta_setting"])) {
					$mtaSettingDto->regist($form["mta_setting"], $this->user);
				}
			}
			// メール送信
			$mailModel->sendUpdateUserInfoMail($updateAccount);

		} catch (Exception $e) {
			$this->db->rollBack();
			throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
		}

		$this->db->commit();
	}

	/**
	 * MTA設定リストを取得する
	 * @return unknown
	 */
	function getMtaSettingList() {

		$user  = $this->user;
		$staff = null;

		$mtaSettingDao = Application_CommonUtil::getInstance("dao", "MtaSettingDao", $this->db);
		$mtaSettingList = $mtaSettingDao->getMtaSettingList($user);

		return $mtaSettingList;
	}

	/**
	 * ファイルアップロード時に入力したデータのバリデーションを行う
	 * @param unknown $data
	 */
	public function validate($form) {

		$userInfoErrorList   = executionValidation($form, $this->validationDict);
		$mtbSettingErrorList = array();

		// MTA設定が存在する場合のみバリデートチェック
		if (!empty($form["mta_setting"])) {
			$mtbSettingErrorList = $this->mtaSettingValidate($form["mta_setting"]);
		}

		$errorList = array_merge($userInfoErrorList, $mtbSettingErrorList);

		if (0 < count($errorList)) {
			$this->validationErrors = $errorList;
			return false;
		}

		return true;
	}

	/**
	 * MTA設定のバリデーション
	 * @param unknown $mta_settings
	 * @return multitype:
	 */
	private function mtaSettingValidate($mta_settings) {
		// DAOの宣言
		$mtaSettingDto  = Application_CommonUtil::getInstance("dao", "MtaSettingDao", $this->db);
		
		$errorList = array();

		foreach ($mta_settings as $setting) {
			$tmpErrorList = executionValidation($setting, $this->mtaSettingValidationDict);
		 	$errorList = array_merge($errorList, $tmpErrorList);
		 	// PKで検索し同じ情報が存在しないかチェックする
		 	$staffKey = "{$this->user["staff_type"]}{$this->user["staff_id"]}";
		 	$condition = " a.client_id = {$this->user["client_id"]} AND a.sender_address = '{$setting["sender_address"]}' AND CONCAT(a.staff_type, a.staff_id) <> '{$staffKey}' ";
		 	$mtaSetting = $mtaSettingDto->getValidateMtaSetting($condition);
		 	if($mtaSetting){
		 		$errorList[] = array("sender_address"=>"{$mtaSetting["staff_name"]}さんが既に{$setting["sender_address"]}を登録済みです");
		 	}
		}
		return $errorList;
	}

	/**
	 * バリデーションのエラーを返す
	 * @return multitype:
	 */
	public function getValidationErrors() {

		if (0 < count($this->validationErrors)) {
			return $this->validationErrors;
		}

		// エラーがない場合は空配列を返す。
		return array();
	}
}