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
										"webinar_available_time"				=>"",
										"negotiation_audio_text_remaining_hour" =>"",
										"negotiation_audio_analysis_remaining_hour" =>"0",
										"client_enterprise_code"				=>"",
										"clerk"									=>"",
										"embed_link_domain_list"				=>"",
										"plan"									=>"0",
										"plan_this_month"						=>"0",
										"usage_type"							=>"0",
										"client_type"							=>"0",
										"distribution_channel_client_id"		=>"0",
										"purchasing_client_account_cnt"			=>"0",
										"distributor_salesstaff_name"			=>"",
										"distributor_salesstaff_email"			=>"",
										"distributor_salesstaff_ccemail"		=>"",
										"contract_money"						=>"0",
										"first_payout_staff_cnt"				=>"0",
										"max_payout_staff_cnt"					=>"0",
										"contract_file"							=>null,
										"billing_address"						=>"0",
										"order_date"							=>"0",
										"contract_period_start_date"			=>"",
										"contract_period_end_date"				=>"",
										"start_use_date"						=>"",
										"billing_staff_name"					=>"",
										"billing_staff_email"					=>"",
										"follow_call_date"						=>"",
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
	// プランの定義
	private $plan = array(
			array("id"=>2, "planName"=>"スタンダードプラン", 	"maxStaffCount"=>"10", 		"maxDocumentSize"=>"5368709120"),
			array("id"=>3, "planName"=>"スタンダード20", 		"maxStaffCount"=>"20", 		"maxDocumentSize"=>"5368709120"),
			array("id"=>4, "planName"=>"スタンダード30", 		"maxStaffCount"=>"30", 		"maxDocumentSize"=>"5368709120"),
			array("id"=>7, "planName"=>"スタンダード40", 		"maxStaffCount"=>"40", 		"maxDocumentSize"=>"10737418240"),
			array("id"=>5, "planName"=>"スタンダード50", 		"maxStaffCount"=>"50", 		"maxDocumentSize"=>"10737418240"),
			array("id"=>8, "planName"=>"スタンダード60", 		"maxStaffCount"=>"60", 		"maxDocumentSize"=>"21474836480"),
			array("id"=>9, "planName"=>"スタンダード70", 		"maxStaffCount"=>"70", 		"maxDocumentSize"=>"21474836480"),
			array("id"=>10, "planName"=>"スタンダード80", 		"maxStaffCount"=>"80", 		"maxDocumentSize"=>"21474836480"),
			array("id"=>11, "planName"=>"スタンダード90", 		"maxStaffCount"=>"90", 		"maxDocumentSize"=>"21474836480"),
			array("id"=>12, "planName"=>"スタンダード100", 		"maxStaffCount"=>"100", 		"maxDocumentSize"=>"21474836480"),
			array("id"=>13, "planName"=>"スタンダード110", 		"maxStaffCount"=>"110", 		"maxDocumentSize"=>"32212254720"),
			array("id"=>14, "planName"=>"スタンダード120", 		"maxStaffCount"=>"120", 		"maxDocumentSize"=>"32212254720"),
			array("id"=>15, "planName"=>"スタンダード130", 		"maxStaffCount"=>"130", 		"maxDocumentSize"=>"32212254720"),
			array("id"=>16, "planName"=>"スタンダード140", 		"maxStaffCount"=>"140", 		"maxDocumentSize"=>"32212254720"),
			array("id"=>17, "planName"=>"スタンダード150", 		"maxStaffCount"=>"150", 		"maxDocumentSize"=>"32212254720"),
			array("id"=>18, "planName"=>"スタンダード160", 		"maxStaffCount"=>"160", 		"maxDocumentSize"=>"32212254720"),
			array("id"=>19, "planName"=>"スタンダード170", 		"maxStaffCount"=>"170", 		"maxDocumentSize"=>"32212254720"),
			array("id"=>20, "planName"=>"スタンダード180", 		"maxStaffCount"=>"180", 		"maxDocumentSize"=>"32212254720"),
			array("id"=>21, "planName"=>"スタンダード190", 		"maxStaffCount"=>"190", 		"maxDocumentSize"=>"32212254720"),
			array("id"=>22, "planName"=>"スタンダード200", 		"maxStaffCount"=>"200", 		"maxDocumentSize"=>"32212254720"),
			array("id"=>23, "planName"=>"スタンダード210", 		"maxStaffCount"=>"210", 		"maxDocumentSize"=>"32212254720"),
			array("id"=>6, "planName"=>"スタンダード220", 		"maxStaffCount"=>"220", 		"maxDocumentSize"=>"32212254720"),
			array("id"=>24, "planName"=>"スタンダード230", 		"maxStaffCount"=>"230", 		"maxDocumentSize"=>"32212254720"),
			array("id"=>25, "planName"=>"スタンダード240", 		"maxStaffCount"=>"240", 		"maxDocumentSize"=>"32212254720"),
			array("id"=>26, "planName"=>"スタンダード250", 		"maxStaffCount"=>"250", 		"maxDocumentSize"=>"32212254720"),
			array("id"=>27, "planName"=>"スタンダード260", 		"maxStaffCount"=>"260", 		"maxDocumentSize"=>"32212254720"),
			array("id"=>28, "planName"=>"スタンダード270", 		"maxStaffCount"=>"270", 		"maxDocumentSize"=>"32212254720"),
			array("id"=>29, "planName"=>"スタンダード280", 		"maxStaffCount"=>"280", 		"maxDocumentSize"=>"32212254720"),
			array("id"=>30, "planName"=>"スタンダード290", 		"maxStaffCount"=>"290", 		"maxDocumentSize"=>"32212254720"),
			array("id"=>31, "planName"=>"スタンダード300", 		"maxStaffCount"=>"300", 		"maxDocumentSize"=>"32212254720"),
			array("id"=>32, "planName"=>"スタンダード310", 		"maxStaffCount"=>"310", 		"maxDocumentSize"=>"42949672960"),
			array("id"=>33, "planName"=>"スタンダード320", 		"maxStaffCount"=>"320", 		"maxDocumentSize"=>"42949672960"),
			array("id"=>34, "planName"=>"スタンダード330", 		"maxStaffCount"=>"330", 		"maxDocumentSize"=>"42949672960"),
			array("id"=>35, "planName"=>"スタンダード340", 		"maxStaffCount"=>"340", 		"maxDocumentSize"=>"42949672960"),
			array("id"=>36, "planName"=>"スタンダード350", 		"maxStaffCount"=>"350", 		"maxDocumentSize"=>"42949672960"),
			array("id"=>37, "planName"=>"スタンダード360", 		"maxStaffCount"=>"360", 		"maxDocumentSize"=>"42949672960"),
			array("id"=>38, "planName"=>"スタンダード370", 		"maxStaffCount"=>"370", 		"maxDocumentSize"=>"42949672960"),
			array("id"=>39, "planName"=>"スタンダード380", 		"maxStaffCount"=>"380", 		"maxDocumentSize"=>"42949672960"),
			array("id"=>40, "planName"=>"スタンダード390", 		"maxStaffCount"=>"390", 		"maxDocumentSize"=>"42949672960"),
			array("id"=>41, "planName"=>"スタンダード400", 		"maxStaffCount"=>"400", 		"maxDocumentSize"=>"42949672960"),
			array("id"=>42, "planName"=>"スタンダード410", 		"maxStaffCount"=>"410", 		"maxDocumentSize"=>"42949672960"),
			array("id"=>43, "planName"=>"スタンダード420", 		"maxStaffCount"=>"420", 		"maxDocumentSize"=>"42949672960"),
			array("id"=>44, "planName"=>"スタンダード430", 		"maxStaffCount"=>"430", 		"maxDocumentSize"=>"42949672960"),
			array("id"=>45, "planName"=>"スタンダード440", 		"maxStaffCount"=>"440", 		"maxDocumentSize"=>"42949672960"),
			array("id"=>46, "planName"=>"スタンダード450", 		"maxStaffCount"=>"450", 		"maxDocumentSize"=>"42949672960"),
			array("id"=>47, "planName"=>"スタンダード460", 		"maxStaffCount"=>"460", 		"maxDocumentSize"=>"42949672960"),
			array("id"=>48, "planName"=>"スタンダード470", 		"maxStaffCount"=>"470", 		"maxDocumentSize"=>"42949672960"),
			array("id"=>49, "planName"=>"スタンダード480", 		"maxStaffCount"=>"480", 		"maxDocumentSize"=>"42949672960"),
			array("id"=>50, "planName"=>"スタンダード490", 		"maxStaffCount"=>"490", 		"maxDocumentSize"=>"42949672960"),
			array("id"=>51, "planName"=>"スタンダード500", 		"maxStaffCount"=>"500", 		"maxDocumentSize"=>"42949672960")
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
	 * @return
	 */
	function getClient($form){

		$clientId = $this->escape($form["client_id"]);

		// daoの宣言
		$masterClientDao = Application_CommonUtil::getInstance('dao', "MasterClientDao", $this->db);
		$config = new Zend_Config_Ini(APP_DIR . 'configs/system.ini', "production");

		$result["clientDict"]  = $masterClientDao->getMasterClientRow($clientId, $config->client->staff->daysActiveDeemedAfterLogin, $config->client->contract->daysToBeAlertedContractExpiration);

		if(0 < $result["clientDict"]['distribution_channel_client_id']){
		    $result["distributorDict"]  = $masterClientDao->getMasterClientRow($result["clientDict"]['distribution_channel_client_id']);
		}

		$result["clientTypes"] = $masterClientDao->getClientType();
		$result["plan"] = $this->plan;

		return $result;
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

		// アップロードディレクトリ
		$uploaddirName = "/cmn-contract/";
		$uploaddir = "{$_SERVER['DOCUMENT_ROOT']}{$uploaddirName}";

		// daoの宣言
		$masterClientDao = Application_CommonUtil::getInstance('dao', "MasterClientDao", $this->db);
		$masterStaffDao = Application_CommonUtil::getInstance('dao', "MasterStaffDao", $this->db);
		$result["clientTypes"] = $masterClientDao->getClientType();

		$config = new Zend_Config_Ini(APP_DIR . 'configs/system.ini', "production");
		$result["distributorList"] = $masterClientDao->getDistributorList(null, null, $config->client->contract->daysToBeAlertedContractExpiration, 'client_name', 'ASC');

		$convert_hour = 3600;

		if ($request->isPost()) {
			// 文字起こし時間.
			$form["negotiation_audio_text_time_limit_second"] = $form["negotiation_audio_text_remaining_hour"] == null ? null : $form["negotiation_audio_text_time_limit_second"];
			$form["negotiation_audio_text_time_limit_second"] = $form["negotiation_audio_text_time_limit_second"] * $convert_hour;

			if($form["client_id"]){
				$clientDict = $masterClientDao->getMasterClientRow($form["client_id"]);
				$form["negotiation_audio_text_time_limit_second"] = $form["negotiation_audio_text_remaining_hour"] == null ? $form["negotiation_audio_text_remaining_hour"] * $convert_hour : $clientDict["negotiation_audio_text_time_limit_second"];
				$form["negotiation_audio_text_time_limit_second"] = $form["negotiation_audio_text_time_limit_second"];
			}

			// 追加購入分文字起こし時間.
			$form["negotiation_audio_text_add_time_limit_second"] = $form["negotiation_audio_text_add_time"] == null ? null : $form["negotiation_audio_text_add_time_limit_second"];
			$form["negotiation_audio_text_add_time_limit_second"] = $form["negotiation_audio_text_add_time"] * $convert_hour;

			// 音声分析時間.
			$form["negotiation_audio_analysis_time_limit_second"] = $form["negotiation_audio_analysis_remaining_hour"] == null ? null : $form["negotiation_audio_analysis_time_limit_second"];
			$form["negotiation_audio_analysis_time_limit_second"] = $form["negotiation_audio_analysis_time_limit_second"] * $convert_hour;

			if($form["client_id"]){
				$clientDict = $masterClientDao->getMasterClientRow($form["client_id"]);
				$form["negotiation_audio_analysis_time_limit_second"] = $form["negotiation_audio_analysis_remaining_hour"] == null ? $form["negotiation_audio_analysis_remaining_hour"] * $convert_hour : $clientDict["negotiation_audio_analysis_time_limit_second"];
				$form["negotiation_audio_analysis_time_limit_second"] = $form["negotiation_audio_analysis_time_limit_second"];
			}

			// 追加購入分音声分析時間.
			$form["negotiation_audio_analysis_add_time_limit_second"] = $form["negotiation_audio_analysis_add_time"] == null ? null : $form["negotiation_audio_analysis_add_time_limit_second"];
			$form["negotiation_audio_analysis_add_time_limit_second"] = $form["negotiation_audio_analysis_add_time"] * $convert_hour;

			// セッション取得
			$session = Application_CommonUtil::getSession(self::IDENTIFIER);
			// 登録処理を行う
			// クライアント情報のバリデーションを実行する
			$form["validClientId"] = null;
			if(array_key_exists("client_id", $session->clientRegist["clientDict"])){
				// 現在編集中のクライアントのIDを渡す
				$form["validClientId"] = $session->clientRegist["clientDict"]["client_id"];
			}

			$clientDict = array_merge($session->clientRegist["clientDict"], $form);
			$errorList = $this->masterClientValidation($clientDict);

			if(isset($_FILES['contract_file']) && 0 < $_FILES['contract_file']['size'] ) {
			    // アップロードファイルがある場合、拡張子チェック
			    if(!preg_match('/(gif|jpg|png|docx?|pptx?|xlsx?|pdf)/i', preg_replace('/(.+)\.(.+)/', '$2', $_FILES['contract_file']["name"]), $matches)) {
			        $errorList["contract_file"] = 'アップロードファイルの拡張子はdoc/docx/ppt/pptx/xls/xlsx/pdf/gif/jpg/pngのみです';
			    }
			}

			if(count($errorList) == 0 ){
				// 画面で設定した値をその他の情報とマージする

				// 新規作成フラグを設定する
				$registNewFlg = 0;
				if(!array_key_exists("client_id", $clientDict)){
					$registNewFlg = 1;
				}

				// ウェビナーの追加時間は事前に登録されているものと、追加された値を入れる
				if($form["client_id"]){
					$addWebinarTime = $masterClientDao->getAddWebinarTime($form["client_id"]);
					$clientDict["webinar_add_time"] = $addWebinarTime["webinar_add_time"] + $clientDict["webinar_add_time"];
				}

				// トランザクションスタート
				$this->db->beginTransaction();
				try{

					// クライアントの登録処理
					$clientId = $masterClientDao->setMasterClient($clientDict, $this->user['staff_type']=="AA");

					// 契約書ファイルの保存.
                    $file = $_FILES['contract_file'];
                    if(count($file) != 0 && $file['error'] == 0) {
					    error_log(json_encode($file));

					    // 以前の契約書消去.
					    if(isset($clientDict['contract_file'])){
					        unlink($uploaddir.$clientDict['contract_file']);
					    }

					    $tmp = $file['tmp_name'];
					    $ext = preg_replace('/(.+)\.(.+)/', '$2', $file['name']);
						$time = time();
						$hash = md5('Wi6H7wvx'+$clientId+$time);
						$uploadfile = $uploaddir . $hash . "." . strtolower($ext);

					    if(move_uploaded_file($tmp, $uploadfile)) {

				            // Officeファイルかpdfファイル
				            if(preg_match('/(docx?|pptx?|xlsx?)/i', $ext, $matches)) {
				                // PDF変換開始ログ
				                error_log("change pdf begin");
				                // オフィスファイルをpdfファイル
				                $res = exec('/usr/local/bin/mstopdf.sh ' . $uploadfile , $output, $status);
				                if($status !== 0) {
				                    error_log(json_encode($status));
				                    error_log(json_encode($output));
				                }
				                // アップロードファイル削除
				                unlink($uploadfile);
				            }
				            $masterClientDao->updateMasterClientContractFile($clientId, $hash. "." . strtolower($ext));
					    }
					}
					$clientDict["clientId"] = $clientId;

					$this->db->commit();
					// プラン変更が行われている可能性があるので、セッションを変更する
					$this->user['plan_this_month'] = $clientDict['plan_this_month'];
					// 電子契約の二要素認証のセッションを更新する
					$this->user['two_factor_authenticate_flg'] = $clientDict["two_factor_authenticate_flg"];
					Zend_Auth::getInstance()->getStorage()->write($this->user);
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
			$condition = " staff_type = 'AA' ";		// SQLの検索条件を設定
			$aaStaffList = $masterStaffDao->getSelectMasterStaffAllList($condition, "staff_id", "asc");
			// 選択中のアイドマ担当者情報
			$session->clientRegistAAStaffIds = explode(",", $result["clientDict"]["aa_staff_id_list"]);
			// 取得したデータをjsonデータに変換し設定する
			$result["aaStaffListJson"] = json_encode($aaStaffList);
			$result["checkAAStaffListJson"] = json_encode($session->clientRegistAAStaffIds);
			// プランを設定する
			$result["plan"] = $this->plan;
			// AAアカウント以外はライトプラン10を表示させない
			// if($form["plan_select_type"] != "AA") {
			// 	array_splice($result["plan"], 1, 1);
			// }
			// 担当者が追加可能か判定用データを設定する
			if(array_key_exists("client_id", $form) && $form["client_id"]){
				// 翌月のプランが当月プランより下のランクの場合は、来月のプランを使用し判定する
				// 2021.1.15更新　プラン変更は変更時よりすぐ適用となる、変更後の当月プランが翌月プランより上のランクの場合は当月プランを見て判定する
				if($clientDict["plan"] < $clientDict["plan_this_month"]){
					$result["addStaffFlg"] = $this->checkAddStaff($form["client_id"], $clientDict["plan_this_month"]);
				}else{
					$result["addStaffFlg"] = $this->checkAddStaff($form["client_id"], $clientDict["plan"]);
				}
			}else{
				$result["addStaffFlg"] = false;
			}
		}

		// 文字起こし時間管理.
		// クライアント表示用
		$result["clientDict"]['negotiation_audio_text_time_limit_hour'] = floor($result["clientDict"]["negotiation_audio_text_time_limit_second"] / $convert_hour);
		$result["clientDict"]["negotiation_audio_text_time_limit_minute"] = floor(($result["clientDict"]["negotiation_audio_text_time_limit_second"] % $convert_hour) / 60);
		// 書き換え用(秒だとわかり難いので時間に換算(保存時またsecondに戻している)).
		$result["clientDict"]["negotiation_audio_text_time_limit_second"] = $result["clientDict"]["negotiation_audio_text_time_limit_second"] / $convert_hour;

		// CEアカウントで追加時間を時、分に分けて使用
		$result["clientDict"]['negotiation_audio_text_add_time_limit_hour'] = floor($result["clientDict"]["negotiation_audio_text_add_time_limit_second"] / $convert_hour);
		$result["clientDict"]["negotiation_audio_text_add_time_limit_minute"] = floor(($result["clientDict"]["negotiation_audio_text_add_time_limit_second"] % $convert_hour) / 60);

		// 追加時間(AA表示に使用)
		$result["clientDict"]["negotiation_audio_text_add_time_limit_second"] = $result["clientDict"]["negotiation_audio_text_add_time_limit_second"] / $convert_hour;
		// デフォルト時間 + 追加時間の残り時間(AA表示に使用)
		$result["clientDict"]["negotiation_audio_text_total_remain_time_minute_aa"] = $result["clientDict"]["negotiation_audio_text_time_limit_second"] + $result["clientDict"]["negotiation_audio_text_add_time_limit_second"];
		// 追加時間(AAの表示に利用)
		$result["clientDict"]["negotiation_audio_text_add_time"] = $result["clientDict"]["negotiation_audio_text_add_time"];
		// 追加時間の残りの時間(AAの表示に利用)
		$result["clientDict"]["negotiation_audio_text_add_time_limit_second"] = $result["clientDict"]["negotiation_audio_text_add_time_limit_second"];

		// 残りの時間をデフォルト分と追加分を足したもの(時、分を分ける)
		$result["clientDict"]['negotiation_audio_text_total_remain_time_hour'] = $result["clientDict"]['negotiation_audio_text_time_limit_hour'] + $result["clientDict"]['negotiation_audio_text_add_time_limit_hour'];
		$result["clientDict"]["negotiation_audio_text_total_remain_time_minute"] = $result["clientDict"]["negotiation_audio_text_time_limit_minute"] + $result["clientDict"]["negotiation_audio_text_add_time_limit_minute"];

		// 音声分析 時間管理.
		// クライアント表示用
		$result["clientDict"]['negotiation_audio_analysis_time_limit_hour'] = floor($result["clientDict"]["negotiation_audio_analysis_time_limit_second"] / $convert_hour);
		$result["clientDict"]["negotiation_audio_analysis_time_limit_minute"] = floor(($result["clientDict"]["negotiation_audio_analysis_time_limit_second"] % $convert_hour) / 60);
		// 書き換え用(秒だとわかり難いので時間に換算(保存時またsecondに戻している)).
		$result["clientDict"]["negotiation_audio_analysis_time_limit_second"] = $result["clientDict"]["negotiation_audio_analysis_time_limit_second"] / $convert_hour;

		// CEアカウントで追加時間を時、分に分けて使用
		$result["clientDict"]['negotiation_audio_analysis_add_time_limit_hour'] = floor($result["clientDict"]["negotiation_audio_analysis_add_time_limit_second"] / $convert_hour);
		$result["clientDict"]["negotiation_audio_analysis_add_time_limit_minute"] = floor(($result["clientDict"]["negotiation_audio_analysis_add_time_limit_second"] % $convert_hour) / 60);

		// 追加時間(AA表示に使用)
		$result["clientDict"]["negotiation_audio_analysis_add_time_limit_second"] = $result["clientDict"]["negotiation_audio_analysis_add_time_limit_second"] / $convert_hour;
		// デフォルト時間 + 追加時間の残り時間(AA表示に使用)
		$result["clientDict"]["negotiation_audio_analysis_total_remain_time_minute_aa"] = $result["clientDict"]["negotiation_audio_analysis_time_limit_second"] + $result["clientDict"]["negotiation_audio_analysis_add_time_limit_second"];
		// 追加時間(AAの表示に利用)
		$result["clientDict"]["negotiation_audio_analysis_add_time"] = $result["clientDict"]["negotiation_audio_analysis_add_time"];
		// 追加時間の残りの時間(AAの表示に利用)
		$result["clientDict"]["negotiation_audio_analysis_add_time_limit_second"] = $result["clientDict"]["negotiation_audio_analysis_add_time_limit_second"];

		// 残りの時間をデフォルト分と追加分を足したもの(時、分を分ける)
		$result["clientDict"]['negotiation_audio_analysis_total_remain_time_hour'] = $result["clientDict"]['negotiation_audio_analysis_time_limit_hour'] + $result["clientDict"]['negotiation_audio_analysis_add_time_limit_hour'];
		$result["clientDict"]["negotiation_audio_analysis_total_remain_time_minute"] = $result["clientDict"]["negotiation_audio_analysis_time_limit_minute"] + $result["clientDict"]["negotiation_audio_analysis_add_time_limit_minute"];

		return $result;
	}
	/**
	 * 販売店一覧を取得する
	 * @param unknown $form
	 * @param unknown $screenSession
	 * @return Application_Pager
	 */
	function getDistributorList($form, &$screenSession){
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

		$filterList = array();
	    if(array_key_exists("active", $form) && $form['active'] == 'on'){
			$filterList[] = '(is_expiration = 0 AND is_near_expiration = 0)';
	    }
	    if(array_key_exists("near_expiration", $form) && $form['near_expiration'] == 'on'){
			$filterList[] = '(is_expiration = 0 AND is_near_expiration = 1)';
	    }
	    if(array_key_exists("expiration", $form) && $form['expiration'] == 'on'){
			$filterList[] = '(is_expiration = 1)';
	    }
	    $filter = implode(" OR ", $filterList);

	    // 検索実施
	    $config = new Zend_Config_Ini(APP_DIR . 'configs/system.ini', "production");
	    $masterClientList = $masterClientDao->getDistributorList($condition, $filter, $config->client->contract->daysToBeAlertedContractExpiration, $screenSession->order, $screenSession->ordertype , $screenSession->page, $screenSession->pagesize);
		$masterClientCount = $masterClientDao->getDistributorList($condition, $filter, $config->client->contract->daysToBeAlertedContractExpiration, $screenSession->order, $screenSession->ordertype);

	    // ページャ設定
	    $list = new Application_Pager(array(
	            "itemData" => $masterClientList,			// リスト
	            "itemCount" => count($masterClientCount),	// カウント
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
	 * 指定した販売店が販売した顧客一覧を取得する
	 * @param unknown $form
	 * @param unknown $screenSession
	 * @return Application_Pager
	 */
	function getDistributorClientList($form, &$screenSession){
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
	    $conditionList = array();
	    if($screenSession->free_word != ""){
	        $escapeText = $this->escape($screenSession->free_word);
	        $condition = " AND (client_id like '%{$escapeText}%' OR client_name like '%{$escapeText}%' OR CONCAT(AES_DECRYPT(client_staffleaderfirstname,@key),AES_DECRYPT(client_staffleaderlastname,@key)) like '%{$escapeText}%' OR CONCAT(client_tel1, client_tel2, client_tel3) like '%{$escapeText}%' OR CONCAT(client_tel1, '-', client_tel2, '-', client_tel3) like '%{$escapeText}%' OR client_address like '%{$escapeText}%' OR client_staffleaderemail like '%{$escapeText}%')";
	    }

		$filterList = array();
	    if(array_key_exists("active", $form) && $form['active'] == 'on'){
			$filterList[] = '(0 < active_staff_count)';
	    }
	    if(array_key_exists("not_active", $form) && $form['not_active'] == 'on'){
			$filterList[] = '(0 = active_staff_count)';
	    }
	    if(array_key_exists("valid", $form) && $form['valid'] == 'on'){
			$filterList[] = '(is_expiration = 0 AND is_near_expiration = 0)';
	    }
	    if(array_key_exists("near_expiration", $form) && $form['near_expiration'] == 'on'){
			$filterList[] = '(is_expiration = 0 AND is_near_expiration = 1)';
	    }
	    if(array_key_exists("expiration", $form) && $form['expiration'] == 'on'){
			$filterList[] = '(is_expiration = 1)';
	    }
	    $filter = implode(" OR ", $filterList);

	    // 検索実施
	    $config = new Zend_Config_Ini(APP_DIR . 'configs/system.ini', "production");
	    $masterClientList = $masterClientDao->getDistributorClientList($form, $condition, $filter, $screenSession->order, $screenSession->ordertype , $screenSession->page, $screenSession->pagesize,  $config->client->staff->daysActiveDeemedAfterLogin, $config->client->contract->daysToBeAlertedContractExpiration);
		$masterClientCount = $masterClientDao->getDistributorClientList($form, $condition, $filter, $screenSession->order, $screenSession->ordertype, null, null, $config->client->staff->daysActiveDeemedAfterLogin, $config->client->contract->daysToBeAlertedContractExpiration);
	    // ページャ設定
	    $list = new Application_Pager(array(
	            "itemData" => $masterClientList,			// リスト
	            "itemCount" => count($masterClientCount),	// カウント
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
				$masterStaffDao  = Application_CommonUtil::getInstance('dao', "MasterStaffDao", $this->db);

				$collaborativeServicesProvidedDataDao = Application_CommonUtil::getInstance('dao', "CollaborativeServicesProvidedDataDao", $this->db);
				// トランザクションスタート
				$this->db->beginTransaction();
				try{
					// 担当者の論理削除
					$masterCLientDao->deletClient($clientId);

					foreach($masterStaffDao->getSelectMasterStaffAllList('client_id = '.$clientId, 'staff_id', null) as $staff) {
						$collaborativeServicesProvidedDataDao->deletStaff($staff["staff_type"], $staff["staff_id"]);
					}

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
		var_dump($form);
		// 戻り値の宣言
		$result = array();
		$result["errorList"] = array();
		// daoの宣言
		$masterClientDao = Application_CommonUtil::getInstance('dao', "MasterClientDao", $this->db);
				// 画面で設定した値をその他の情報とマージする
				$clientDict = $form;
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
						"client_fax1" 							=>array("name" =>"FAX番号（市外局番）",		"length" => 5, 		"validate" => array(2)),
						"client_fax2" 							=>array("name" =>"FAX番号（市内局番）", 		"length" => 5, 		"validate" => array(2)),
						"client_fax3" 							=>array("name" =>"FAX番号（加入者番号）", 		"length" => 5, 		"validate" => array(2)),
						"client_staffleaderfirstname" 			=>array("name" =>"代表者氏", 										"validate" => array(1)),
						// "client_staffleaderlastname" 			=>array("name" =>"代表者名", 									 	"validate" => array(1)),
						"client_staffleaderemail" 				=>array("name" =>"代表者メールアドレス", 		"length" => 256,    "validate" => array(1,7)),
						"client_comment" 						=>array("name" =>"備考", 		            "length" => 200,	"validate" => array()),
						"client_homepage" 						=>array("name" =>"ホームページURL", 			"length" => 100, 	"validate" => array(8)),
						"aa_staff_id_list" 						=>array("name" =>"アイドマ担当者", 				"length" => 100, 	"validate" => array(13)),
						// "webinar_available_time" 				=>array("name" =>"ウェビナー可能時間", 			"length" => 8, 	"validate" => array(17)),
						"salescrowd_client_id" 					=>array("name" =>"SalesCrowdクライアントID	", 				"length" => 8, 	"validate" => array(2)),
						"client_type" 						    =>array("name" =>"クライアントタイプ", 			   "length" => 1, 	"validate" => array(5)),
						"distribution_channel_client_id" 		=>array("name" =>"購入経路", 			           "length" => 11,  "validate" => array(5)),
						"purchasing_client_account_cnt" 		=>array("name" =>"購入企業アカウント数(ID数)", 	   "length" => 11,  "validate" => array(2)),
						"distributor_salesstaff_name" 			=>array("name" =>"代理店営業担当者", 			                    "validate" => array()),
						"distributor_salesstaff_email" 			=>array("name" =>"代理店営業担当メールアドレス",    "length" => 256, "validate" => array(7)),
						"distributor_salesstaff_ccemail" 		=>array("name" =>"代理店営業担当 CCメールアドレス", "length" => 256, "validate" => array(7)),
						"contract_money" 						=>array("name" =>"契約した金額", 			        "length" => 11, "validate" => array(2)),
						"first_payout_staff_cnt" 				=>array("name" =>"初回発行アカウント数", 		    "length" => 11, "validate" => array(2)),
						"max_payout_staff_cnt" 					=>array("name" =>"MAXアカウント数", 			    "length" => 11, "validate" => array(2)),
						"contract_file" 					    =>array("name" =>"契約書", 										"validate" => array()),
						"billing_address" 						=>array("name" =>"請求書送付先住所",				"length" => 256,"validate" => array()),
						"order_date" 						    =>array("name" =>"受注日", 											"validate" => array(6)),
						"contract_period_start_date" 			=>array("name" =>"契約期間 開始日", 								"validate" => array(6)),
						"contract_period_end_date" 				=>array("name" =>"契約期間 終了日", 								"validate" => array(6)),
						"start_use_date" 						=>array("name" =>"使用開始日", 										"validate" => array(6)),
						"billing_staff_name" 					=>array("name" =>"請求先担当者名", 									"validate" => array()),
						"billing_staff_email" 					=>array("name" =>"請求先担当者メールアドレス", 	   "length" => 256, "validate" => array(7)),
						"follow_call_date" 						=>array("name" =>"フォローコール開始希望日", 						"validate" => array(6)),
				);
		$errorList = executionValidation($data, $validationDict);
		// プランのバリデーション（共通バリデーションでは実施できないチェックを行う）
		$planIds = array();
		$planDict = array();
		foreach($this->plan as $plan){
			$planIds[] = $plan["id"];
			$planDict[$plan["id"]] = $plan;
		}
		if(!in_array($data["plan"], $planIds)){
			$errorList[] = array("plan"=>"プランの値が不正です。");
		}else{
			// 新規登録時は人数、容量チェックを行わない
			if(!is_null($data["validClientId"])){
				// 登録予定プラン
				$nextPlan = $planDict[$data["plan"]];
				// アカウント数チェック（変更後のプランの場合、アカウント数があふれていないかチェック）
				// 現在登録済みの担当者数を取得する
				$masterStaffDao = Application_CommonUtil::getInstance('dao', "MasterStaffDao", $this->db);
				$activeStaffCount = $masterStaffDao->getActiveStaffCount($data["validClientId"]);
				if($nextPlan["maxStaffCount"] < $activeStaffCount){
					$errorList[] = array("over_account"=>"{$nextPlan["planName"]}は最大アカウント数が{$nextPlan["maxStaffCount"]}人となります。ユーザアカウント一覧よりアカウント削除して下さい。");
				}
				// 資料の容量チェック（変更後のプランの場合、資料保存容量を超えていないかチェック）
				$materialDao = Application_CommonUtil::getInstance('dao', "MaterialDao", $this->db);
				$allMaterialSize = $materialDao->allMaterialSize($data["validClientId"]);
				if($nextPlan["maxDocumentSize"] < $allMaterialSize){
					// 登録予定プランの資料保存サイズより、現在登録中の資料サイズが大きい場合はエラーとする
					$adminModel = Application_CommonUtil::getInstance("model", "AdminModel", $this->db);
					$errorList[] = array("over_material"=>"{$nextPlan["planName"]}は最大容量が{$adminModel->convertByte2Str($nextPlan["maxDocumentSize"])}となります。資料ファイル一覧より不要な資料を削除して下さい。");
				}
			}
			// 契約期間の入力チェック (※終了日が空白ではない時のみ)
			if ($this->user['staff_type']=="AA" && $data["contract_period_end_date"] && ($data["contract_period_start_date"] >  $data["contract_period_end_date"])) {
				$errorList[] = array("period"=>"契約期間の開始日は終了日より前の日付を入力してください。");
			}
		}
		return $errorList;
	}
	/**
	 * クライアントのプランを元に担当者を追加できるか判定する
	 * staffListActionから直接呼ばれるので、publicとする
	 * @param unknown $clientId
	 * @param unknown $checkPlan
	 * @return boolean
	 */
	public function checkAddStaff($clientId, $checkPlan){
		// 現在のプランから最大登録可能担当者数を取得する
		$maxStaffCount = 0;
		foreach($this->plan as $plan){
			if($plan["id"] == $checkPlan){
				$maxStaffCount = $plan["maxStaffCount"];
				break;
			}
		}
		// 現在登録済みの担当者数を取得する
		$masterStaffDao = Application_CommonUtil::getInstance('dao', "MasterStaffDao", $this->db);
		$activeStaffCount = $masterStaffDao->getActiveStaffCount($clientId);
		// 戻り値保存用
		$result = false;
		if($maxStaffCount > $activeStaffCount){
			// 最大登録数より、現在の担当者数が少なければ登録可能とする
			$result = true;
		}
		return $result;
	}
	/**
	 * プランのIDを元にファイル最大登録サイズを取得する
	 * @param unknown $clientId
	 */
	public function getMaxDocumentSize($planThisMonthId){
		// 戻り値
		$result = 0;
		// ファイル最大登録サイズを特定する
		foreach($this->plan as $plan){
			if($plan["id"] == $planThisMonthId){
				$result = $plan["maxDocumentSize"];
				break;
			}
		}
		return $result;
	}

	/**
	 * クライアント情報更新（文字起こし時間）
	 * @param unknown $form
	 */
	public function updatenegotiationAudioTextTimeLimitSecond($clientId, $form){

		// 不正行為の可能性.
		if($form['time'] < 1) {
			return;
		}

		// daoの宣言
		$masterClientDao = Application_CommonUtil::getInstance('dao', "MasterClientDao", $this->db);
		$masterClientDao->updatenegotiationAudioTextTimeLimitSecond($clientId, $form['time']);

	}
	/**
	 * クライアント情報更新（文字起こし時間 即時反映）
	 * @param unknown $form
	 */
	public function updateNegotiationAudioTextTimeLimitSecondImmediately($form){

		$result = array();
		$result["errorList"] = array();

		try {
			$clientId = $form['clientId'];
			$second = $form['inputTime'] * 3600;

			// daoの宣言
			$masterClientDao = Application_CommonUtil::getInstance("dao", "MasterClientDao", $this->db);
			if($clientId){

				$clientDict = $masterClientDao->getMasterClientRow($clientId);

				if ($clientDict["negotiation_audio_text_remaining_hour"] && intval($clientDict["negotiation_audio_text_remaining_hour"]) === 0
					&& !(floatval($form['inputTime']) < 0)) {
					$masterClientDao->update(["negotiation_audio_text_remaining_hour" => $form['inputTime']], "client_id = {$clientId}"); // 時間
					$masterClientDao->update(["negotiation_audio_text_time_limit_second" => $second], "client_id = {$clientId}"); // 秒数
					
					// 処理結果（0=失敗, 1=成功）
					$result["status"] = '1';
				} else {
					// バリデーション 基本契約時間が有 かつ 0 以外 入力値がマイナスの場合（フロントでも制御あり）は弾く （不正アクセス対策）
					$result["validationError"] = true;
				}
			}
		} catch(Exception $e) {
			$result["status"] = "0";
			$result["errorList"] = $e->getMessage();
			error_log($e->getMessage());
		}

		return $result;
	}

	/**
	 * クライアント情報更新（音声分析時間）
	 * @param unknown $form
	 */
	public function updatenegotiationAudioAnalysisTimeLimitSecond($clientId, $form){

		// 不正行為の可能性.
		if($form['time'] < 1) {
			return;
		}

		// daoの宣言
		$masterClientDao = Application_CommonUtil::getInstance('dao', "MasterClientDao", $this->db);
		$masterClientDao->updatenegotiationAudioAnalysisTimeLimitSecond($clientId, $form['time']);

	}
	/**
	 * クライアント情報更新（音声分析時間 即時反映）
	 * @param unknown $form
	 */
	public function updateNegotiationAudioAnalysisTimeLimitSecondImmediately($form){

		$result = array();
		$result["errorList"] = array();
		
		try {
			$clientId = $form['clientId'];
			$second = $form['inputTime'] * 3600;

			// daoの宣言
			$masterClientDao = Application_CommonUtil::getInstance("dao", "MasterClientDao", $this->db);
			if($clientId){

				$clientDict = $masterClientDao->getMasterClientRow($clientId);

				if ($clientDict["negotiation_audio_analysis_remaining_hour"] && intval($clientDict["negotiation_audio_analysis_remaining_hour"]) === 0
					&& !(floatval($form['inputTime']) < 0)) {
					$masterClientDao->update(["negotiation_audio_analysis_remaining_hour" => $form['inputTime']], "client_id = {$clientId}"); // 時間
					$masterClientDao->update(["negotiation_audio_analysis_time_limit_second" => $second], "client_id = {$clientId}"); // 秒数
					
					// 処理結果（0=失敗, 1=成功）
					$result["status"] = '1';
				} else {
						// バリデーション 基本契約時間が有 かつ 0 以外 入力値がマイナスの場合（フロントでも制御あり）は弾く （不正アクセス対策）
					$result["validationError"] = true;
				}
			}
		} catch(Exception $e) {
			$result["status"] = "0";
			$result["errorList"] = $e->getMessage();
			error_log($e->getMessage());
		}

		return $result;
	}

	/**
	 * クライアント情報更新
	 * @param unknown $form
	 */
	public function updateNegotiationRoomType($form) {
		$result = array();
		$result["status"] = '1';
		$result["errorList"] = array();
		// daoの宣言
		$masterClientDao = Application_CommonUtil::getInstance('dao', "MasterClientDao", $this->db);
		// トランザクションスタート
		$this->db->beginTransaction();
		try{
			foreach($form["client_id"] as $id) {
				$masterClientDao->updateClientNegotiationRoomType($id, $form["negotiation_room_type"]);
			}
			$this->db->commit();
		}catch(Exception $e){
			$result["status"] = "0";
			$this->db->rollBack();
			throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
		}
		return $result;
	}
}
