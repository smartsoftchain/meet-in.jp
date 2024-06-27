<?php

require_once ROOT.'library/Application/validation.php';

/**
 * 担当者一覧・設定で使用するモデル
 * @author admin
 *
 */
class SettingClientStaffModel extends AbstractModel{

	const IDENTIFIER 		= "setting_client_staff";// セッション変数のnamespace
	const DEFAULT_PAGE  	= "1";		//初期ページデフォルト
	const DEFAULT_PAGE_SIZE = "100";	//初期行数
	const INITIAL_CHAR		= "CA";
	const NEW_MEETIN_ID  	= "新規";
	const STAFF_ROLE_DEFAULT= "2";		// 権限初期値:1：管理者 2:社員 3:バイト
	const HOUR_PRICE		= "1500";	// 単価初期値
	const ONE_PRICE			= "150";	// 1件当たり初期値
	const LOGIN_FLG_DEFAULT =  "1";	// ログイン初期値:0：不可 1:可能
	const MESSAGE_INSERT 	= "新規担当者データを登録しました。";
	const MESSAGE_UPDATE 	= "データを更新しました。";
	const MESSAGE_DELETE 	= "データを削除しました。";
	
	// 支払種別セレクト
	private $payment_type_select = array(
		"1" => "時給",
		"2"	=> "日給",
		"3"	=> "月給"
	);

	private $db;	// DBコネクション
	/**
	 * コンストラクタ
	 *
	 * @param unknown $db
	 */
	function __construct($db){
		$this->db = $db;

		parent::init();
	}

	/**
	 * 担当者一覧取得
	 *
	 * @param unknown $client_id
	 */
	public function getClientStaffList($client_id , $form,  &$screenSession) {

		$user = $this->user;

		// セッションの初期化
		if($screenSession->isnew == true){
			$screenSession->order     = 'staff_id';
			$screenSession->page      = self::DEFAULT_PAGE;
			$screenSession->pagesize  = self::DEFAULT_PAGE_SIZE;
			$screenSession->ordertype = 'asc';	// 任意
		}
		// パラメータをセッションに格納
		foreach($form as $key=>$val){
			$screenSession->$key = $val;
			//$test;
		}


		// daoの宣言
		$masterClientDao 	= Application_CommonUtil::getInstance("dao", "MasterClientDao", $this->db);
		$clientStaffDao 	= Application_CommonUtil::getInstance("dao","MasterClientStaffDao",$this->db);
		$resultCount 		= $clientStaffDao -> getClientStaffListCount($client_id);
		$clientStaffList 	= $clientStaffDao -> getClientStaffList($client_id,
																$screenSession->pagesize,
																$screenSession->page,
																$screenSession->order,
																$screenSession->ordertype);
		$list = new Application_Pager(array(
				"itemData"  => $clientStaffList,						// リスト（未スライス）
				"itemCount" => $resultCount['count'],		// リスト（未スライス）
				"perPage"   => $screenSession->pagesize,	// ページごと表示件数
				"curPage"   => $screenSession->page,		// 表示するページ
				"order"     => $screenSession->order,		// ソートカラム名
				"orderType" => $screenSession->ordertype,	// asc or desc
		));
		
		// クライアント情報を取得
		$client = $masterClientDao->getMasterClientRow($this->user["client_id"]);
		
		// セッション変数宣言
		$session = Application_CommonUtil::getSession(self::IDENTIFIER);
		// 戻り値の変数宣言
		$result = array();
		if(!is_null($session->registComplete)){
			// セッション情報を初期化する
			Application_CommonUtil::unsetSession(self::IDENTIFIER);
			// メッセージを設定する
			$result["registMsg"] = $this->message->success->regist->staff;
		}
		
		$result["clientList"] = $list;
		$result["client"] = $client;
		return $result;
	}

	/**
	 * 担当者情報取得
	 *
	 * @param unknown $client_id
	 */
	public function getClientStaff( $client_id , $staff_type ,$staff_id ) {

		$clientStaffDao = Application_CommonUtil::getInstance("dao","MasterClientStaffDao",$this->db);
		
		$list = $clientStaffDao->getClientStaff( $client_id , $staff_type	 ,$staff_id );
		$initialChar = "";
		
		// 表示用クライアントIDを生成
		if ($list["client_id"]==0) {
			$initialChar = $list["idchar"];
		} else {
			$initialChar = self::INITIAL_CHAR;
		}
		
		$list["client_display_id"] = $initialChar.substr("00000".$list["client_id"],-5);

		return $list;
	}

