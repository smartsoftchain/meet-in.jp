<?php

require_once ROOT.'library/Application/validation.php';

/**
 * 担当者情報設定入力コントローラーで使用するモデル
 * @author admin
 *
 */
class SettingProfileModel extends AbstractModel{

	// TELワーカーフラグ
	const EQAUL_TA     = 1;		// TELワーカーフラグ：ON
	const NOT_EQAUL_TA = 0;		// TELワーカーフラグ：OFF

	// アカウント権限種類
	const ROLE_ADM = 1; 		// 管理者
	const ROLE_EMP = 2; 		// 社員
	const ROLE_PRT = 3; 		// アルバイト

	const IDENTIFIER = "setting_profile";		// セッション変数のnamespace

	private $db;							// DBコネクション
	private $validationErrors = array();  	// バリデーションエラー格納先

	// クライアント編集画面の入力検証ルール
	private $formParamsValidationDict = array(
			'client_name'				=> array("name" => "組織名称",			"length" => 64,	"validate" => array(1)),
			'client_namepy'				=> array("name" => "組織名称フリガナ",		"length" => 64,	"validate" => array(1)),
			'client_postcode1'			=> array("name" => "郵便番号(左）", 		"length" => 3,	"validate" => array(1, 2)),
			'client_postcode2'			=> array("name" => "郵便番号(右）", 		"length" => 4,	"validate" => array(1, 2)),
			'client_address'			=> array("name" => "住所", 				"length" => 64,	"validate" => array(1)),
			'client_tel1'				=> array("name" => "電話番号(市外局番)", 	"length" => 5,	"validate" => array(11)),
			'client_tel2'				=> array("name" => "電話番号(市内局番)", 	"length" => 5,	"validate" => array(11)),
			'client_tel3'				=> array("name" => "電話番号（加入者番号）",	"length" => 5,	"validate" => array(11)),
			'client_fax1'				=> array("name" => "FAX番号(市外局番)", 	"length" => 5,	"validate" => array(11)),
			'client_fax2'				=> array("name" => "FAX番号(市内局番)", 	"length" => 5,	"validate" => array(11)),
			'client_fax3'				=> array("name" => "FAX番号（加入者番号）", "length" => 5,	"validate" => array(11)),
			'client_staffleadername'	=> array("name" => "代表者名", 			"length" => 32,	"validate" => array(1)),
			'client_staffleadernamepy'	=> array("name" => "代表者フリガナ",		"length" => 32,	"validate" => array()),
			'client_staffleaderemail'	=> array("name" => "代表者メールアドレス",	"length" => 50,	"validate" => array(1, 7)),
			'client_homepage'			=> array("name" => "HP",				"length" => 64,	"validate" => array()),
			'client_comment'			=> array("name" => "備考・メモ", 			"length" => 200,"validate" => array()),
	);
	

	// サービス名の入力検証ルール
	private $serviceValidationDict = array(
		'service_name'             => array("name" => "サービス/商品名",      "length" => 256 , "validate" => array(1))
	);

	// メールアドレスCCの入力検証ルール
	private $ccMailValidationDict = array(
		'address' => array("name" => "メールアドレスCC",     "length" => 64 ,  "validate" => array(1,7))
	);

	function __construct($db){
		$this->db = $db;

		parent::init();
	}

	/**
	 * クライアント情報を取得
	 * @param unknown $client_field
	 * @param unknown $client_value
	 * @return NULL|unknown
	 */
	public function getClientInfo($client_id) {

		$client   = Application_CommonUtil::getInstance("dao", "MasterClientDao", $this->db);
		$clientCC = Application_CommonUtil::getInstance("dao", "MasterClientCCDao", $this->db);

		// クライアント情報
		$clientInfo = $client->getMasterClientRow($client_id);

		// セッション変数にクライアント情報を詰める
		$session = Application_CommonUtil::getSession(self::IDENTIFIER);
		$session->client = $clientInfo;

		// クライアントに紐づくCCメールアドレス一覧を取得
		$clientInfo['cc_list'] = $clientCC->getClientCCList();

		return $clientInfo;
	}

	/**
	 * 現在のログイン情報からCCを編集できるかを返す。
	 * @return boolean
	 */
	public function canEditCC() {

		$user = $this->user;
		$editable_cc_list = false;

		if($user['staff_type'] == "AA" || $user['staff_type'] == "CE"){

			$role = substr($user['staff_role'],-1);

			// CC編集はAA/CEの管理者、一般社員のみ編集を許可する
			if($role == self::ROLE_ADM || $role == self::ROLE_EMP){
				$editable_cc_list = true;
			}
		}

		return $editable_cc_list;
	}


