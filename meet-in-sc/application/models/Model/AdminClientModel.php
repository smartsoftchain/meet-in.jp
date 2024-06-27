<?php

/**
 * 管理画面クライアント管理用モデル
 * @author admin
 *
 */
class AdminClientModel extends AbstractModel{
	
	const IDENTIFIER = "admin_client";							// セッション変数のnamespace
	const REFERER_CLIENT_REGIST = "client-regist";				// クライアント登録のリファラー
	const REFERER_CLIENT_LIST = "client-list";					// クライアント削除のリファラー
	
	private $db;									// DBコネクション
	// master_staffテーブルの初期値
	private $masterClientDict = array(
										"client_name"							=>"", 
										"client_del_flg"						=>"0", 
										"client_namepy"							=>"", 
										"client_postcode1"						=>"", 
										"client_postcode2"						=>"", 
										"client_address"						=>"", 
										"client_tel1"							=>"", 
										"client_tel2"							=>"", 
										"client_tel3"							=>"", 
										"client_fax1"							=>"", 
										"client_fax2"							=>"", 
										"client_fax3"							=>"", 
										"client_homepage"						=>"", 
										"client_staffleaderfirstname"			=>"", 
										"client_staffleaderlastname"			=>"", 
										"client_staffleaderfirstnamepy"			=>"", 
										"client_staffleaderlastnamepy"			=>"", 
										"client_staffleaderemail"				=>"", 
										"client_comment"						=>"", 
										"client_idchar"							=>"", 
										"client_staffleadername"				=>"", 
										"aa_staff_id_list"						=>"", 
										"option_passwd"							=>"", 
										"publish_recording_talk_flg"			=>"0", 
										"publish_telephone_db_flg"				=>"0", 
										"valid_telephonelist_downloading_num"	=>"0", 
										"publish_analysis_menu_flg"				=>"0", 
										"sum_span_type"							=>"0", 
										"client_add_staff_flg"					=>"0", 
								);
	// master_staffテーブルの初期値
	private $masterClientDownloadOptionDict = array(
										"plan_name"								=>"",
										"ca_is_enable_over"						=>"",
										"ca_download_num"						=>"",
										"ca_download_limit"						=>"",
										"aa_is_enable_download"					=>"",
										"aa_download_limit"						=>"",
										"current_flg"							=>""
	);
	
	function __construct($db){
		parent::init();
		$this->db = $db;
	}
	
	public function init() {
	}
	
	/**
	 * クライアント一覧を取得する
	 * @param unknown $form
	 * @param unknown $screenSession
	 * @return Application_Pager
	 */
	function getClientList($form, &$screenSession){
		// セッションの初期化
		if($screenSession->isnew == true){
			$screenSession->order = 'client_id';
			$screenSession->page = 1;
			$screenSession->pagesize = 100;
			$screenSession->ordertype = 'asc';	// 任意
			$screenSession->retrievalType = "1";	// 1:担当クライアント,2:全クライアント
			$screenSession->free_word = "";
		}
		// パラメータをセッションに格納
		foreach($form as $key=>$val){
			$screenSession->$key = $val;
		}
		// daoの宣言
		$masterClientDao = Application_CommonUtil::getInstance('dao', "MasterClientDao", $this->db);
	
		// 変数宣言
		$condition = "";		// SQLの検索条件を設定
		// 検索ボタンが押下された場合、ページを初期化する
		if(array_key_exists("free_word", $form)){
			$screenSession->page = 1;
		}
		// 検索条件が存在する場合は検索条件を作成する
		if($screenSession->free_word != ""){
			$escapeText = $this->escape($screenSession->free_word);
			$condition = " AND (client_id like '%{$escapeText}%' OR client_name like '%{$escapeText}%' OR CONCAT(AES_DECRYPT(client_staffleaderfirstname,@key),AES_DECRYPT(client_staffleaderlastname,@key)) like '%{$escapeText}%' OR CONCAT(client_tel1, client_tel2, client_tel3) like '%{$escapeText}%' OR CONCAT(client_tel1, '-', client_tel2, '-', client_tel3) like '%{$escapeText}%' OR client_address like '%{$escapeText}%') ";
		}
		// 検索実施
		$masterClientCount = $masterClientDao->getClientCount($condition);
		$masterClientList = $masterClientDao->getClientList($condition, $screenSession->order, $screenSession->ordertype , $screenSession->page, $screenSession->pagesize);
		// ページャ設定
		$list = new Application_Pager(array(
				"itemData" => $masterClientList,			// リスト
				"itemCount" => $masterClientCount,			// カウント
				"perPage" => $screenSession->pagesize,		// ページごと表示件数
				"curPage" => $screenSession->page,			// 表示するページ
				"order" => $screenSession->order,			// ソートカラム名
				"orderType" => $screenSession->ordertype,	// asc or desc
		));
		// 戻り値を作成する
		$result["list"] = $list;
		$result["registMsg"] = "";
		// セッション取得
		$session = Application_CommonUtil::getSession(self::IDENTIFIER);
		if(!is_null($session->registComplete)){
			// セッション情報を初期化する
			Application_CommonUtil::unsetSession(self::IDENTIFIER);
			// メッセージを設定する
			$result["registMsg"] = $this->message->success->regist->client;
		}
		return $result;
	}
	