	/**
	 * 表示用クライアントID生成
	 *
	 * @param unknown $client_id
	 */
	public function getClientIdDisplay() {


		$result["client_display_id"]	 =self::INITIAL_CHAR.substr("00000".$this->user["client_id"], -5);
		$result["account_id"] 			= self::NEW_MEETIN_ID;		// ユーザーのアカウントID（表示用）
		$result["staff_role"] 			= self::STAFF_ROLE_DEFAULT;	// 権限初期値
		$result["login_flg"] 			= self::LOGIN_FLG_DEFAULT;	// ログイン初期値
		$result["telephone_hour_price"]	= self::HOUR_PRICE;			// 単価初期値
		$result["telephone_one_price"]	= self::ONE_PRICE;			// 一件あたり初期値
		$result["maildm_hour_price"]	= self::HOUR_PRICE;			// 単価初期値
		$result["maildm_one_price"]		= self::ONE_PRICE;			// 一件あたり初期値
		$result["inquiry_hour_price"]	= self::HOUR_PRICE;			// 単価初期値
		$result["inquiry_one_price"]	= self::ONE_PRICE;			// 一件あたり初期値

		return $result;
	}
	/**
	 * バリデーション
	 *
	 * @param unknown $form
	 */
	public function getClientStaffValidation($form) {

	$validationDict = array(
						"staff_password" 		=>array("name" =>"パスワード", 			"length" => 8, 		"validate" => array(4)),
						"staff_firstname" 		=>array("name" =>"姓", 				"length" => 32, 	"validate" => array(1)),
						"staff_lastname" 		=>array("name" =>"名", 				"length" => 32, 	"validate" => array(1)),
						"staff_firstnamepy" 	=>array("name" =>"姓（フリガナ）", 		"length" => 32, 	"validate" => array(1,10)),
						"staff_lastnamepy" 		=>array("name" =>"名（フリガナ）", 		"length" => 32, 	"validate" => array(1,10)),
						"staff_email" 			=>array("name" =>"メールアドレス", 		"length" => 50, 	"validate" => array(1,7)),
						"staff_payment_type"	=>array("name" =>"支払種別", 			"length" => 1, 		"validate" => array(1,2)),
						"telephone_hour_price" 	=>array("name" =>"電話単価", 			"length" => 11, 	"validate" => array(1,2)),
						"telephone_one_price" 	=>array("name" =>"電話1件当たり", 		"length" => 11, 	"validate" => array(1,2)),
						"maildm_hour_price" 	=>array("name" =>"メールDM単価", 		"length" => 11, 	"validate" => array(1,2)),
						"maildm_one_price, " 	=>array("name" =>"メールDM1件当たり", 	"length" => 11, 	"validate" => array(1,2)),
						"inquiry_hour_price" 	=>array("name" =>"お問い合わせ単価", 	"length" => 11, 	"validate" => array(1,2)),
						"inquiry_one_price" 	=>array("name" =>"お問い合わせ1件あたり",	"length" => 11, 	"validate" => array(1,2)),
						"webphone_id" 			=>array("name" =>"WebPhoneID", 		"length" => 20, 	"validate" => array(2)),
						"webphone_pass" 		=>array("name" =>"WebPhonePasswd", 	"length" => 20, 	"validate" => array(4)),
						"webphone_ip" 			=>array("name" =>"WebPhoneIP", 		"length" => 20, 	"validate" => array(9)),
						"staff_comment" 		=>array("name" =>"備考", 			"length" => 200, 	"validate" => array())
				);
		//既存データのテンプレート値のバリデーション
		$errorArray=array();
		foreach($form as $keyArray =>$valueArray){
			$checkTarget=array($keyArray =>$valueArray);
			$errorList = executionValidation( $checkTarget, $validationDict);
			if(!count($errorList) == 0){
				foreach($errorList as $error){
					array_push($errorArray, $error);
				}
			}
		}
		return $errorArray;
	}
	
	/**
	 * 支払種別のリストボックス連想配列を取得
	 * @return multitype:string
	 */
	public function getPaymentTypeSelectBox() {
		return $this->payment_type_select;
	}

	/**
	 * 担当者登録・更新
	 *
	 * @param unknown $client_id
	 */
	public function registClientStaff( $form ,$user) {
		
		// セッション取得
		$session = Application_CommonUtil::getSession(self::IDENTIFIER);
		
		$clientStaffDao = Application_CommonUtil::getInstance("dao","MasterClientStaffDao",$this->db);

		// トランザクションスタート
		$this->db->beginTransaction();
		try{
			// 登録・更新実行
			$result = $clientStaffDao -> setRegist ($form, $user );

		}catch(Exception $e){
			$this->db->rollBack();
			throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
		}
		$this->db->commit();
		
		// セッション削除
		//$session = Application_CommonUtil::unsetSession(self::IDENTIFIER);
		
		// 一覧画面でメッセージ表示用にセッションにデータを設定する
		$session->registComplete = 1;

		$registMessage  = self::MESSAGE_UPDATE;

		// 新規登録は完了後リスト画面に移動
		if($form["staff_id"]==""){
			$registMessage  = rawurlencode(self::MESSAGE_INSERT);
			$location = "Location: /setting-client-staff/client-staff?registMessage=".$registMessage;
			header($location );
		}
		return $registMessage;
	}

	/**
	 * 担当者論理削除
	 *
	 * @param unknown $client_id
	 */
	public function deleteClientStaff($deleteClientStaffId ) {
		$deleteID 	 = explode(",", $deleteClientStaffId);
		$staff_id    = $deleteID[0] ;
		$staff_type  = $deleteID[1] ;
		$clientStaffDao = Application_CommonUtil::getInstance("dao","MasterClientStaffDao",$this->db);

		// トランザクションスタート
		$this->db->beginTransaction();
		try{
			// 削除実行
			$result = $clientStaffDao -> delete ($staff_type,  $staff_id);

		}catch(Exception $e){
			$this->db->rollBack();
			throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
		}
		$this->db->commit();
		// セッション削除
		Application_CommonUtil::unsetSession(self::IDENTIFIER);

		$registMessage =self::MESSAGE_DELETE;
		return $registMessage;
	}
}