	/**
	 * client_idを元にプロジェクトとの紐づきと共にサービス/商品名を取得する
	 * プロジェクトと紐づけるのは、既にプロジェクトに紐づいているサービス/商品名は削除できないようにしたいため。
	 * @param unknown $client_id
	 * @return unknown
	 */
	public function getProjectServiceList($client_id) {

		$clientServiceDao = Application_CommonUtil::getInstance("dao", "MasterClientServiceDao", $this->db);
		$serviceList = $clientServiceDao->getProjectServiceList($client_id);
		
		$session = Application_CommonUtil::getSession(self::IDENTIFIER);
		$session->aliveService = $serviceList;

		return $serviceList;
	}

	/**
	 * client_idに紐づく業種名を取得する。
	 */
	public function getCategoryList($clientId, $form = array()) {

		$clientCategoryDao = Application_CommonUtil::getInstance("dao", "MasterClientCategoryDao", $this->db);

		// クライアントに紐づく業種を取得。クライアントは複数の業種（業種１・業種２・業種３）に紐づいていることがある。
		$staffAndCategoryList = $clientCategoryDao->getClientAndCategory($clientId);

		for ($i = 0, $len = count($staffAndCategoryList); $i < $len; $i++) {

			$categoryList[] = array(
				"category1_name" => $staffAndCategoryList[$i]["category1_name"],
				"category2_name" => $staffAndCategoryList[$i]["category2_name"],
				"category3_name" => $staffAndCategoryList[$i]["category3_name"],
			);
		}

		return $categoryList;
	}

	/**
	 * 送信されたform要素を元に、違う要素組み立てる。
	 * @param unknown $form
	 * @return unknown
	 */
	public function buildFormParams($form) {

		// 検証に必要なプロパティを用意
		//$form['client_tel']               = $form['client_tel1'] . $form['client_tel2']. $form['client_tel3'];
		//$form['client_fax']               = $form['client_fax1'] . $form['client_fax2']. $form['client_fax3'];
		$form['client_staffleadername']   = $form['client_staffleaderfirstname'] . $form['client_staffleaderlastname'];
		$form['client_staffleadernamepy'] = $form['client_staffleaderfirstnamepy'] . $form['client_staffleaderlastnamepy'];

		return $form;
	}

	/**
	 * 入力したデータと条件をもとにバリデーションを行う
	 * @param unknown $form
	 * @param unknown $validationDict
	 * @return boolean
	 */
	public function validate($form, $cc_list) {

		// // 入力内容の検証
		$errorList = executionValidation($form, $this->formParamsValidationDict);
		
		$serviceErrMsgList = $this->validateService($form);		// サービス名/商品名の検証
		$ccMailErrMsgList  = $this->validateCCList($cc_list);	// CCリスト各要素に対しての検証
		
		$errMsgList = array_merge($errorList, $serviceErrMsgList, $ccMailErrMsgList);
		
		return $errMsgList;
	}

	/**
	 * サービス/商品名のバリデート処理のファサード関数
	 * @param unknown $form
	 * @return Ambigous <string, multitype:, unknown>
	 */
	private function validateService($form) {

		// サービスのチェックを行う
		$serviceCount = 0;
		$errMsgList  = array();

		if(array_key_exists("new_service_name", $form)){
			$errMsgList = $this->_coreValidateService($form["new_service_name"], $errMsgList);
			$serviceCount += count($form["new_service_name"]);
		}

		if(array_key_exists("alive_service_name", $form)){
			$errMsgList = $this->_coreValidateService($form["alive_service_name"], $errMsgList);
			$serviceCount += count($form["alive_service_name"]);
		}

		if(array_key_exists("del_service", $form)){
			if(count($form["del_service"]) >= $serviceCount){
				$errMsgList[] = "サービス/商品名は最低一つ必要です。";
			}
		}

		return $errMsgList;
	}

	/**
	 * サービス/商品名のバリデート処理
	 * @param unknown $form
	 * @param unknown $errors
	 * @return array
	 *
	 */
	private function _coreValidateService($serviceList, $errors) {

		foreach($serviceList as $serviceName){

			$errorList = executionValidation(array("service_name" => $serviceName), $this->serviceValidationDict);

			if (0 < count($errorList)) {
				return array_merge($errors, $errorList);
			}
		}

		return $errors;
	}
	/**
	 * メールCC先バリデーション
	 * @param unknown $cc_list
	 * @return Ambigous <string, multitype:, unknown>
	 */
	public function validateCCList($cc_list) {

		$errMsgList  = array();

		foreach($cc_list as $cc){

			$errorList = executionValidation($cc, $this->ccMailValidationDict);

			if (0 < count($errorList)) {
				return array_merge($errMsgList, $errorList);
			}
		}

		return $errMsgList;
	}