	/**
	 * クライアント登録処理
	 * @param unknown $form
	 */
	public function clientRegist($form, $request){
		// 戻り値の宣言
		$result = array();
		$result["registCompleteFlg"] = 0;
		$result["errorList"] = array();
		// daoの宣言
		$masterClientDao = Application_CommonUtil::getInstance('dao', "MasterClientDao", $this->db);
		$masterStaffDao = Application_CommonUtil::getInstance('dao', "MasterStaffDao", $this->db);
		
//		if ($request->isPost() && Application_CommonUtil::refererCheck(self::REFERER_CLIENT_REGIST)) {
		if ($request->isPost()) {
			// セッション取得
			$session = Application_CommonUtil::getSession(self::IDENTIFIER);
			// 登録処理を行う
			// クライアント情報のバリデーションを実行する
			$errorList = $this->masterClientValidation($form);

			if(count($errorList) == 0 ){
				// 画面で設定した値をその他の情報とマージする
				$clientDict = array_merge($session->clientRegist["clientDict"], $form);
				// 新規作成フラグを設定する
				$registNewFlg = 0;
				if(!array_key_exists("client_id", $clientDict)){
					$registNewFlg = 1;
				}
				// トランザクションスタート
				$this->db->beginTransaction();
				try{
					// クライアントの登録処理
					$clientId = $masterClientDao->setMasterClient($clientDict);
					$clientDict["clientId"] = $clientId;
					$this->db->commit();
				}catch(Exception $e){
					$this->db->rollBack();
					throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
				}
				// 一覧画面でメッセージ表示用にセッションにデータを設定する
				$session->registComplete = 1;
				// 登録完了の場合は一覧へ遷移するためフラグを立てる
				$result["registCompleteFlg"] = 1;
				$result["client_id"] = $clientDict["clientId"];
				$result["ret"] = $clientDict["ret"];
			}else{
				// エラーの場合は登録画面へ戻るのでデータを設定する
				$result["clientDict"] = $form;
				$result["errorList"] = $errorList;
			}
		}else{
			// 変数を宣言
			$clientDict = array();
			$clientCategoryList = array();
			$clientServiceList = array();
			$forCheckClientCategoryList = array();	// 削除データ比較用
			$forCheckClientServiceList = array();			// 削除データ比較用
			// セッション情報を初期化する
			Application_CommonUtil::unsetSession(self::IDENTIFIER);
			// セッション取得
			$session = Application_CommonUtil::getSession(self::IDENTIFIER);
			// 新規と編集で処理を分ける
			if(array_key_exists("client_id", $form)){
				// 更新の場合はDBからデータを取得する
				$clientId = $this->escape($form["client_id"]);
				// クライアントデータの取得
				$clientDict = $masterClientDao->getMasterClientRow($clientId);
				// アイドマ担当者の名前を設定
				if($clientDict["aa_staff_id_list"] != ""){
					$condition = " staff_type = 'AA' AND staff_id IN(".$clientDict["aa_staff_id_list"].") ";
					$aaStaffList = $masterStaffDao->getMasterStaffAllList($condition, "staff_id", "asc");
					if(count($aaStaffList) > 1){
						$clientDict["aa_staff_name"] = "{$aaStaffList[0]["staff_name"]}他";
					}else{
						$clientDict["aa_staff_name"] = "{$aaStaffList[0]["staff_name"]}";
					}
				}
			}else{
				// 新規作成の場合
				$clientDict = $this->masterClientDict;
				$clientCategoryList = array();
				$clientServiceList = array();
			}
			// セッションにデータの保存
			$session->clientRegist = array(
										"clientDict"=>$clientDict 
									);
			// 画面に表示するデータを戻り値に設定する
			$result["clientDict"] = $clientDict;
		}
		// 登録完了していなければ画面表示に必要なデータを取得し設定する
		if($result["registCompleteFlg"] == 0){
			// アイドマ担当者の取得
//			$condition = " client_id IS NULL AND staff_type = 'AA' ";		// SQLの検索条件を設定
			$condition = " staff_type = 'AA' ";		// SQLの検索条件を設定
			$aaStaffList = $masterStaffDao->getSelectMasterStaffAllList($condition, "staff_id", "asc");
			// 選択中のアイドマ担当者情報
			$session->clientRegistAAStaffIds = explode(",", $result["clientDict"]["aa_staff_id_list"]);
			// 取得したデータをjsonデータに変換し設定する
			$result["aaStaffListJson"] = json_encode($aaStaffList);
			$result["checkAAStaffListJson"] = json_encode($session->clientRegistAAStaffIds);
		}
		return $result;
	}
	
