<?php

/**
 * 商談結果用モデル
 * @author admin
 *
 */
class BusinessDiscussionResultModel extends AbstractModel{

	const IDENTIFIER = "admin_client";							// セッション変数のnamespace
	const REFERER_BDR_REGIST = "negotiation-edit";					// 商談結果登録のリファラー
	const REFERER_BDR_LIST = "negotiation-list";					// 商談結果削除のリファラー

	private $db;									// DBコネクション
	// business_discussion_resultテーブルの初期値
	private $BDResult_Dict = array(
										"etime"							=>"",
										"del_flg"						=>"0",
										"next_action"					=>"",
										"call_division_name1"			=>"",
										"sharing_memo"					=>"",
										"secret_comment"				=>"",
										"company_name"					=>"",
										"staff_name"					=>"",
										"client_service_id"				=>"",
										"executive"						=>"",
										"tel1"							=>"",
										"tel2"							=>"",
										"tel3"							=>"",
										"fax1"							=>"",
										"fax2"							=>"",
										"fax3"							=>"",
										"email"							=>"",
										"memo"							=>""
								);
	// business_discussion_resultテーブルの初期値
	private $BDResultDownloadOptionDict = array(
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
	 * 商談結果一覧を取得する
	 * @param unknown $form
	 * @param unknown $screenSession
	 * @return Application_Pager
	 */
	function getBDResultList($form, &$screenSession){
		// セッションの初期化
		if($screenSession->isnew == true){
			$screenSession->order = 'stime';
			$screenSession->page = 1;
			$screenSession->pagesize = 100;
			$screenSession->ordertype = 'desc';	// 任意
			$screenSession->free_word = "";
		}
		// パラメータをセッションに格納
		foreach($form as $key=>$val){
			$screenSession->$key = $val;
		}
		// daoの宣言
		$BDResultDao = Application_CommonUtil::getInstance('dao', "BusinessDiscussionResultDao", $this->db);

		// 変数宣言
		$condition = " staff_type = '{$this->user["staff_type"]}' AND staff_id = {$this->user["staff_id"]} AND client_id = {$this->user["client_id"]} ";		// SQLの検索条件を設定
		if (array_key_exists("srt", $form)) {
			if ($form["srt"]=="1") {
				$screenSession->order = 'company_name';
				$screenSession->ordertype = "asc";
			} else if ($form["srt"]=="2") {
				$screenSession->order = 'update_date';
				$screenSession->ordertype = "asc";
			} else if ($form["srt"]=="3") {
				$screenSession->order = 'company_name';
				$screenSession->ordertype = "desc";
			} else if ($form["srt"]=="4") {
				$screenSession->order = 'update_date';
				$screenSession->ordertype = "desc";
			}
		}

		// 検索ボタンが押下された場合、ページを初期化する
		if(array_key_exists("free_word", $form)){
			$screenSession->page = 1;
		}
		// 検索条件が存在する場合は検索条件を作成する
		if($screenSession->free_word != ""){
			$escapeText = $this->escape($screenSession->free_word);
			$condition .= " AND (company_name like '%{$escapeText}%' OR staff_name like '%{$escapeText}%') ";
		}
		// 検索実施
		$BDResultCount = $BDResultDao->getBDResultListCount($condition);
		$BDResultList = $BDResultDao->getBDResultList($condition, $screenSession->order, $screenSession->ordertype , $screenSession->page, $screenSession->pagesize);
		// ページャ設定
		$list = new Application_Pager(array(
				"itemData" => $BDResultList,				// リスト
				"itemCount" => $BDResultCount,				// カウント
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
	 * 商談結果一覧のうち 録画データを持っている件のみを取得する.
	 * @param unknown $form
	 * @param unknown $screenSession
	 * @return Application_Pager
	 */
	function getBDResultVideoList($form, &$screenSession){

		// daoの宣言
		$BDResultDao = Application_CommonUtil::getInstance('dao', "BusinessDiscussionResultDao", $this->db);

		// 検索実施
		$condition = "client_id = {$this->user["client_id"]}";
		$BDResultList = $BDResultDao->getVideoList($condition, 'etime', 'desc');

		// 戻り値を作成する
		$result['count'] = count($BDResultList);
		$result["list"]  = $BDResultList;
		$result["registMsg"] = "";

		return $result;
	}

	/**
	 * 商談結果登録処理
	 * @param unknown $form
	 */
	public function BDResultEdit($form, $request){
		// 戻り値の宣言
		$result = array();
		$result["registCompleteFlg"] = 0;
		$result["errorList"] = array();
		// daoの宣言
		$BDResultDao = Application_CommonUtil::getInstance('dao', "BusinessDiscussionResultDao", $this->db);
		if ($request->isPost() && Application_CommonUtil::refererCheck(self::REFERER_BDR_REGIST)) {
			// セッション取得
			$session = Application_CommonUtil::getSession(self::IDENTIFIER);
			// 登録処理を行う
			// 商談結果情報のバリデーションを実行する
			$errorList = $this->BDResultValidation($form);
			if(count($errorList) == 0){ // バリデーションチェック正常
				// 画面で設定した値をその他の情報とマージする
				$BDRDict = array_merge($session->BDResult["BDRDict"], $form);
				// 新規作成フラグを設定する
				$registNewFlg = 0;
				if(!array_key_exists("id", $BDRDict)){
					$registNewFlg = 1;
				}
				// トランザクションスタート
				$this->db->beginTransaction();
				try{
					// 商談結果の登録処理
					$sTime = $BDResultDao->setBDResult($BDRDict, "edit");
					$form["sTime"] = $sTime;
					$this->db->commit();
				}catch(Exception $e){
					$this->db->rollBack();
					throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
				}
				// 一覧画面でメッセージ表示用にセッションにデータを設定する
				$session->registComplete = 1;
				// 登録完了の場合は一覧へ遷移するためフラグを立てる
				$result["registCompleteFlg"] = 1;
			}else{
				// エラーの場合は登録画面へ戻るのでデータを設定する
				$result["BDRDict"] = $form;
				$result["errorList"] = $errorList;
			}
		}else{
			// 変数を宣言
			$BDRDict = array();
			// セッション情報を初期化する
			Application_CommonUtil::unsetSession(self::IDENTIFIER);
			// セッション取得
			$session = Application_CommonUtil::getSession(self::IDENTIFIER);

//			if(array_key_exists("staff_type", $form) && array_key_exists("staff_id", $form) && array_key_exists("stime", $form)){
			if(array_key_exists("id", $form)){
				// 更新の場合はDBからデータを取得する
				$condition = " id = '{$form["id"]}' ";		// SQLの検索条件を設定
				// 商談結果データの取得
				$BDRDict = $BDResultDao->getBDResultRow($condition);
			}
			// セッションにデータの保存
			$session->BDResult = array(	"BDRDict"=>$BDRDict);

			// 録画ファイルが存在する場合は GCS側にファイルがあるか判定する.
			$isFileBucketExists = false;
			//　download_url値があるかで [拡張機能インストール型]かを判断 スタッフ自身にいつでも編集される$user->record_method_type 値から当時がどうだったか判断出来ない.
			$BDRDict['is_file_exists'] = $BDRDict['download_url'] != null;
			if($BDRDict['is_file_exists']) {
				$filename = explode("name=", $BDRDict['download_url']);
				if(2 == count($filename)) {
					// 録画ダウンロードURLに録画ファイルがないか確認する.
					$videoModel = Application_CommonUtil::getInstance("model", "VideoModel");
					$isFileBucketExists = $videoModel->isFileBucketExists($filename[1]);
				}
			}
			$BDRDict['is_file_bucket_exists'] = $isFileBucketExists;


			// 画面に表示するデータを戻り値に設定する
			$result["BDRDict"] = $BDRDict;
		}
		return $result;
	}

	/**
	 * 商談結果登録処理
	 * @param unknown $form
	 */
	public function BDResultRegist($form, $request){
		// 戻り値の宣言
		$result = array();
		$result["registCompleteFlg"] = 0;
		$result["errorList"] = array();
		// daoの宣言
		$BDResultDao = Application_CommonUtil::getInstance('dao', "BusinessDiscussionResultDao", $this->db);

		if ($request->isPost() && Application_CommonUtil::refererCheck(self::REFERER_BDR_REGIST)) {
			// セッション取得
			$session = Application_CommonUtil::getSession(self::IDENTIFIER);
			// 登録処理を行う
			// 商談結果情報のバリデーションを実行する
			$errorList = $this->BDResultValidation($form);

			if(count($errorList) == 0 || true){ //課題 常にエラー

				// 画面で設定した値をその他の情報とマージする
				$BDRDict = array_merge($session->BDResult["BDRDict"], $form);
				// 新規作成フラグを設定する
				$registNewFlg = 0;
				if(!array_key_exists("stime", $BDRDict)){
					$registNewFlg = 1;
				}
				// トランザクションスタート
				$this->db->beginTransaction();
				try{
					// 商談結果の登録処理
					$sTime = $BDResultDao->setBDResult($BDRDict);
					$form["sTime"] = $sTime;
					$this->db->commit();
				}catch(Exception $e){
					$this->db->rollBack();
					throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
				}
				// 一覧画面でメッセージ表示用にセッションにデータを設定する
				$session->registComplete = 1;
				// 登録完了の場合は一覧へ遷移するためフラグを立てる
				$result["registCompleteFlg"] = 1;
			}else{
				// エラーの場合は登録画面へ戻るのでデータを設定する
				$result["BDRDict"] = $form;
				$result["errorList"] = $errorList;
			}
		}else{
			// 変数を宣言
			$BDRDict = array();
			// セッション情報を初期化する
			Application_CommonUtil::unsetSession(self::IDENTIFIER);
			// セッション取得
			$session = Application_CommonUtil::getSession(self::IDENTIFIER);
			// 新規と編集で処理を分ける
			if(array_key_exists("stime", $form)){
				// 更新の場合はDBからデータを取得する
				$sTime = $this->escape($form["stime"]);
				// 商談結果データの取得
				$BDRDict = $BDResultDao->getBDResultRow($sTime);
			}else{
				// 新規作成の場合
				$BDRDict = $this->BDResult_Dict;
				// 課題：呼び元から渡してもらう
				$BDRDict["staff_type"] = "AA";
				$BDRDict["staff_id"] = 2;
				$BDRDict["client_id"] = 791;
			}
			// セッションにデータの保存
			$session->BDResult = array(	"BDRDict"=>$BDRDict);
			// 画面に表示するデータを戻り値に設定する
			$result["BDRDict"] = $BDRDict;
		}
		return $result;
	}

	/**
	 * 商談結果登録処理
	 * @param unknown $form
	 */
	public function BDResultRegist2($form, $request){
		// 戻り値の宣言
		$result = array();
		$result["registCompleteFlg"] = 0;
		$result["errorList"] = array();
		// daoの宣言
		$BDResultDao = Application_CommonUtil::getInstance('dao', "BusinessDiscussionResultDao", $this->db);

		$BDRDict = $form;
		// 新規作成フラグを設定する
		$registNewFlg = 0;
		if(!array_key_exists("stime", $BDRDict)){
			$registNewFlg = 1;
		}
		// トランザクションスタート
		$this->db->beginTransaction();
		try{
			$connectionInfoDao = Application_CommonUtil::getInstance("dao", "ConnectionInfoDao", $this->db);
			$connection_info_id_temp = $form["connectioninfoidtemp"];
			$condition = "(id = '{$connection_info_id_temp}') ";
			$connectionInfo = $connectionInfoDao->getConnectionInfo($condition);
			$BDRDict["room_name"] = $connectionInfo["room_name"];
			$BDRDict["connection_start_datetime"] = $connectionInfo["connection_start_datetime"];
			$BDRDict["connection_stop_datetime"] = $connectionInfo["connection_stop_datetime"];

			// 商談結果の登録処理
			$sTime = $BDResultDao->setBDResult($BDRDict);

			$this->db->commit();
		}catch(Exception $e){
			$this->db->rollBack();
			throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
		}
		// 一覧画面でメッセージ表示用にセッションにデータを設定する
		$session->registComplete = 1;
		// 登録完了の場合は一覧へ遷移するためフラグを立てる
		$result["registCompleteFlg"] = 1;

		return $result;
	}

	/**
	 * 商談結果を削除する処理
	 * @param unknown $staffType
	 * @param unknown $form
	 * @throws Exception
	 * @return multitype:string
	 */
	public function BDResultDelete($form, $request){
		$result = 0;
//		if(array_key_exists("staff_type", $form) && array_key_exists("staff_id", $form) && array_key_exists("stime", $form)){
		if(array_key_exists("id", $form)){
			$id = $form["id"];
			// daoの宣言
			$BDResultDao = Application_CommonUtil::getInstance('dao', "BusinessDiscussionResultDao", $this->db);
			// トランザクションスタート
			$this->db->beginTransaction();
			try{
				// 担当者の論理削除
				$BDResultDao->deletBDResult($form["id"]);
				$this->db->commit();
				$result = 1;
			}catch(Exception $e){
				$this->db->rollBack();
				throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
			}
		}
		return $result;
	}

	/**
	 * 商談結果用のバリデーション
	 * @param unknown $form
	 */
	function BDResultValidation($data){

		$validationDict = array(
				"sharing_memo" => array(
					"name" => "共有メモ",
					"length" => 20000,
					"validate" => array(1)
				),
				"company_name" => array(
					"name" => "会社名",
					"length" => 64,
					"validate" => array()
				),
				"staff_name" => array(
					"name" => "先方担当者名",
					"length" => 64,
					"validate" => array()
				),
				"client_service_id" => array(
					"name" => "部署名",
					"length" => 64,
					"validate" => array()
				),
				"executive" => array(
					"name" => "担当者・役職",
					"length" => 20,
					"validate" => array()
				),
				"tel1" => array(
					"name" => "電話番号(市外局番)",
					"length" => 4,
					"validate" => array(2)
				),
				"tel2" => array(
					"name" => "電話番号(市内局番)",
					"length" => 4,
					"validate" => array(2)
				),
				"tel3" => array(
					"name" => "電話番号(加入者番号)",
					"length" => 4,
					"validate" => array(2)
				),
				"fax1" => array(
					"name" => "FAX(市外局番)",
					"length" => 4,
					"validate" => array(2)
				),
				"fax2" => array(
					"name" => "FAX(市内局番)",
					"length" => 4,
					"validate" => array(2)
				),
				"fax3" => array(
					"name" => "FAX(加入者番号)",
					"length" => 4,
					"validate" => array(2)
				),
				"email" => array(
					"name" => "メールアドレス",
					"length" => 256,
					"validate" => array(7)
				),
				"secret_comment" => array(
					"name" => "シークレットメモ",
					"length" => 20000,
					"validate" => array()
				),
				"memo" => array(
					"name" => "メモ",
					"length" => 20000,
					"validate" => array()
				),
		);

		$errorList = executionValidation($data, $validationDict, false);
		return $errorList;

//		return "";
	}

	/**
	 * CSVデータを取得
	 * @return string
	 */
	public function getCsvResult($form) {

		$csvHeaderDict = array(
			'staff_type' => '担当者種別',
			'staff_id' => '担当者ID',
			'client_id' => 'クライアントID',
			'del_flg' => '削除フラグ',
			'next_action' => '次回アクション',
			'possibility' => '商談見込み',
			'sharing_memo' => '共有メモ',
			'secret_comment' => 'シークレットメモ',
			'company_name' => '会社名',
			'staff_name' => '先方担当者名',
			'client_service_id' => '部署名',
			'executive' => '担当者・役職',
			'tel1' => '電話番号（市外局番）',
			'tel2' => '電話番号（市内局番）',
			'tel3' => '電話番号（加入者番号）',
			'fax1' => 'FAX番号（市外局番）',
			'fax2' => 'FAX番号（市内局番）',
			'fax3' => 'FAX番号（加入者番号）',
			'email' => 'メールアドレス',
			'memo' => 'メモ',
			'room_name' => 'ルーム名',
			'stime' => '商談日',
			'download_url' => '画面録画ファイルダウンロードURL',
			'create_date' => '登録日',
			'update_date' => '更新日',
		);

		$tmpl_init = array(
			"template_id" => 0,
			"template_name" => "初期値",
			"result_list" => json_encode(array("ヨミ","ナシ")),
			"next_action_list" => json_encode(array("オンライン商談","訪問")),
		);

		$csvBodyKeys = array_keys($csvHeaderDict);
		$csvHeader   = array_values($csvHeaderDict);

		// ヘッダー項目を作成
		$csvData = "";
		$csvData .= join(",", $csvHeader) . "\n";

		// daoの宣言
		$BDResultDao = Application_CommonUtil::getInstance('dao', "BusinessDiscussionResultDao", $this->db);
		$NegoRsltTmplDao = Application_CommonUtil::getInstance('dao', "NegotiationResultTmplDao", $this->db);

//		$condition = " staff_type = '{$form["staff_type"]}' AND staff_id = {$form["staff_id"]} AND stime = '{$form["stime"]}' ";		// SQLの検索条件を設定
		$condition = " id = '{$form["id"]}' ";		// SQLの検索条件を設定
		// 商談結果データの取得
		$result_list = array();
		$next_action_list = array();
		$csvBodyList = $BDResultDao->getBDResultRow($condition);
		if(!empty($csvBodyList['template_id']) || $csvBodyList['template_id'] == "0") {
			$condition = " template_id = {$csvBodyList['template_id']}";
			// テンプレートから名称取得
			$negoRsltTmpl = $NegoRsltTmplDao->getTmplRow($condition);
			if(empty($negoRsltTmpl)) {
				$result_list = json_decode($tmpl_init["result_list"]);
				$next_action_list = json_decode($tmpl_init["next_action_list"]);
			} else {
				$result_list = json_decode($negoRsltTmpl["result_list"]);
				$next_action_list = json_decode($negoRsltTmpl["next_action_list"]);
			}
		}
		$csvVal = array();
		foreach($csvHeaderDict as $key => $val) {
			if($key == 'next_action') {
				if(array_key_exists($csvBodyList[$key], $next_action_list)) {
					$str = preg_replace('/"/', '""', $next_action_list[$csvBodyList[$key]]);
					$csvVal[] = '"'.$str.'"';
				} else {
					$csvVal[] = "";
				}
			} else if($key == 'possibility') {
				if(array_key_exists($csvBodyList[$key], $result_list)) {
					$str = preg_replace('/"/', '""', $result_list[$csvBodyList[$key]]);
					$csvVal[] = '"'.$str.'"';
				} else {
					$csvVal[] = "";
				}
			} else {
				$str = preg_replace('/"/', '""',$csvBodyList[$key]);
				$csvVal[] = '"'.preg_replace('/\r\n/', '', $str).'"';
			}
		}
		$csvData .= implode($csvVal, ",");
		return $csvData;
	}

	/**
	 * 商談結果に記入されている会社名を取得
	 * @return string
	 */
	public function getCsvCompanyName($form) {
		// daoの宣言
		$BDResultDao = Application_CommonUtil::getInstance('dao', "BusinessDiscussionResultDao", $this->db);

		$condition = " id = '{$form["id"]}' ";		// SQLの検索条件を設定
		// 商談結果データの取得
		$result_memo = array();
		$BusinessTalkResultMemo = $BDResultDao->getBDResultRow($condition);
		$companyName = $BusinessTalkResultMemo['company_name'];

		return $companyName;
	}

}