	/**
	 * メールCCの各行を取り出す。
	 */
	public function getCC($form){

		$rows = array();

		// 登録済みメールアドレス
		if (!empty($form['cc'])) {

			$size = count($form['cc']);
			$keys = array_keys($form['cc']);

			for($i=0; $i<$size; $i++){
				$row = array();

				$key = $keys[$i];

				$row['id']   = $key;
				$row['address'] = $form['cc'][$key];
				$row['status']  = 'update';

				$rows[] = $row;
			}
		}

		// 新規追加メールアドレス
		if (!empty($form['append_cc'])) {

			$size = count($form['append_cc']);

			for($i=0; $i<$size; $i++){

				$row = array();
				$row['id']   = null;
				$row['address'] = $form['append_cc'][$i];
				$row['status']  = 'insert';

				$rows[] = $row;
			}
		}

		return $rows;
	}
	
	/**
	 * エラー時に画面にPOST状態前の状態を再現するために必要なデータを作成する
	 * @param unknown $form
	 * @return multitype:Ambigous <multitype:, unknown> multitype:multitype:unknown
	 */
	public function restoreSelectForm($form, $preAliveServiceList) {
	
		$aliveServiceList = array();	// 既に登録済みの「サービス/商品名」
		$newServiceList   = array();	// 新規追加された「サービス/商品名」
		$delServiceList   = array();	// 削除チェックされている「サービス/商品名」
	
		if(array_key_exists("alive_service_name", $form)){
			
			$tmpAliveServiceList = array();
			foreach($form["alive_service_name"] as $aliveServiceId => $aliveServiceName){
				$tmpAliveServiceList[$aliveServiceId] = $aliveServiceName;
			}
			
			// 変更前の「サービス名」リストに上書き、$formで送信された内容を上書きする。「サービス/商品名」が変更されたことを考慮して名前だけ上書きする。
			foreach ($preAliveServiceList as $preAliveService) {

				$aliveServiceList[] = array(
					"id"              =>  $preAliveService["id"],
					"service_name"     => $tmpAliveServiceList[$preAliveService["id"]],
					"project_relation" => $preAliveService["project_relation"]
				);
			}
		}
			
		if(array_key_exists("new_service_name", $form)){
			$newServiceList = $form["new_service_name"];
		}
	
		if(array_key_exists("del_service", $form)){
			$delServiceList = $form["del_service"];
		}
	
		return array(
			"aliveServiceList" => $aliveServiceList,
			"newServiceList"   => $newServiceList,
			"delServiceList"   => $delServiceList
		);
	}
	
	/**
	 * 登録処理
	 * @param unknown $form
	 * @param unknown $cc_list
	 * @throws Exception
	 */
	public function regist($form, $cc_list) {
		
		$session = Application_CommonUtil::getSession(self::IDENTIFIER);
		
		$user = $this->user;
//		$form["client_id"] = $user["client_id"];
		
		$this->db->beginTransaction();
		
		try{
			// クライアント情報更新
			$this->registClient($form);
/*			
			// サービス/商品名の更新処理
			$this->registService($form, $session->aliveService);
			
			// CCメールアドレスの更新処理
			$this->registCCMailList($user["client_id"], $cc_list);
			
			// 現在登録済みのデータを取得(クライアントに紐づくCCメールアドレス一覧を取得)
			$client = $this->getClientInfo($user["client_id"]);
			
			// 担当者名を取得(メール用)
			if (!is_null($client["aa_staff_id_list"]) && $client["aa_staff_id_list"] != "") {
				$this->sendRegistClientMail($user["client_id"], $form, $client);
			}
*/			
			$this->db->commit();
		
		} catch (Exception $e) {
			$this->db->rollBack();
			throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
		}
		
		// 登録クライアント名とセッションに保持しているクライアント名に差異があれば、セッションを書き換える
		if($form["client_name"] != $user["client_name"]){
			$this->user['client_name'] = $form['client_name'];
			Zend_Auth::getInstance()->getStorage()->write($this->user);
		}
	}

	/**
	 * クライアント情報を登録する
	 * @param unknown $form
	 */
	public function registClient($form) {
		
		$client = Application_CommonUtil::getInstance("dao", "MasterClientDao", $this->db);

		// セッションを取得する。
		$session = Application_CommonUtil::getSession(self::IDENTIFIER);

		// 既存のデータを上書きする。
		$form = array_merge($session->client, $form);

		$client->setMasterClient($form);
	}