	/**
	 * クライアントを削除する処理
	 * @param unknown $staffType
	 * @param unknown $form
	 * @throws Exception
	 * @return multitype:string
	 */
	public function clientDelete($form, $request){
		$result = 0;
		// 各担当者毎のリファラチェックを行い問題無ければ処理を続行する
		if ($request->isPost() && Application_CommonUtil::refererCheck(self::REFERER_CLIENT_LIST)) {
			if(isset($form["client_id"])){
				$clientId = $this->escape($form["client_id"]);
				// daoの宣言
				$masterCLientDao = Application_CommonUtil::getInstance('dao', "MasterClientDao", $this->db);
				// トランザクションスタート
				$this->db->beginTransaction();
				try{
					// 担当者の論理削除
					$masterCLientDao->deletClient($clientId);
					$this->db->commit();
					$result = 1;
				}catch(Exception $e){
					$this->db->rollBack();
					throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
				}
			}
		}
		return $result;
	}
	
	/**
	 * クライアント登録処理
	 * @param unknown $form
	 */
	public function clientRegistOne($form, $request){
		// 戻り値の宣言
		$result = array();
		$result["errorList"] = array();

		// daoの宣言
		$masterClientDao = Application_CommonUtil::getInstance('dao', "MasterClientDao", $this->db);
		
//		if ($request->isPost() && Application_CommonUtil::refererCheck(self::REFERER_CLIENT_REGIST)) {
//			// セッション取得
//			$session = Application_CommonUtil::getSession(self::IDENTIFIER);
			// 登録処理を行う
			// クライアント情報のバリデーションを実行する
//			$errorList = $this->masterClientValidation($form);

//			if(count($errorList) == 0 ){
				// 画面で設定した値をその他の情報とマージする
//				$clientDict = array_merge($session->clientRegist["clientDict"], $form);
				$clientDict = $form;
//				// 新規作成フラグを設定する
//				$registNewFlg = 0;
//				if(!array_key_exists("client_id", $clientDict)){
//					$registNewFlg = 1;
//				}
				// トランザクションスタート
				$this->db->beginTransaction();
				try{
					// クライアントの登録処理
					$clientId = $masterClientDao->setMasterClientOne($clientDict);
					$clientDict["clientId"] = $clientId;
					$this->db->commit();
					$result["status"] = "1";
				}catch(Exception $e){
					$result["status"] = "0";
					$this->db->rollBack();
					throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
				}
//				// 一覧画面でメッセージ表示用にセッションにデータを設定する
//				$session->registComplete = 1;
//				// 登録完了の場合は一覧へ遷移するためフラグを立てる
//				$result["registCompleteFlg"] = 1;
//			}else{
//				// エラーの場合は登録画面へ戻るのでデータを設定する
//				$result["clientDict"] = $form;
//				$result["errorList"] = $errorList;
//			}
		return $result;
	}
	