	/**
	 * クライアントに紐づくサービスを登録する
	 * @param unknown $form
	 * @param unknown $aliveServices
	 */
	public function registService($form, $aliveServices) {

		$masterClientServiceDao = Application_CommonUtil::getInstance("dao", "MasterClientServiceDao", $this->db);

		// サービス/商品名の登録処理(新規登録)
		if (array_key_exists("new_service_name", $form)) {
			//nameが"new_service_name"配列は、新規に生成されたテキストフォーム
			foreach ($form["new_service_name"] as $serviceName) {
				$record = array();
				$record["service_name"] = $serviceName;
				$masterClientServiceDao->registService($record);
			}
		}

		// サービス/商品名の登録処理(更新)
		if (array_key_exists("alive_service_name", $form)) {
			foreach ($form["alive_service_name"] as $keyId => $serviceName) {
				$record = array();
				$record["id"] 			= $keyId;
				$record["service_name"] = $serviceName;
				$masterClientServiceDao->registService($record);
			}
		}

		// サービス/商品名の削除処理。既存に登録されているサービス且つ現在アプローチで使用されていないサービスが削除対象
		if (array_key_exists("del_service", $form)) {

			foreach ($aliveServices as $aliveService) {

				if (array_key_exists($aliveService["id"], $form["del_service"]) && $aliveService["project_relation"] == "0") {

					$delete_id = $aliveService["id"];
					$masterClientServiceDao->deleteService($delete_id);
				}
			}
		}
	}

	/**
	 * クライアントに紐づくCCメールアドレスを登録する
	 * @param unknown $clientId
	 * @param unknown $cc_list
	 */
	public function registCCMailList($clientId, $cc_list) {

		$clientCCDao = Application_CommonUtil::getInstance("dao", "MasterClientCCDao", $this->db);

		// 現在登録済みのデータを取得
		$client = $this->getClientInfo($clientId);
		$org_list = $client['cc_list'];

		// 登録されたデータにあってパラメータにないものは削除とみなす
		foreach ($org_list as $org){
			
			$tmp_id = null;
			
			//送られてきたデータ
			foreach ($cc_list as $cc){

				if($org['id'] == $cc['id']){
					$tmp_id = $cc['id'];
				}
			}
			
			//既存データのなかで送られたデータに存在しないもの
			if (is_null($tmp_id) && !is_null($org['id'])) {

				$cc_list[] = array(
					'id'      => $org['id'],
					'address' => $org['address'],
					'status'  => 'delete'
				);
			}
		}

		// CCデータがあれば、登録/更新/削除処理を行う
		if (0 < count($cc_list)) {

			$clientCCDao->registAllCC($cc_list);

			// クライアントに紐づくプロジェクトで設定しているメールCCも変更する。
			//$this->updateAllProjectsMailNotifySetting($clientId, $cc_list);
		}
	}

	/**
	 * 登録完了のメールを登録した情報と共に各担当に送信する
	 * @param unknown $client
	 */
	public function sendRegistClientMail($clientId, $form, $client) {

		$mailModel = Application_CommonUtil::getInstance("model", "MailModel", $this->db);

		$staffDao          = Application_CommonUtil::getInstance("dao", "MasterStaffDao", $this->db);
		$clientCategoryDao = Application_CommonUtil::getInstance("dao", "MasterClientCategoryDao", $this->db);
		$clientServiceDao  = Application_CommonUtil::getInstance("dao", "MasterClientServiceDao", $this->db);

		// 対象クライアントのアイドマ担当者情報を取得
		$tmpStaffList = $staffDao->getStaffListByIdsAndType($client["aa_staff_id_list"], MasterStaffDao::STAFF_TYPE_AA);

		$staffList = array();
		foreach($tmpStaffList as $tmpStaff){
			$staff_email = ($this->dummy_mail == '') ? $tmpStaff['staff_email'] : $this->dummy_mail;
			$stafflist[] = array('staff_name' => $tmpStaff['staff_name'], 'staff_email' => $staff_email);
		}

		$nowCategory = $clientCategoryDao->getClientAndCategory($clientId);		// 最新の業界・業種を取得
		$nowService  = $clientServiceDao->getProjectServiceList($clientId);		// 最新のサービスを取得

		// アカウント登録・編集完了メール送信
		if($this->dummy_mail != ''){
			$form['client_staffleaderemail'] = $this->config->mail->dummy_mail;
		}

		// メール送信
		$mailModel->sendRegistClientMail($form, $stafflist, $nowCategory, $nowService);
	}
}