	/**
	 * マスタークライアント用のバリデーション
	 * @param unknown $form
	 */
	function masterClientValidation($data){
			$validationDict = array(
						"client_name" 							=>array("name" =>"クライアント名", 				"length" => 64, 	"validate" => array(1)),
						"client_namepy" 						=>array("name" =>"フリガナ", 			"length" => 64, 	"validate" => array(1)),
						"client_postcode1" 						=>array("name" =>"郵便番号1", 				"length" => 3, 		"validate" => array(2)),
						"client_postcode2" 						=>array("name" =>"郵便番号2", 				"length" => 4, 		"validate" => array(2)),
						"client_address" 						=>array("name" =>"住所", 					"length" => 50, 	"validate" => array(1)),
						"client_tel1" 							=>array("name" =>"電話番号（市外局番）", 		"length" => 5, 		"validate" => array(2)),
						"client_tel2" 							=>array("name" =>"電話番号（市内局番）", 		"length" => 5, 		"validate" => array(2)),
						"client_tel3" 							=>array("name" =>"電話番号（加入者番号）", 		"length" => 5, 		"validate" => array(2)),
						"client_fax1" 							=>array("name" =>"FAX番号（市外局番）",			"length" => 5, 		"validate" => array(2)),
						"client_fax2" 							=>array("name" =>"FAX番号（市内局番）", 		"length" => 5, 		"validate" => array(2)),
						"client_fax3" 							=>array("name" =>"FAX番号（加入者番号）", 		"length" => 5, 		"validate" => array(2)),
						"client_staffleaderfirstname" 			=>array("name" =>"代表者氏", 										"validate" => array(1)),
						"client_staffleaderlastname" 			=>array("name" =>"代表者名", 									 	"validate" => array(1)),
						"client_staffleaderemail" 				=>array("name" =>"代表者メールアドレス", 			"length" => 50, 	"validate" => array(1,7)),
						"client_comment" 						=>array("name" =>"備考", 		"length" => 200,	"validate" => array()),
						"client_staffleadername" 				=>array("name" =>"代表者氏名", 									"validate" => array()),
						"client_homepage" 						=>array("name" =>"ホームページURL", 			"length" => 100, 	"validate" => array(8)),
						"aa_staff_id_list" 						=>array("name" =>"アイドマ担当者", 				"length" => 100, 	"validate" => array(13)),
				);
/*
						"client_staffleaderfirstnamepy" 		=>array("name" =>"代表者氏カナ", 								 	"validate" => array(10)),
						"client_staffleaderlastnamepy" 			=>array("name" =>"代表者名カナ", 								 	"validate" => array(10)),
						"publish_recording_talk_flg" 			=>array("name" =>"通話録の再生を公開する", 		"length" => 1, 		"validate" => array(1,2)),
						"publish_telephone_db_flg" 				=>array("name" =>"TMO電話データベースを公開する", 	"length" => 1,	 	"validate" => array(1,2)),
						"valid_telephonelist_downloading_num" 	=>array("name" =>"有効電話リストダウンロード数", 	"length" => 11,		"validate" => array(1,2)),
						"publish_analysis_menu_flg" 			=>array("name" =>"分析メニューを公開する", 		"length" => 1, 		"validate" => array(1,2)),
						"client_add_staff_flg" 					=>array("name" =>"CEの担当者追加権限", 		"length" => 3, 		"validate" => array(1,2)),
*/
		$errorList = executionValidation($data, $validationDict);
		return $errorList;
	}
	
}